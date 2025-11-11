import * as apiClient from './apiClient';

export const getRestaurantOrders = async (restaurantId) => {
  const response = await apiClient.get(`/api/orders/restaurant/${restaurantId}`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return response.data;
};

export const getOrderDetails = async (orderId) => {
  return getOrderById(orderId);
}

export const getOrderBySession = async (sessionId, restaurantId) => {
  const response = await apiClient.get(`/api/orders/session/${sessionId}?restaurantId=${restaurantId}`);
  return response.data;
};

export const updateOrderStatus = async (restaurantId, orderId, status) => {
  const response = await apiClient.patch(`/api/orders/restaurant/${restaurantId}/${orderId}/status`, { status });
  return response.data;
};

export const trackOrderStatus = async (orderId) => {
  const response = await apiClient.get(`/api/orders/track/${orderId}`);
  return response.data;
};