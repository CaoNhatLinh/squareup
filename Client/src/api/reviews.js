import * as apiClient from './apiClient';

/**
 * Add review to an order (with optional item reviews)
 * @param {string} orderId - Order ID
 * @param {object} reviewData - { rating, feedback, guestUuid, itemReviews: [{ itemId, rating, feedback }] }
 */
export const addOrderReview = async (orderId, reviewData) => {
  const response = await apiClient.post(`/api/reviews/${orderId}/review`, reviewData);
  return response.data;
};

/**
 * Get reviews for a specific order
 */
export const getOrderReviews = async (orderId) => {
  const response = await apiClient.get(`/api/reviews/${orderId}/reviews`);
  return response.data;
};

/**
 * Get all reviews for a restaurant
 */
export const getRestaurantReviews = async (restaurantId) => {
  const response = await apiClient.get(`/api/reviews/restaurant/${restaurantId}/reviews`);
  return response.data;
};

/**
 * Get all reviews for a specific item
 */
export const getItemReviews = async (restaurantId, itemId) => {
  const response = await apiClient.get(`/api/reviews/restaurant/${restaurantId}/items/${itemId}/reviews`);
  return response.data;
};
