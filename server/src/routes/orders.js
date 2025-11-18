const express = require("express");
const router = express.Router({ mergeParams: true });
const verifyAdmin = require('../middleware/verifyAdmin');
const { verifyPermission } = require('../middleware/verifyPermission');
const checkoutController = require("../controllers/checkoutController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/track/:orderId", checkoutController.getPublicOrderStatus);
router.get("/session/:sessionId", checkoutController.getOrderBySession);
router.post("/restaurant/:restaurantId", verifyToken, checkoutController.createOrderFromPOS);
router.post("/restaurant/:restaurantId/hold", verifyToken, checkoutController.createHoldOrder);
router.get("/restaurant/:restaurantId/holds", verifyToken, checkoutController.getHoldOrders);
router.delete("/restaurant/:restaurantId/hold/:holdId", verifyToken, checkoutController.deleteHoldOrder);
router.get("/all", verifyAdmin, checkoutController.getAllOrdersAdmin);
router.get("/restaurant/:restaurantId", verifyPermission('orders','read'), checkoutController.getAllOrders);
router.patch("/restaurant/:restaurantId/:orderId/status", verifyPermission('orders','update'), checkoutController.updateOrderStatus);
router.get("/:orderId", checkoutController.getOrderById);

module.exports = router;