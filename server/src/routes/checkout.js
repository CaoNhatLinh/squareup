const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  checkoutController.handleWebhook
);

router.use(express.json());
router.post("/create-session", checkoutController.createCheckoutSession);
router.get("/session/:sessionId", checkoutController.getSessionStatus);
router.post("/cleanup-pending", checkoutController.cleanupOldPendingOrders);

module.exports = router;
