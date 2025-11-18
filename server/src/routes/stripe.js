const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");

// POS Payment Routes
router.post("/create-payment-link", stripeController.createPaymentLink);
router.post("/process-payment", stripeController.processPayment);
router.get("/payment-link/:linkId", stripeController.getPaymentLink);
router.get("/payment-intent/:paymentIntentId", stripeController.getPaymentIntent);

module.exports = router;
