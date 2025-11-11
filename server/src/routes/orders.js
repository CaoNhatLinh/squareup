const express = require("express");
const router = express.Router({ mergeParams: true });
const checkoutController = require("../controllers/checkoutController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/track/:orderId", checkoutController.getPublicOrderStatus);
router.get("/session/:sessionId", checkoutController.getOrderBySession);
router.get("/all", checkoutController.getAllOrdersAdmin);
router.get("/restaurant/:restaurantId", checkoutController.getAllOrders);
router.patch("/restaurant/:restaurantId/:orderId/status", verifyToken, checkoutController.updateOrderStatus);
router.get("/:orderId", checkoutController.getOrderById);

module.exports = router;