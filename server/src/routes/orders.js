const express = require("express");
const router = express.Router({ mergeParams: true });
const checkoutController = require("../controllers/checkoutController");
const verifyToken = require("../middleware/verifyToken");

// Public endpoint: Get order status (no auth required - for guest customers)
router.get("/track/:orderId", checkoutController.getPublicOrderStatus);

// Get order by sessionId (called by frontend after checkout)
router.get("/session/:sessionId", checkoutController.getOrderBySession);

// Get all orders (admin)
router.get("/all", checkoutController.getAllOrdersAdmin);

// Get all orders for a restaurant
router.get("/restaurant/:restaurantId", checkoutController.getAllOrders);

// Update order status (protected)
router.patch("/restaurant/:restaurantId/:orderId/status", verifyToken, checkoutController.updateOrderStatus);

// Get order by ID
router.get("/:orderId", checkoutController.getOrderById);

module.exports = router;