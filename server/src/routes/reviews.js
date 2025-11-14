const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/:orderId/review", reviewsController.addOrderReview);
router.get("/:orderId/reviews", reviewsController.getOrderReviews);
router.get("/restaurant/:restaurantId/reviews", verifyToken, reviewsController.getRestaurantReviews);
router.get("/restaurant/:restaurantId/items/:itemId/reviews", reviewsController.getItemReviews);

module.exports = router;
