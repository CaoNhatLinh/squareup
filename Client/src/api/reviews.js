import * as apiClient from './apiClient';

/**
 * Add review to an order (with optional item reviews)
 * @param {string} orderId - Order ID
 * @param {object} reviewData - { rating, feedback, guestUuid, itemReviews: [{ itemId, rating, feedback }] }
 */
export const addOrderReview = async (orderId, reviewData) => {
  const response = await apiClient.post(`/orders/${orderId}/review`, reviewData);
  return response.data;
};

/**
 * Get reviews for a specific order
 */
export const getOrderReviews = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/reviews`);
  return response.data;
};

/**
 * Get all reviews for a restaurant
 */
export const getRestaurantReviews = async (restaurantId) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/reviews`);
  return response.data;
};

/**
 * Get all reviews for a specific item
 */
export const getItemReviews = async (restaurantId, itemId) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/items/${itemId}/reviews`);
  return response.data;
};
