
import { post } from '@/api/apiClient';

export const createStripePaymentLink = async (orderData) => {
  try {
    const result = await post('/stripe/create-payment-link', {
      orderId: orderData.orderId,
      restaurantId: orderData.restaurantId || orderData.restaurant?.id,
      customerName: orderData.customerName,
      items: orderData.items || [],
      subtotal: orderData.subtotal || null,
      discounts: orderData.discounts || null,
      total: orderData.total || orderData.amount || null,
    });
    
    if (!result || !result.success) {
      throw new Error(result.message || 'Failed to create payment link');
    }
    
    return {
      url: result.data.url,
      qrCode: result.data.qr_code,
      invoiceId: result.data.id,
    };
  } catch (error) {
    console.error('Failed to create Stripe payment link:', error);
    throw new Error('Stripe Payment Link API error: ' + error.message);
  }
};


export const processStripePayment = async (paymentMethodId, amount, metadata = {}) => {
  try {
    const result = await post('/stripe/process-payment', {
      payment_method_id: paymentMethodId,
      amount: amount,
      metadata,
    });
    
    if (!result || !result.success) {
      return {
        success: false,
        status: result?.data?.status || result.status || 'failed',
        requiresAction: result?.requiresAction || false,
        clientSecret: result?.data?.client_secret || result?.client_secret || null,
        message: result.message || result.error || 'Payment failed',
      };
    }
    
    return {
      success: true,
      paymentIntentId: result.data.id,
      status: result.data.status,
    };
  } catch (error) {
    console.error('Stripe payment failed:', error);
    throw new Error('Card payment failed: ' + error.message);
  }
};

export const generateQRCode = (paymentUrl) => {
  // Simple QR code generation using a library like 'qrcode'
  // You'd need to install: npm install qrcode
  // For now, return placeholder or use external service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`;
};


import { loadStripe } from '@stripe/stripe-js';

let _stripePromise = null;
const getStripePromise = () => {
  if (!_stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('VITE_STRIPE_PUBLISHABLE_KEY not set');
      _stripePromise = null;
    } else {
      _stripePromise = loadStripe(key);
    }
  }
  return _stripePromise;
};

export const setupStripeElements = (opts = {}) => {
  const stripePromise = getStripePromise();

  const defaultAppearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#ef4444', // red-600
      colorBackground: '#ffffff',
      colorText: '#111827',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    },
  };
  const elementsOptions = {
    appearance: { ...(opts.appearance || defaultAppearance) },
    locale: opts.locale || 'auto',
    ...(opts.clientSecret ? { clientSecret: opts.clientSecret } : {}),
  };

  return {
    stripePromise,
    elementsOptions,
  };
};
