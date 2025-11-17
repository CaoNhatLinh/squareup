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
  return response.data || [];
};

/**
 * Get all reviews for a restaurant
 */
export const getRestaurantReviews = async (restaurantId, params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  const url = `/restaurants/${restaurantId}/reviews${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return { reviews: response.data || [], meta: response.meta || {}, averageRating: response.meta?.averageRating || 0, totalReviews: response.meta?.totalReviews || 0 };
};

/**
 * Get all reviews for a specific item
 */
export const getItemReviews = async (restaurantId, itemId, params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  const url = `/restaurants/${restaurantId}/items/${itemId}/reviews${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return { reviews: response.data || [], meta: response.meta || {}, averageRating: response.meta?.averageRating || 0, totalReviews: response.meta?.totalReviews || 0 };
};
