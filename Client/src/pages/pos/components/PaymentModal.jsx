import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/constants/paymentConstants';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { setupStripeElements, processStripePayment, createStripePaymentLink, generateQRCode } from '@/utils/stripeUtils';
import { Button } from '@/components/ui';
import BillSplitModal from './BillSplitModal';
import SplitCardModal from './SplitCardModal';

const StripeCardSection = React.memo(function StripeCardSection({ cardRef, visible = true, onError, onComplete, options }) {
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => {
    if (!stripe || !elements) return;
    cardRef.current = {
      stripe,
      elements,
      createPaymentMethod: async () => {
        const cardEl = elements.getElement(CardElement);
        if (!cardEl) throw new Error('Card element not found');
        const { paymentMethod, error } = await stripe.createPaymentMethod({ type: 'card', card: cardEl });
        if (error) throw error;
        return paymentMethod;
      },
    };
    return () => { if (cardRef) cardRef.current = null; };
  }, [stripe, elements, cardRef]);
  return (
    <div style={visible ? {} : { visibility: 'hidden', height: 48 }}>
      <CardElement options={options} onChange={(e) => { if (e?.error && onError) onError(e.error.message); if (onComplete) onComplete(!!e.complete); }} />
    </div>
  );
});

export default function PaymentModal({
  open = false,
  onOpenChange = () => {},
  total = 0,
  cart = [],
  restaurantId = '',
  customerName = 'Guest',
  customerInfo = null,
  orderNotes = '',
  onClose = () => {},
  onComplete = null,
  onCompletePayment = null,
  isProcessing: propIsProcessing = false,
  initialSplitPayments = null,
  printOnCheckout = true,
  setPrintOnCheckout = () => {},
}) {
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [isSplit, setIsSplit] = useState(false);
  const [splitPayments, setSplitPayments] = useState([{ id: `split_1`, method: PAYMENT_METHODS.CASH, amount: Number(total || 0), person: 'Split 1', status: 'pending', paymentDetails: null }]);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [bankTransferInfo, setBankTransferInfo] = useState({ bankName: '', accountNumber: '' });
  const [cardError, setCardError] = useState(null);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processing = propIsProcessing || isProcessing;
  const cardRef = useRef(null);
  const cardElementOptions = useMemo(() => ({ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } }, invalid: { color: '#9e2146' } } }), []);
  const { stripePromise, elementsOptions } = useMemo(() => setupStripeElements(), []);
  const change = receivedAmount ? (parseFloat(receivedAmount) - Number(total || 0)) : 0;

  const [isBillSplitOpen, setIsBillSplitOpen] = useState(false);
  const [activeSplitIndex, setActiveSplitIndex] = useState(null);
  const [splitCardModalIndex, setSplitCardModalIndex] = useState(null);
  const splitModalResolveRef = useRef(null);

  const handleSplitModalPaid = (result) => {
    setSplitCardModalIndex(null);
    if (splitModalResolveRef.current) {
      splitModalResolveRef.current(result);
      splitModalResolveRef.current = null;
    }
  };

  const handleSplitModalCancel = () => {
    setSplitCardModalIndex(null);
    if (splitModalResolveRef.current) {
      splitModalResolveRef.current({ success: false, error: 'cancelled' });
      splitModalResolveRef.current = null;
    }
  };

  useEffect(() => { if (paymentMethod !== PAYMENT_METHODS.STRIPE) { setIsCardComplete(false); setCardError(null); } }, [paymentMethod]);
  useEffect(() => {
    if (initialSplitPayments && Array.isArray(initialSplitPayments) && initialSplitPayments.length > 0) {
      setSplitPayments(initialSplitPayments);
      setIsSplit(true);
    }
  }, [initialSplitPayments]);

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    try {
      const payload = { restaurantId, customerName, items: cart.map((c) => ({ name: c.name, quantity: c.quantity, unitPrice: Number(c.price || 0) })), total };
      const { url } = await createStripePaymentLink(payload);
      const img = generateQRCode(url);
      setQrImage(img);
    } catch (err) { console.error('QR create failed', err); alert('Failed to create payment link'); } finally { setIsGeneratingQR(false); }
  };

  const handleComplete = async () => {
    if (paymentMethod === PAYMENT_METHODS.CASH && (!receivedAmount || Number(receivedAmount) < Number(total || 0))) return;
    setIsProcessing(true);
    try {
      if (isSplit) {
        const ok = await payAllSplits();
        if (!ok) { setIsProcessing(false); alert('Not all split payments completed - order not finalized.'); return; }
        const completeFn = onComplete || onCompletePayment;
        if (completeFn) await completeFn(PAYMENT_METHODS.SPLIT, splitPayments);
        onOpenChange(false);
        onClose();
      }
      else if (paymentMethod === PAYMENT_METHODS.STRIPE) {
        if (!cardRef.current) { alert('Card not ready'); setIsProcessing(false); return; }
        const pm = await cardRef.current.createPaymentMethod();
        const res = await processStripePayment(pm.id, Number(total || 0));
        if (res.success) {
          const completeFn = onComplete || onCompletePayment;
          if (completeFn) await completeFn(PAYMENT_METHODS.STRIPE, null, { paymentMethodId: pm.id, paymentIntentId: res.paymentIntentId, success: true });
          onOpenChange(false);
          onClose();
        }
        else if (res.requiresAction && res.clientSecret) { const stripeClient = cardRef.current && cardRef.current.stripe; const confirm = await stripeClient.confirmCardPayment(res.clientSecret, { payment_method: pm.id }); if (confirm.error) throw confirm.error; const completeFn = onComplete || onCompletePayment; if (completeFn) await completeFn(PAYMENT_METHODS.STRIPE, null, { paymentMethodId: pm.id, paymentIntentId: confirm.paymentIntent.id, success: true }); onOpenChange(false); onClose(); }
        else throw new Error(res.message || 'Payment failed');
      } else if (paymentMethod === PAYMENT_METHODS.BANK_TRANSFER) { const completeFn = onComplete || onCompletePayment; if (completeFn) await completeFn(PAYMENT_METHODS.BANK_TRANSFER, null, { bankTransferInfo, qrImage }); onOpenChange(false); onClose(); }
      else { const completeFn = onComplete || onCompletePayment; if (completeFn) await completeFn(PAYMENT_METHODS.CASH, null, { amount: receivedAmount ? Number(receivedAmount) : total, success: true }); onOpenChange(false); onClose(); }
    } catch (err) { console.error('Payment failed', err); alert('Payment failed: ' + (err?.message || 'Unknown')); } finally { setIsProcessing(false); }
  };

  const setSplitMethod = (index, method) => {
    setSplitPayments((prev) => prev.map((s, i) => i === index ? ({ ...s, method }) : s));
    if (method === PAYMENT_METHODS.STRIPE) setPaymentMethod(PAYMENT_METHODS.STRIPE);
  };

  const updateSplit = (index, patch) => {
    setSplitPayments(prev => prev.map((s, i) => i === index ? ({ ...s, ...patch }) : s));
  };

  const paySplit = async (index) => {
    const split = splitPayments[index];
    if (!split) return;
    if (split.status === 'paid') return;
    setActiveSplitIndex(index);
    try {
      if (split.method === PAYMENT_METHODS.CASH) {
        updateSplit(index, { status: 'paid', paymentDetails: { received: split.amount, method: PAYMENT_METHODS.CASH } });
        return true;
      }
      if (split.method === PAYMENT_METHODS.BANK_TRANSFER) {
        const payload = { restaurantId, customerName, items: cart.map((c) => ({ name: c.name, quantity: c.quantity, unitPrice: Number(c.price || 0) })), total: split.amount };
        const { url } = await createStripePaymentLink(payload);
        updateSplit(index, { status: 'pending', paymentDetails: { method: PAYMENT_METHODS.BANK_TRANSFER, qr: url } });
        return true;
      }
      if (split.method === PAYMENT_METHODS.STRIPE) {
        const ok = await new Promise((resolve) => { splitModalResolveRef.current = resolve; setSplitCardModalIndex(index); });
        if (ok && ok.success) {
          updateSplit(index, { status: 'paid', paymentDetails: { method: PAYMENT_METHODS.STRIPE, paymentIntentId: ok.paymentIntentId } });
          return true;
        }
        if (ok && ok.error) throw new Error(ok.error);
        return false;
      }
    } catch (err) {
      console.error('Split payment failed', err);
      alert('Split payment failed: ' + (err?.message || 'Unknown'));
      return false;
    } finally {
      setActiveSplitIndex(null);
    }
  };

  const payAllSplits = async () => {
    for (let i = 0; i < splitPayments.length; i++) {
      const sp = splitPayments[i];
      if (sp.status !== 'paid') {
        const ok = await paySplit(i);
        if (!ok) return false; 
      }
    }
    return true;
  };

  const quickAmounts = [20, 50, 100, 200];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <div className="text-sm text-gray-600 mt-1">
              {customerInfo?.name || customerName} {orderNotes ? `• ${orderNotes}` : ''}
            </div>
          </div>
            <div className="flex items-center gap-3">
            <button onClick={() => setIsBillSplitOpen(true)} className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1 rounded border">Split</button>
            <button onClick={() => { onOpenChange(false); onClose(); }} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
        <div className="mb-6">Total: <span className="font-semibold">${Number(total || 0).toFixed(2)}</span></div>
        <div className="mb-2 flex items-center gap-2">
          <label className="inline-flex items-center text-sm">
            <input type="checkbox" checked={!!printOnCheckout} onChange={(e) => setPrintOnCheckout(!!e.target.checked)} className="mr-2" />
            Print Invoice
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH)} className={`p-3 rounded border ${paymentMethod === PAYMENT_METHODS.CASH ? 'border-red-500' : 'border-gray-200'}`}>{PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CASH]}</button>
          <button onClick={() => setPaymentMethod(PAYMENT_METHODS.STRIPE)} className={`p-3 rounded border ${paymentMethod === PAYMENT_METHODS.STRIPE ? 'border-red-500' : 'border-gray-200'}`}>{PAYMENT_METHOD_LABELS[PAYMENT_METHODS.STRIPE]}</button>
        </div>
        {!isSplit && paymentMethod === PAYMENT_METHODS.CASH && (
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">Received amount</label>
            <input type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} className="w-full px-3 py-2 border rounded" step="0.01" />
            <div className="grid grid-cols-4 gap-2 mt-3">{quickAmounts.map(a => <button key={a} onClick={() => setReceivedAmount(a.toString())} className="px-2 py-2 bg-gray-100 rounded">${a}</button>)}</div>
            {receivedAmount && <div className="mt-2 text-sm">Change: <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Number(change || 0).toFixed(2)}</span></div>}
          </div>
        )}
        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripeCardSection cardRef={cardRef} visible={paymentMethod === PAYMENT_METHODS.STRIPE} onError={setCardError} onComplete={setIsCardComplete} options={cardElementOptions} />
        </Elements>
        {cardError && <div className="text-xs text-red-600 mt-2">{cardError}</div>}
          {isSplit && (
          <div className="mb-4 border p-3 rounded bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Split Payments</div>
              <div className="flex gap-2 items-center">
                <button disabled={activeSplitIndex !== null} onClick={() => payAllSplits()} className="text-xs text-blue-600 hover:underline">Pay All</button>
                <button onClick={() => { setIsSplit(false); setSplitPayments([{ id: `split_${Date.now()}`, method: PAYMENT_METHODS.CASH, amount: Number(total || 0), person: 'Split 1', status: 'pending', paymentDetails: null }]); }} className="text-xs text-red-600 hover:underline">Clear split</button>
              </div>
            </div>
            <div className="space-y-2">
              {splitPayments.map((sp, idx) => (
                <div key={sp.id || idx} className="flex items-center justify-between text-sm gap-3">
                  <div className="truncate w-1/3">{(sp.meta && sp.meta.person) || sp.person || `Split ${idx + 1}`}</div>
                  <div className="font-semibold w-1/4 text-right">${Number(sp.amount || 0).toFixed(2)}</div>
                  <div className="w-1/4">
                    <select value={sp.method} onChange={(e) => setSplitMethod(idx, e.target.value)} className="w-full px-2 py-1 border rounded text-sm">
                      <option value={PAYMENT_METHODS.CASH}>{PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CASH]}</option>
                      <option value={PAYMENT_METHODS.STRIPE}>{PAYMENT_METHOD_LABELS[PAYMENT_METHODS.STRIPE]}</option>
                      <option value={PAYMENT_METHODS.BANK_TRANSFER}>{PAYMENT_METHOD_LABELS[PAYMENT_METHODS.BANK_TRANSFER]}</option>
                    </select>
                  </div>
                  <div className="w-1/6 text-right flex items-center gap-2">
                    {sp.status === 'paid' ? <div className="text-xs text-green-600">Paid</div> : (sp.status === 'pending' ? <div className="text-xs text-orange-600">Pending</div> : <div className="text-xs text-gray-500">{sp.status}</div>)}
                    <button disabled={activeSplitIndex === idx} onClick={() => paySplit(idx)} className={`px-2 py-1 rounded text-xs ${sp.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {activeSplitIndex === idx ? 'Processing...' : (sp.status === 'paid' ? 'Paid' : (sp.method === PAYMENT_METHODS.BANK_TRANSFER ? 'Generate QR' : 'Pay'))}
                    </button>
                    {sp.paymentDetails && sp.paymentDetails.qr && (<a href={sp.paymentDetails.qr} target="_blank" rel="noreferrer" className="text-xs text-blue-600">Open QR</a>)}
                  </div>
                </div>
              ))}
            </div>
            {
              splitPayments.some(sp => sp.status === 'pending' && sp.paymentDetails?.method === PAYMENT_METHODS.BANK_TRANSFER) && (
                <div className="mt-2 text-xs text-gray-600">Note: Some splits are awaiting bank transfer (QR). These will be marked as pending in the order.</div>
              )
            }
          </div>
        )}
        {!isSplit && paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">Bank transfer</label>
            <input type="text" placeholder="Bank name" value={bankTransferInfo.bankName} onChange={(e) => setBankTransferInfo(prev => ({ ...prev, bankName: e.target.value }))} className="w-full px-3 py-2 border rounded mb-2" />
            <input type="text" placeholder="Account number" value={bankTransferInfo.accountNumber} onChange={(e) => setBankTransferInfo(prev => ({ ...prev, accountNumber: e.target.value }))} className="w-full px-3 py-2 border rounded mb-2" />
            <Button onClick={handleGenerateQR} disabled={isGeneratingQR} variant="outline" className="w-full">{isGeneratingQR ? 'Generating...' : 'Generate QR'}</Button>
            {qrImage && <div className="mt-3 text-center"><img src={qrImage} alt="QR" style={{ maxWidth: 200 }} /></div>}
          </div>
        )}
        <div className="flex gap-3 mt-6"><Button onClick={() => { onOpenChange(false); onClose(); }} disabled={processing} variant="outline" className="flex-1">Cancel</Button><Button onClick={handleComplete} disabled={processing || (paymentMethod === PAYMENT_METHODS.STRIPE && !isCardComplete) || (paymentMethod === PAYMENT_METHODS.CASH && (!receivedAmount || Number(receivedAmount) < Number(total || 0)))} className="flex-1">{processing ? 'Processing...' : 'Complete'}</Button></div>
      </div>
      {isBillSplitOpen && (
          <BillSplitModal
          cart={cart}
          total={total}
          onClose={() => setIsBillSplitOpen(false)}
          onSplit={(splits) => {
            setSplitPayments(splits.map((s, i) => ({ id: `split_${Date.now()}_${i}`, method: PAYMENT_METHODS.CASH, amount: Number(s.amount || 0), meta: { person: s.person }, status: 'pending', paymentDetails: null }))); 
            setIsSplit(true);
            setIsBillSplitOpen(false);
          }}
        />
      )}
      {splitCardModalIndex !== null && splitPayments[splitCardModalIndex] && (
        <SplitCardModal
          split={splitPayments[splitCardModalIndex]}
          restaurantId={restaurantId}
          pendingOrderId={null}
          onPaid={handleSplitModalPaid}
          onCancel={handleSplitModalCancel}
        />
      )}
    </div>
  );
}

