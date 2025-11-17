import * as apiClient from './apiClient';
export const getGuestOrderHistory = async (restaurantId, guestUuid) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/customers/guest/${guestUuid}/orders`);
  return response.data || [];
};
export const addOrderReview = async (orderId, reviewData) => {
  const response = await apiClient.post(`/orders/${orderId}/review`, reviewData);
  return response.data;
};

export const getOrderReviews = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/reviews`);
  return response.data || [];
};
