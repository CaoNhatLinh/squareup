const admin = require('firebase-admin');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = admin.database();

/**
 * Create a Stripe Payment Link for bank transfer QR code generation
 * Used for POS bank transfer payments
 */
// Helper: get or create product & price and reuse them
const getOrCreatePriceForItem = async (restaurantId, groupKey, itemName, description, unitAmount) => {
  try {
    const path = `stripeProducts/${restaurantId}/${groupKey}/${Math.round(unitAmount * 100)}`;
    const snapshot = await db.ref(path).get();
    if (snapshot.exists()) {
      return snapshot.val();
    }

    const product = await stripe.products.create({
      name: itemName,
      description: description || undefined,
      metadata: { groupKey: groupKey || '' }
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(unitAmount * 100),
      currency: 'usd',
    });

    const obj = { productId: product.id, priceId: price.id, unitAmount: Math.round(unitAmount * 100) };
    await db.ref(path).set(obj);
    return obj;
  } catch (err) {
    console.error('getOrCreatePriceForItem error:', err);
    throw err;
  }
};

const createPaymentLink = async (req, res) => {
  try {
    // Request body should contain:
    // { orderId, restaurantId, customerName, items: [{ name, unitPrice, quantity, selectedOptions, modifiers, groupKey }], subtotal, discounts, tax, total }
    const payload = req.body || {};
    const { orderId, restaurantId, customerName, items, subtotal, discounts, tax, total } = payload;

    // Basic validation: if items absent, fallback to total amount as previously
    if ((!items || !Array.isArray(items) || items.length === 0) && (!total || Number(total) <= 0)) {
      return res.status(400).json({ error: 'Invalid request: provide items array or non-zero total' });
    }

    let line_items = [];

    if (items && Array.isArray(items) && items.length > 0) {
      // Create a product + price for each item and add to line_items
      for (const it of items) {
        try {
          const itemName = it.name || 'Item';
          // Build a nice description including modifiers and options
          let description = '';
          if (it.selectedOptions && Array.isArray(it.selectedOptions) && it.selectedOptions.length > 0) {
            description += it.selectedOptions.map(o => o.name || o).join(', ');
          }
          if (it.modifiers && Array.isArray(it.modifiers) && it.modifiers.length > 0) {
            const modStr = it.modifiers.map(m => `${m.name || m} (+${m.price || 0})`).join(', ');
            description = description ? `${description} | ${modStr}` : modStr;
          }

          // Determine unit price (may already include discount)
          const unitPrice = Number(it.unitPrice ?? it.price ?? it.amount ?? 0);
          if (!unitPrice || unitPrice <= 0) {
            continue; // skip zero-priced items
          }

          // Determine effective unit price considering discounts
          let effectivePrice = unitPrice;
          if (it.discountAmount && Number(it.discountAmount) > 0) {
            effectivePrice = Math.max(0, unitPrice - Number(it.discountAmount));
          }
          // Get or create price
          const { priceId } = await getOrCreatePriceForItem(restaurantId || 'global', it.groupKey || itemName, itemName, description, effectivePrice);
          line_items.push({ price: priceId, quantity: Math.max(1, Number(it.quantity || 1)) });
        } catch (errItem) {
          console.warn('Failed to add item to payment link, skipping this item', errItem && errItem.message);
        }
      }
    }

    // If no detailed items added but total is present, create a single price using total
    if (line_items.length === 0 && total && Number(total) > 0) {
      const product = await stripe.products.create({
        name: `Order ${orderId || 'POS-' + Date.now()}`,
        description: `Payment for order ${orderId || ''}`,
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(total) * 100),
        currency: 'usd',
      });
      line_items.push({ price: price.id, quantity: 1 });
    }

    // Create pending order in DB for reference by webhook or post-payment processing
    const pendingOrderId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let restaurantName = '';
    if (restaurantId) {
      const restSnap = await db.ref(`restaurants/${restaurantId}`).get();
      const restVal = restSnap.val();
      restaurantName = restVal?.name || '';
    }
    const pendingOrderData = {
      restaurantId,
      restaurantName,
      items: items || [],
      subtotal: subtotal || 0,
      discount: { totalDiscount: discounts?.totalDiscount || 0, detail: discounts || {} },
      totalAmount: total || subtotal,
      status: 'pending',
      createdAt: Date.now(),
    };
    await db.ref(`pendingOrders/${pendingOrderId}`).set(pendingOrderData);

    // Prepare metadata summary (avoid large payloads)
    const metadata = {
      orderId: orderId || '',
      restaurantId: restaurantId || '',
      pendingOrderId,
      customerName: customerName || 'Guest',
      subtotal: subtotal || '',
      discounts: discounts ? JSON.stringify(discounts).slice(0, 1000) : '',
      total: total || '',
      paymentType: 'pos_bank_transfer',
    };

    const paymentLink = await stripe.paymentLinks.create({
      line_items: line_items,
      metadata,
    });

    // Return the link and URL — frontend will generate QR image
    return res.status(200).json({ success: true, data: { id: paymentLink.id, url: paymentLink.url, qr_code: paymentLink.url, pendingOrderId } });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ error: 'Failed to create payment link', message: error.message });
  }
};

/**
 * Process a Stripe card payment from POS
 * Creates a payment intent with the provided payment method
 */
const processPayment = async (req, res) => {
  try {
    const { payment_method_id, amount, metadata = {} } = req.body;

    if (!payment_method_id) {
      return res.status(400).json({
        error: "Missing payment method",
        message: "payment_method_id is required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be greater than 0",
      });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true, // Automatically confirm the payment
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // For POS, we don't want redirects
      },
      metadata: {
        source: 'pos',
        ...metadata,
      },
    });

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Optionally create order immediately if pendingOrderId is present in metadata
      const metadata = Object.assign({}, paymentIntent.metadata || {}, req.body?.metadata || {});
      const pendingOrderId = metadata.pendingOrderId || req.body?.pendingOrderId || null;
      const restaurantId = metadata.restaurantId || req.body?.restaurantId || null;
      if (pendingOrderId && restaurantId) {
        try {
          const pendingSnapshot = await db.ref(`pendingOrders/${pendingOrderId}`).get();
          const pendingOrder = pendingSnapshot.val();
          if (pendingOrder) {
            const orderId = db.ref(`restaurants/${restaurantId}/orders`).push().key;
            // Update payment intent metadata
            await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: {
                ...paymentIntent.metadata,
                orderId,
                restaurantId,
              },
            });
            const now = Date.now();
            const orderData = {
              id: orderId,
              orderId,
              sessionId: paymentIntent.id,
              restaurantId,
              restaurantName: pendingOrder.restaurantName || '',
              amount: paymentIntent.amount / 100,
              totalAmount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: 'paid',
              paymentStatus: 'paid',
              items: pendingOrder.items || [],
              discount: pendingOrder.discount || null,
              subtotal: pendingOrder.subtotal || paymentIntent.amount / 100,
              tax: pendingOrder.tax || 0,
              total: paymentIntent.amount / 100,
              createdAt: now,
              updatedAt: now,
              statusHistory: { pending: pendingOrder.createdAt || now, paid: now },
            };
            await db.ref(`restaurants/${restaurantId}/orders/${orderId}`).set(orderData);
            await db.ref(`pendingOrders/${pendingOrderId}`).remove();
          }
        } catch (createOrderErr) {
          console.error('Failed to create order from payment:', createOrderErr);
        }
      }
      return res.status(200).json({
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
        },
      });
    } else if (paymentIntent.status === 'requires_action') {
      // This might happen with 3D Secure cards
      return res.status(200).json({
        success: false,
        requiresAction: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
        },
      });
    } else {
      return res.status(400).json({
        error: "Payment failed",
        message: `Payment status: ${paymentIntent.status}`,
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error("Error processing payment:", error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: "Card error",
        message: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: "Payment processing failed",
      message: error.message,
    });
  }
};

/**
 * Retrieve payment link details
 */
const getPaymentLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!linkId) {
      return res.status(400).json({
        error: "Missing link ID",
      });
    }

    const paymentLink = await stripe.paymentLinks.retrieve(linkId);

    return res.status(200).json({
      success: true,
      data: paymentLink,
    });
  } catch (error) {
    console.error("Error retrieving payment link:", error);
    return res.status(500).json({
      error: "Failed to retrieve payment link",
      message: error.message,
    });
  }
};

/**
 * Retrieve payment intent details
 */
const getPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Missing payment intent ID",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        metadata: paymentIntent.metadata,
      },
    });
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    return res.status(500).json({
      error: "Failed to retrieve payment intent",
      message: error.message,
    });
  }
};

module.exports = {
  createPaymentLink,
  processPayment,
  getPaymentLink,
  getPaymentIntent,
};
