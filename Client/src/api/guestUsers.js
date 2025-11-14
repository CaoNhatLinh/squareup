import * as apiClient from './apiClient';



/**
 * Get guest user's order history
 */
export const getGuestOrderHistory = async (guestUuid) => {
  const response = await apiClient.get(`/api/guest-users/${guestUuid}/orders`);
  return response.data;
};

/**
 * Add review to an order
 */
export const addOrderReview = async (orderId, reviewData) => {
  const response = await apiClient.post(`/api/orders/${orderId}/review`, reviewData);
  return response.data;
};

/**
 * Get order reviews
 */
export const getOrderReviews = async (orderId) => {
  const response = await apiClient.get(`/api/orders/${orderId}/reviews`);
  return response.data;
};
