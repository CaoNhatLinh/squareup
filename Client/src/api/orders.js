import * as apiClient from './apiClient';

/**
 * Get all orders for a restaurant
 */
export const getRestaurantOrders = async (restaurantId) => {
  const response = await apiClient.get(`/api/orders/restaurant/${restaurantId}`);
  return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return response.data;
};

/**
 * Get order details (alias for getOrderById)
 */
export const getOrderDetails = async (orderId) => {
  return getOrderById(orderId);
}

/**
 * Get order by sessionId
 */
export const getOrderBySession = async (sessionId, restaurantId) => {
  const response = await apiClient.get(`/api/orders/session/${sessionId}?restaurantId=${restaurantId}`);
  return response.data;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (restaurantId, orderId, status) => {
  const response = await apiClient.patch(`/api/orders/restaurant/${restaurantId}/${orderId}/status`, { status });
  return response.data;
};

/**
 * Public API: Track order status (no authentication required)
 * For guest customers to check their order status
 */
export const trackOrderStatus = async (orderId) => {
  const response = await apiClient.get(`/api/orders/track/${orderId}`);
  return response.data;
};