const express = require("express");
const router = express.Router({ mergeParams: true });
const ordersController = require("../controllers/ordersController");

// Get order by sessionId (called by frontend after checkout)
router.get("/session/:sessionId", ordersController.getOrderBySession);

// Get all orders (admin)
router.get("/all", ordersController.getAllOrdersAdmin);

// Get all orders for a restaurant
router.get("/restaurant/:restaurantId", ordersController.getAllOrders);

// Get order by ID
router.get("/:orderId", ordersController.getOrderById);

module.exports = router;