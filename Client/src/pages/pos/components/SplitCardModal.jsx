import React, { useState, useMemo } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { setupStripeElements, processStripePayment } from '@/utils/stripeUtils';
import { Button } from '@/components/ui';

function InnerSplitCardModal({ split, onCancel, onPaid, restaurantId, pendingOrderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setCardError(null);
    try {
      const cardEl = elements.getElement(CardElement);
      if (!cardEl) throw new Error('Card not found');
      const { error, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card: cardEl });
      if (error) throw error;
      // Prepare metadata; include pendingOrderId and splitId if present
      const metadata = { pendingOrderId: pendingOrderId || null, splitId: split?.id || null, restaurantId };
      const res = await processStripePayment(paymentMethod.id, Number(split.amount || 0), metadata);
      if (!res) throw new Error('Invalid response from payment');
      if (res.success) {
        onPaid({ success: true, paymentIntentId: res.paymentIntentId });
        return;
      }
      if (res.requiresAction && res.clientSecret) {
        const confirm = await stripe.confirmCardPayment(res.clientSecret, { payment_method: paymentMethod.id });
        if (confirm.error) throw confirm.error;
        onPaid({ success: true, paymentIntentId: confirm.paymentIntent.id });
        return;
      }
      throw new Error(res.message || 'Card payment failed');
    } catch (err) {
      console.error('Split card pay failed', err);
      setCardError(err.message || 'Payment failed');
      onPaid({ success: false, error: err.message || 'Payment failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pay Split</h3>
          <button onClick={onCancel} className="text-gray-600">✕</button>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500">{split?.meta?.person || split?.person || 'Split'}</div>
          <div className="text-xl font-semibold">${Number(split?.amount || 0).toFixed(2)}</div>
        </div>
        <div className="mb-4">
          <label className="text-sm text-gray-700 block mb-2">Card</label>
          <div className="p-3 border rounded bg-gray-50"><CardElement /></div>
          {cardError && <div className="text-xs text-red-600 mt-2">{cardError}</div>}
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handlePay} disabled={!stripe || !elements || isProcessing}>{isProcessing ? 'Processing...' : 'Pay'}</Button>
        </div>
      </div>
    </div>
  );
}

export default function SplitCardModal(props) {
  const { split, onPaid, onCancel, restaurantId, pendingOrderId } = props;
  const { stripePromise, elementsOptions } = useMemo(() => setupStripeElements(), []);
  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <InnerSplitCardModal split={split} onCancel={onCancel} onPaid={onPaid} restaurantId={restaurantId} pendingOrderId={pendingOrderId} />
    </Elements>
  );
}
