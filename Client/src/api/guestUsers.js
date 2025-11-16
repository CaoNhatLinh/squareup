import * as apiClient from './apiClient';
/**
 * Get guest user's order history
 */
export const getGuestOrderHistory = async (guestUuid) => {
  const response = await apiClient.get(`/guest-users/${guestUuid}/orders`);
  return response.data;
};

/**
 * Add review to an order
 */
export const addOrderReview = async (orderId, reviewData) => {
  const response = await apiClient.post(`/orders/${orderId}/review`, reviewData);
  return response.data;
};

/**
 * Get order reviews
 */
export const getOrderReviews = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/reviews`);
  return response.data;
};
