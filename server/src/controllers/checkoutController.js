const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { calculateCartDiscounts } = require("../utils/discountCalculator");

const db = admin.database();

const createCheckoutSession = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      returnUrl,
      guestUuid,
      orderType,
      deliveryAddress,
    } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const restaurantSnapshot = await db
      .ref(`restaurants/${restaurantId}`)
      .get();
    const restaurant = restaurantSnapshot.val();

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const discountResult = await calculateCartDiscounts(restaurantId, items);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalDiscount = discountResult.totalDiscount;
    const totalAmount = subtotal - totalDiscount;

    const lineItems = items.map((item) => {
      let description = "";
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        description = item.selectedOptions.map((opt) => opt.name).join(", ");
      }
      if (item.specialInstruction) {
        description += description
          ? ` | Note: ${item.specialInstruction}`
          : `Note: ${item.specialInstruction}`;
      }

      const itemDiscount = discountResult.itemDiscounts[item.groupKey];
      let finalPrice = item.price;

      if (itemDiscount && itemDiscount.discountAmount > 0) {
        finalPrice = item.price - itemDiscount.discountAmount;
        const discountInfo = `Discount: ${itemDiscount.discountPercentage}% OFF`;
        description = description
          ? `${description} | ${discountInfo}`
          : discountInfo;
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: description || "No options",
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    const pendingOrderId = `pending_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    if (
      orderType === "delivery" &&
      !deliveryAddress &&
      !req.body.customerInfo?.address
    ) {
      return res
        .status(400)
        .json({
          error:
            "Delivery orders require a deliveryAddress or customerInfo.address",
        });
    }

    const pendingOrderData = {
      restaurantId,
      restaurantName: restaurant.name,
      items,
      subtotal,
      discount: {
        totalDiscount,
        appliedDiscounts: discountResult.appliedDiscounts,
        discountBreakdown: discountResult.discountBreakdown,
        itemDiscounts: discountResult.itemDiscounts,
      },
      totalAmount,
      status: "pending",
      createdAt: Date.now(),
      guestUuid: guestUuid || null,
      orderType: orderType || "delivery",
      deliveryAddress: deliveryAddress || null,
      seatNumber: req.body.seatNumber || null,
    };

    if (items && Array.isArray(items) && items.length > 0) {
      const dbItems = restaurant.items || {};
      const dbModifiers = restaurant.modifiers || {};

      for (const item of items) {
        if (!item.itemId || (item.id && item.id.startsWith("sample-")))
          continue;
        const dbItem = dbItems[item.itemId];
        if (!dbItem) {
          return res
            .status(400)
            .json({
              error: `Item '${item.name}' is no longer available. Please update your cart.`,
            });
        }
        if (item.selectedOptions && Array.isArray(item.selectedOptions)) {
          for (const option of item.selectedOptions) {
            const modifier = dbModifiers[option.modifierId];
            if (!modifier) {
              return res
                .status(400)
                .json({
                  error: `Modifier for '${item.name}' is no longer available. Please update your cart.`,
                });
            }
            if (!modifier.options || !modifier.options[option.id]) {
              return res
                .status(400)
                .json({
                  error: `Option '${option.name}' for '${item.name}' is no longer available. Please update your cart.`,
                });
            }
          }
        }
      }
    }

    await db.ref(`pendingOrders/${pendingOrderId}`).set(pendingOrderData);
    const restaurantSlug = restaurant.slug || restaurantId;

    let successUrlBase = returnUrl
      ? returnUrl.replace("checkout-return", "success")
      : `${req.headers.origin}/${restaurantSlug}/order/success`;

    if (successUrlBase.includes("?")) {
      successUrlBase += "&session_id={CHECKOUT_SESSION_ID}";
    } else {
      successUrlBase += "?session_id={CHECKOUT_SESSION_ID}";
    }

    const successUrl = successUrlBase;
    const cancelUrl = `${req.headers.origin}/${restaurantSlug}/order/cancelled`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: {
        pendingOrderId,
        restaurantId,
        restaurantName: restaurant.name,
        customerEmail: guestUuid ? "guest" : "user",
      },
      payment_intent_data: {
        metadata: {
          restaurantId,
          restaurantName: restaurant.name,
          pendingOrderId: pendingOrderId,
        },
      },
    });
    res
      .status(200)
      .json({
        success: true,
        data: { sessionId: session.id, url: session.url },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createOrderFromPOS = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const {
      items,
      customerInfo,
      paymentMethod,
      orderType,
      seatNumber,
      deliveryAddress,
    } = req.body;
    if (
      !restaurantId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const restaurantSnapshot = await db
      .ref(`restaurants/${restaurantId}`)
      .get();
    const restaurant = restaurantSnapshot.val();
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    const discountResult = await calculateCartDiscounts(
      restaurantId,
      items.map((i) => ({
        ...i,
        totalPrice: (i.price || 0) * (i.quantity || 1),
      }))
    );

    const subtotal = items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
      0
    );
    const totalDiscount = discountResult.totalDiscount || 0;
    const totalAmount = subtotal - totalDiscount;

    const orderId = db.ref(`restaurants/${restaurantId}/orders`).push().key;
    const finalOrderType = orderType || "dine_in";
    if (
      finalOrderType === "delivery" &&
      !deliveryAddress &&
      !customerInfo?.address
    ) {
      return res
        .status(400)
        .json({
          error:
            "Delivery orders require a deliveryAddress or customerInfo.address",
        });
    }
    const orderData = {
      id: orderId,
      orderId,
      restaurantId,
      restaurantName: restaurant.name || "",
      status: req.body.paymentStatus === "paid" ? "completed" : "pending",
      paymentStatus:
        req.body.paymentStatus ||
        (paymentMethod === "cash" ? "paid" : "pending"),
      amount: totalAmount,
      totalAmount,
      currency: "USD",
      items: items.map((i) => ({
        itemId: i.itemId || "",
        groupKey: i.groupKey || "",
        name: i.name || "",
        image: i.image || null,
        price: i.price || 0,
        quantity: i.quantity || 1,
        totalPrice: (i.price || 0) * (i.quantity || 1),
        selectedOptions: i.selectedOptions || [],
      })),
      discount: {
        totalDiscount,
        appliedDiscounts: discountResult.appliedDiscounts,
        discountBreakdown: discountResult.discountBreakdown,
        itemDiscounts: discountResult.itemDiscounts,
      },
      subtotal,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customerInfo: customerInfo || null,
      orderType: finalOrderType,
      seatNumber: finalOrderType === "dine_in" ? seatNumber || null : null,
      deliveryAddress:
        finalOrderType === "delivery"
          ? deliveryAddress || customerInfo?.address || null
          : null,
    };
    await db
      .ref(`restaurants/${restaurantId}/orders/${orderId}`)
      .set(orderData);
    return res.status(201).json({ success: true, data: orderData });
  } catch (error) {
    console.error("createOrderFromPOS error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
const calculateCartDiscountsEndpoint = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;
    if (!restaurantId || !items)
      return res.status(400).json({ error: "Missing required fields" });
    const result = await calculateCartDiscounts(restaurantId, items);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("calculateCartDiscountsEndpoint error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
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
            return;
          }

          const pendingOrderSnapshot = await db
            .ref(`pendingOrders/${pendingOrderId}`)
            .get();
          const pendingOrder = pendingOrderSnapshot.val();

          if (!pendingOrder) {
            return;
          }

          const orderId = db
            .ref(`restaurants/${restaurantId}/orders`)
            .push().key;
          try {
            await stripe.paymentIntents.update(session.payment_intent, {
              metadata: {
                restaurantId,
                restaurantName: pendingOrder.restaurantName,
                orderId: orderId,
              },
            });
          } catch (metadataError) {
            console.error(
              "Error updating payment intent metadata:",
              metadataError
            );
          }

          const now = Date.now();
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
            guestUuid: pendingOrder.guestUuid || null,
            orderType: pendingOrder.orderType || "delivery",
            deliveryAddress:
              pendingOrder.deliveryAddress || pendingOrder.customerInfo || null,
            seatNumber: pendingOrder.seatNumber || null,

            items: pendingOrder.items.map((item) => ({
              itemId: item.itemId || "",
              groupKey: item.groupKey || "",
              name: item.name || "Unknown Item",
              image: item.image || null,
              price: item.price || 0,
              quantity: item.quantity || 1,
              totalPrice: item.totalPrice || 0,
              discount: item.discount || 0,
              selectedOptions: item.selectedOptions || [],
              specialInstruction: item.specialInstruction || "",
            })),

            discount: pendingOrder.discount || null,
            subtotal: pendingOrder.subtotal || pendingOrder.totalAmount,
            tax: 0,
            total: session.amount_total / 100,
            createdAt: now,
            updatedAt: now,
            statusHistory: {
              pending: pendingOrder.createdAt || now,
              paid: now,
            },
          };
          await db
            .ref(`restaurants/${restaurantId}/orders/${orderId}`)
            .set(orderData);
          await db.ref(`pendingOrders/${pendingOrderId}`).remove();
        }
      } catch (error) {
        console.error("❌ Error saving order from webhook:", error);
      }
      break;

    case "checkout.session.expired":
      const expiredSession = event.data.object;
      try {
        const pendingOrderId = expiredSession.metadata?.pendingOrderId;
        if (pendingOrderId) {
          console.log(
            `🗑️ Cleaning up expired pending order: ${pendingOrderId}`
          );
          await db.ref(`pendingOrders/${pendingOrderId}`).remove();
        }
      } catch (error) {
        console.error("❌ Error cleaning up expired session:", error);
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
  }

  res.json({ success: true, data: { received: true } });
};

const getOrderBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { restaurantId } = req.query;

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
      .get();

    const orders = ordersSnapshot.val();

    if (!orders) {
      return res.status(404).json({
        error: "Order not found",
        processing: true,
        message: "Payment is being processed. Please wait...",
      });
    }
    const orderData = Object.values(orders)[0];

    res.status(200).json({ success: true, data: { order: orderData } });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const q = (req.query.q || "").toLowerCase().trim();
    const sortBy = req.query.sortBy || "createdAt";
    const sortDir = (req.query.sortDir || "desc").toLowerCase();

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const ordersSnapshot = await db
      .ref(`restaurants/${restaurantId}/orders`)
      .get();
    const ordersData = ordersSnapshot.val();

    if (!ordersData) {
      return res.status(200).json({ success: true, data: [] });
    }

    let orders = Object.values(ordersData).sort(
      (a, b) => b.createdAt - a.createdAt
    );
    if (q) {
      orders = orders.filter(
        (o) =>
          (o.id || "").toLowerCase().includes(q) ||
          (o.customerEmail || "").toLowerCase().includes(q)
      );
    }
    if (sortBy) {
      const dir = sortDir === "asc" ? 1 : -1;
      orders = orders.sort((a, b) => {
        let va = a[sortBy] === undefined || a[sortBy] === null ? "" : a[sortBy];
        let vb = b[sortBy] === undefined || b[sortBy] === null ? "" : b[sortBy];
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    const total = orders.length;
    const startIndex = Math.max((page - 1) * limit, 0);
    const endIndex = startIndex + limit;
    const pagedOrders = orders.slice(startIndex, endIndex);
    res
      .status(200)
      .json({ success: true, data: pagedOrders, meta: { total, limit, page } });
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllOrdersAdmin = async (req, res) => {
  try {
    const restaurantsSnapshot = await db.ref("restaurants").get();
    const restaurantsData = restaurantsSnapshot.val();

    if (!restaurantsData) {
      return res.status(200).json({ success: true, data: [] });
    }

    const allOrders = [];
    for (const [restaurantId, restaurantData] of Object.entries(
      restaurantsData
    )) {
      if (restaurantData.orders) {
        const orders = Object.values(restaurantData.orders);
        allOrders.push(...orders);
      }
    }

    const orders = allOrders.sort((a, b) => b.createdAt - a.createdAt);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const total = orders.length;
    const startIndex = Math.max((page - 1) * limit, 0);
    const endIndex = startIndex + limit;
    const paged = orders.slice(startIndex, endIndex);
    res
      .status(200)
      .json({ success: true, data: paged, meta: { total, limit, page } });
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const restaurantsSnapshot = await db.ref("restaurants").get();
    const restaurantsData = restaurantsSnapshot.val();

    if (!restaurantsData) {
      return res.status(404).json({
        error: "Order not found",
        message: "The requested order does not exist.",
      });
    }

    let order = null;
    for (const [restaurantId, restaurantData] of Object.entries(
      restaurantsData
    )) {
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

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res
      .status(200)
      .json({
        success: true,
        data: {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          status: session.status,
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total,
        },
      });
  } catch (error) {
    console.error("Error getting session status:", error);
    res.status(500).json({ error: error.message });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { status, cancelReason, cancelNote } = req.body;

    if (!restaurantId || !orderId) {
      return res
        .status(400)
        .json({ error: "Restaurant ID and Order ID are required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const orderRef = db.ref(`restaurants/${restaurantId}/orders/${orderId}`);
    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderSnapshot.val();
    let refundSuccess = false;
    let refundId = null;
    let refundError = null;
    if (status === "cancelled" && order.sessionId) {
      console.log(`Processing auto-refund for cancelled order ${orderId}`);
      try {
        const sessions = await stripe.checkout.sessions.list({ limit: 100 });
        const session = sessions.data.find((s) => s.id === order.sessionId);
        if (session && session.payment_intent) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId,
            {
              expand: ["latest_charge"],
            }
          );

          const latestCharge = paymentIntent.latest_charge;
          if (
            paymentIntent.status === "succeeded" &&
            latestCharge &&
            latestCharge.id &&
            !latestCharge.refunded
          ) {
            const refund = await stripe.refunds.create({
              charge: latestCharge.id,
              reason: "requested_by_customer",
            });

            refundSuccess = true;
            refundId = refund.id;
          } else {
          }
        } else {
          console.log(
            `Refund skipped: Session or Payment Intent ID not found for order ${orderId}`
          );
        }
      } catch (err) {
        console.error("Error processing auto-refund:", err.message);
        refundError = err.message;
      }
      const updateData = {
        status,
        updatedAt: Date.now(),
        [`statusHistory/${status}`]: Date.now(),
        refunded: refundSuccess || order.refunded || false,
        refundId: refundId || order.refundId || null,
        refundedAt: refundSuccess ? Date.now() : order.refundedAt || null,
        refundError: refundError,
      };

      if (cancelReason) updateData.cancelReason = cancelReason;
      if (cancelNote) updateData.cancelNote = cancelNote;

      await orderRef.update(updateData);
    } else {
      const updateData = {
        status,
        updatedAt: Date.now(),
        [`statusHistory/${status}`]: Date.now(),
      };
      if (status === "cancelled") {
        if (cancelReason) updateData.cancelReason = cancelReason;
        if (cancelNote) updateData.cancelNote = cancelNote;
      }
      await orderRef.update(updateData);
    }

    const updatedOrder = await orderRef.get();

    res.status(200).json({
      success: true,
      order: updatedOrder.val(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
};

const getPublicOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const restaurantsSnapshot = await db.ref("restaurants").get();
    const restaurants = restaurantsSnapshot.val();

    if (!restaurants) {
      return res.status(404).json({ error: "Order not found" });
    }

    let foundOrder = null;
    let foundRestaurantId = null;

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

    const publicOrderData = {
      id: orderId,
      status: foundOrder.status,
      amount: foundOrder.amount,
      currency: foundOrder.currency || "USD",
      items: foundOrder.items || [],
      restaurantId: foundRestaurantId,
      restaurantName: foundOrder.restaurantName,
      createdAt: foundOrder.createdAt,
      updatedAt: foundOrder.updatedAt || foundOrder.createdAt,
      statusHistory: foundOrder.statusHistory || {},
    };

    res.status(200).json({ success: true, data: { order: publicOrderData } });
  } catch (error) {
    console.error("Error fetching public order status:", error);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
};

// Cleanup old pending orders (older than 24 hours)
const cleanupOldPendingOrders = async (req, res) => {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const pendingOrdersSnapshot = await db.ref("pendingOrders").get();
    const pendingOrders = pendingOrdersSnapshot.val();

    if (!pendingOrders) {
      return res.status(200).json({
        success: true,
        message: "No pending orders to clean",
        cleaned: 0,
      });
    }

    const toDelete = [];
    for (const [orderId, order] of Object.entries(pendingOrders)) {
      if (order.createdAt < twentyFourHoursAgo) {
        toDelete.push(orderId);
        await db.ref(`pendingOrders/${orderId}`).remove();
      }
    }

    console.log(`🗑️ Cleaned up ${toDelete.length} old pending orders`);

    res.status(200).json({
      success: true,
      message: `Cleaned up ${toDelete.length} old pending orders`,
      cleaned: toDelete.length,
    });
  } catch (error) {
    console.error("Error cleaning up pending orders:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  createOrderFromPOS,
  calculateCartDiscountsEndpoint,
  getOrderBySession,
  getAllOrders,
  getAllOrdersAdmin,
  getOrderById,
  getSessionStatus,
  updateOrderStatus,
  getPublicOrderStatus,
  cleanupOldPendingOrders,
};
