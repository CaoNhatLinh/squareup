const admin = require('firebase-admin');

const db = admin.database();
const addOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, feedback, guestUuid, itemReviews } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!guestUuid) {
      return res.status(400).json({ error: "Guest UUID is required" });
    }
    if (itemReviews && Array.isArray(itemReviews)) {
      for (const itemReview of itemReviews) {
        if (!itemReview.itemId || !itemReview.rating || itemReview.rating < 1 || itemReview.rating > 5) {
          return res.status(400).json({ error: "Each item review must have itemId and rating (1-5)" });
        }
      }
    }
    const restaurantsSnapshot = await db.ref('restaurants').get();
    const restaurants = restaurantsSnapshot.val();

    if (!restaurants) {
      return res.status(404).json({ error: "Order not found" });
    }

    let foundOrder = null;
    let foundRestaurantId = null;

    for (const [restaurantId, restaurantData] of Object.entries(restaurants)) {
      if (restaurantData.orders && restaurantData.orders[orderId]) {
        foundOrder = restaurantData.orders[orderId];
        foundRestaurantId = restaurantId;
        break;
      }
    }

    if (!foundOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (foundOrder.guestUuid !== guestUuid) {
      return res.status(403).json({ error: "Unauthorized to review this order" });
    }
    if (foundOrder.review) {
      return res.status(400).json({ error: "Order has already been reviewed" });
    }
    const now = Date.now();
    const orderReviewData = {
      rating,
      feedback: feedback || "",
      guestUuid,
      createdAt: now,
      itemReviews: itemReviews || [], // Store item reviews within order review
    };

    await db.ref(`restaurants/${foundRestaurantId}/orders/${orderId}/review`).set(orderReviewData);
    const reviewId = db.ref(`restaurants/${foundRestaurantId}/reviews`).push().key;
    await db.ref(`restaurants/${foundRestaurantId}/reviews/${reviewId}`).set({
      ...orderReviewData,
      orderId,
      reviewId,
      type: 'order',
    });
    if (itemReviews && itemReviews.length > 0) {
      for (const itemReview of itemReviews) {
        const itemReviewId = db.ref(`restaurants/${foundRestaurantId}/items/${itemReview.itemId}/reviews`).push().key;
        
        const itemReviewData = {
          reviewId: itemReviewId,
          itemId: itemReview.itemId,
          orderId,
          rating: itemReview.rating,
          feedback: itemReview.feedback || "",
          guestUuid,
          createdAt: now,
        };
        await db.ref(`restaurants/${foundRestaurantId}/items/${itemReview.itemId}/reviews/${itemReviewId}`).set(itemReviewData);
      }
    }

    res.status(200).json({
      success: true,
      review: orderReviewData,
    });
  } catch (error) {
    console.error("Error adding order review:", error);
    res.status(500).json({ error: error.message });
  }
};

const getOrderReviews = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const restaurantsSnapshot = await db.ref('restaurants').get();
    const restaurants = restaurantsSnapshot.val();

    if (!restaurants) {
      return res.status(404).json({ error: "Order not found" });
    }

    let foundOrder = null;
    for (const [restaurantId, restaurantData] of Object.entries(restaurants)) {
      if (restaurantData.orders && restaurantData.orders[orderId]) {
        foundOrder = restaurantData.orders[orderId];
        break;
      }
    }
    if (!foundOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      success: true,
      review: foundOrder.review || null,
    });
  } catch (error) {
    console.error("Error getting order reviews:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }
    const reviewsSnapshot = await db.ref(`restaurants/${restaurantId}/reviews`).get();
    const reviewsData = reviewsSnapshot.val();

    if (!reviewsData) {
      return res.status(200).json({
        success: true,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
      });
    }

    const itemsSnapshot = await db.ref(`restaurants/${restaurantId}/items`).get();
    const itemsData = itemsSnapshot.val() || {};

    const reviews = Object.entries(reviewsData).map(([id, review]) => {
      const enrichedItemReviews = (review.itemReviews || []).map(itemReview => ({
        ...itemReview,
        name: itemsData[itemReview.itemId]?.name || 'Unknown Item',
        image: itemsData[itemReview.itemId]?.image || null,
      }));

      return {
        ...review,
        id,
        itemReviews: enrichedItemReviews,
      };
    });
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    reviews.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error getting restaurant reviews:", error);
    res.status(500).json({ error: error.message });
  }
};

const getItemReviews = async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;

    if (!restaurantId || !itemId) {
      return res.status(400).json({ error: "Restaurant ID and Item ID are required" });
    }

    const reviewsSnapshot = await db.ref(`restaurants/${restaurantId}/items/${itemId}/reviews`).get();
    const reviewsData = reviewsSnapshot.val();

    if (!reviewsData) {
      return res.status(200).json({
        success: true,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
      });
    }

    const reviews = Object.values(reviewsData);
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    reviews.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error getting item reviews:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addOrderReview,
  getOrderReviews,
  getRestaurantReviews,
  getItemReviews,
};
