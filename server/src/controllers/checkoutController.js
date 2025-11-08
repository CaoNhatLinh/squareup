const admin = require('firebase-admin');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const db = admin.database();

/**
 * Create Stripe Checkout Session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { restaurantId, items, returnUrl } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const restaurantSnapshot = await db
      .ref(`restaurants/${restaurantId}`)
      .once("value");
    const restaurant = restaurantSnapshot.val();

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const lineItems = items.map((item) => {
      let description = "";
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        description = item.selectedOptions.map((opt) => opt.name).join(", ");
      }
      if (item.specialInstruction) {
        description += description ? ` | Note: ${item.specialInstruction}` : `Note: ${item.specialInstruction}`;
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: description || "No options",
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const pendingOrderId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pendingOrderData = {
      restaurantId,
      restaurantName: restaurant.name,
      items,
      totalAmount,
      status: "pending",
      createdAt: Date.now(),
    };

    await db.ref(`pendingOrders/${pendingOrderId}`).set(pendingOrderData);
    const successUrl = returnUrl 
      ? returnUrl.replace('checkout-return', 'success')
      : `${req.headers.origin}/shop/${restaurantId}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.headers.origin}/shop/${restaurantId}/cancelled`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        pendingOrderId, 
        restaurantId,
      },
    });
    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Webhook handler for Stripe events
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      
      try {
        if (session.payment_status === "paid") {
          const pendingOrderId = session.metadata.pendingOrderId;
          const restaurantId = session.metadata.restaurantId;

          if (!pendingOrderId) {
            console.error("❌ No pending order ID in metadata");
            return;
          }

          const pendingOrderSnapshot = await db
            .ref(`pendingOrders/${pendingOrderId}`)
            .once("value");
          const pendingOrder = pendingOrderSnapshot.val();

          if (!pendingOrder) {
            console.error(`❌ Pending order ${pendingOrderId} not found`);
            return;
          }

          // Create final order ID (generate from restaurant's orders path)
          const orderId = db.ref(`restaurants/${restaurantId}/orders`).push().key;

          const orderData = {
            id: orderId,
            orderId: orderId,
            sessionId: session.id,
            restaurantId: restaurantId,
            restaurantName: pendingOrder.restaurantName,
            amount: session.amount_total / 100,
            totalAmount: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            status: "paid",
            paymentStatus: session.payment_status,
            customerEmail: session.customer_details?.email || null,
            customerName: session.customer_details?.name || null,
            
            items: pendingOrder.items.map(item => ({
              itemId: item.itemId || "",
              name: item.name || "Unknown Item",
              image: item.image || null,
              price: item.price || 0,
              quantity: item.quantity || 1,
              totalPrice: item.totalPrice || 0,
              discount: item.discount || 0,
              selectedOptions: item.selectedOptions || [],
              specialInstruction: item.specialInstruction || "",
            })),
            
            subtotal: pendingOrder.totalAmount,
            tax: 0, 
            total: session.amount_total / 100,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          console.log("✅ Saving order from webhook:", orderData);

          // Save FULL order data in restaurant's orders path (one time, all details)
          await db.ref(`restaurants/${restaurantId}/orders/${orderId}`).set(orderData);

          console.log(`✅ Order ${orderId} saved successfully to restaurants/${restaurantId}/orders/`);

          // Clean up pending order
          await db.ref(`pendingOrders/${pendingOrderId}`).remove();
        }
      } catch (error) {
        console.error("❌ Error saving order from webhook:", error);
      }
      break;
      
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      break;

    case "charge.succeeded":
      const charge = event.data.object;
      break;

    case "charge.updated":
      break;
    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Get order by sessionId
 * Frontend calls this to retrieve order saved by webhook
 */
exports.getOrderBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { restaurantId } = req.query; // Get from query params

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const ordersSnapshot = await db
      .ref(`restaurants/${restaurantId}/orders`)
      .orderByChild("sessionId")
      .equalTo(sessionId)
      .once("value");

    const orders = ordersSnapshot.val();

    if (!orders) {
      return res.status(404).json({ 
        error: "Order not found", 
        processing: true,
        message: "Payment is being processed. Please wait..." 
      });
    }
    const orderData = Object.values(orders)[0];

    res.status(200).json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all orders for a restaurant
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const ordersSnapshot = await db
      .ref(`restaurants/${restaurantId}/orders`)
      .once("value");

    const ordersData = ordersSnapshot.val();

    if (!ordersData) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    const orders = Object.values(ordersData).sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all orders (admin) - aggregates orders from all restaurants
 */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const restaurantsSnapshot = await db.ref("restaurants").once("value");
    const restaurantsData = restaurantsSnapshot.val();

    if (!restaurantsData) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    // Aggregate orders from all restaurants
    const allOrders = [];
    for (const [restaurantId, restaurantData] of Object.entries(restaurantsData)) {
      if (restaurantData.orders) {
        const orders = Object.values(restaurantData.orders);
        allOrders.push(...orders);
      }
    }

    // Sort by createdAt (newest first)
    const orders = allOrders.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get order by ID - searches across all restaurants
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Search across all restaurants
    const restaurantsSnapshot = await db.ref("restaurants").once("value");
    const restaurantsData = restaurantsSnapshot.val();

    if (!restaurantsData) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist.",
      });
    }

    let order = null;
    for (const [restaurantId, restaurantData] of Object.entries(restaurantsData)) {
      if (restaurantData.orders && restaurantData.orders[orderId]) {
        order = restaurantData.orders[orderId];
        break;
      }
    }

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Stripe session status
 */
exports.getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.status(200).json({
      success: true,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      status: session.status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
    });
  } catch (error) {
    console.error("Error getting session status:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { status } = req.body;

    if (!restaurantId || !orderId) {
      return res.status(400).json({ error: "Restaurant ID and Order ID are required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Validate status
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const orderRef = db.ref(`restaurants/${restaurantId}/orders/${orderId}`);
    const orderSnapshot = await orderRef.once('value');

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Use a slash path for nested update keys (dots are invalid in RTDB keys)
    // This will set e.g. /statusHistory/accepted = timestamp without creating an invalid key
    await orderRef.update({
      status,
      updatedAt: Date.now(),
      [`statusHistory/${status}`]: Date.now()
    });

    const updatedOrder = await orderRef.once('value');

    res.status(200).json({
      success: true,
      order: updatedOrder.val(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Public endpoint: Get order status by orderId (no authentication required)
 * This allows guest customers to track their orders
 */
exports.getPublicOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Search for order across all restaurants
    const restaurantsSnapshot = await db.ref('restaurants').once('value');
    const restaurants = restaurantsSnapshot.val();

    if (!restaurants) {
      return res.status(404).json({ error: "Order not found" });
    }

    let foundOrder = null;
    let foundRestaurantId = null;

    // Iterate through all restaurants to find the order
    for (const [restaurantId, restaurantData] of Object.entries(restaurants)) {
      if (restaurantData.orders && restaurantData.orders[orderId]) {
        foundOrder = restaurantData.orders[orderId];
        foundRestaurantId = restaurantId;
        break;
      }
    }

    if (!foundOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return only necessary information (no sensitive data)
    const publicOrderData = {
      id: orderId,
      status: foundOrder.status,
      amount: foundOrder.amount,
      currency: foundOrder.currency || 'USD',
      items: foundOrder.items || [],
      restaurantId: foundRestaurantId,
      restaurantName: foundOrder.restaurantName,
      createdAt: foundOrder.createdAt,
      updatedAt: foundOrder.updatedAt || foundOrder.createdAt,
      statusHistory: foundOrder.statusHistory || {},
    };

    res.status(200).json({
      success: true,
      order: publicOrderData,
    });
  } catch (error) {
    console.error("Error fetching public order status:", error);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
};
