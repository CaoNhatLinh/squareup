import * as apiClient from './apiClient';

export const getRestaurantOrders = async (restaurantId) => {
  const response = await apiClient.get(`/orders/restaurant/${restaurantId}`);
  return { orders: response.data || [], meta: response.meta || {} };
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

export const getOrderDetails = async (orderId) => {
  return getOrderById(orderId);
}

export const getOrderBySession = async (sessionId, restaurantId) => {
  const response = await apiClient.get(`/orders/session/${sessionId}?restaurantId=${restaurantId}`);
  return response.data;
};

export const updateOrderStatus = async (restaurantId, orderId, status, cancelReason = null, cancelNote = null) => {
  const payload = { status };
  if (status === 'cancelled') {
    if (cancelReason) payload.cancelReason = cancelReason;
    if (cancelNote) payload.cancelNote = cancelNote;
  }
  const response = await apiClient.patch(`/orders/restaurant/${restaurantId}/${orderId}/status`, payload);
  return response.data;
};

export const trackOrderStatus = async (orderId) => {
  const response = await apiClient.get(`/orders/track/${orderId}`);
  return response.data;
};

export const createOrder = async (restaurantId, orderData) => {
  const response = await apiClient.post(`/orders/restaurant/${restaurantId}`, orderData);
  return response.data;
};