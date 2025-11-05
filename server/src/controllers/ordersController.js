const admin = require('firebase-admin');
const db = admin.database();

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    const orderSnapshot = await db.ref(`orders/${orderId}`).once("value");
    const order = orderSnapshot.val();
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
 * Get order details (alias for getOrderById)
 */
exports.getOrderDetails = async (req, res) => {
  return exports.getOrderById(req, res);
};

/**
 * Get order by sessionId
 * Frontend calls this to retrieve order saved by webhook
 */
exports.getOrderBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    const ordersSnapshot = await db
      .ref("orders")
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

    // Query orders by restaurantId
    const ordersSnapshot = await db
      .ref("orders")
      .orderByChild("restaurantId")
      .equalTo(restaurantId)
      .once("value");

    const ordersData = ordersSnapshot.val();

    if (!ordersData) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    // Convert to array and sort by createdAt (newest first)
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
 * Get all orders (admin)
 */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const ordersSnapshot = await db.ref("orders").once("value");
    const ordersData = ordersSnapshot.val();

    if (!ordersData) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    // Convert to array and sort by createdAt (newest first)
    const orders = Object.values(ordersData).sort(
      (a, b) => b.createdAt - a.createdAt
    );

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




    