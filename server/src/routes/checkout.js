const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");

// Stripe webhook (MUST be first, needs raw body for signature verification)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  checkoutController.handleWebhook
);

// All other routes use JSON
router.use(express.json());

// Create checkout session  
router.post("/create-session", checkoutController.createCheckoutSession);

// Get Stripe session status
router.get("/session/:sessionId", checkoutController.getSessionStatus);

module.exports = router;
