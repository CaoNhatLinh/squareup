const admin = require('firebase-admin');
const db = admin.database();

const getGuestOrderHistory = async (req, res) => {
  try {
    const { guestUuid } = req.params;

    if (!guestUuid) {
      return res.status(400).json({ error: "Guest UUID is required" });
    }
    const restaurantsSnapshot = await db.ref('restaurants').once('value');
    const restaurants = restaurantsSnapshot.val();

    if (!restaurants) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }
    const orders = [];
    for (const [restaurantId, restaurantData] of Object.entries(restaurants)) {
      if (restaurantData.orders) {
        for (const [orderId, order] of Object.entries(restaurantData.orders)) {
          if (order.guestUuid === guestUuid) {
            orders.push({
              ...order,
              restaurantId,
            });
          }
        }
      }
    }

    orders.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Error getting guest order history:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getGuestOrderHistory,
};
