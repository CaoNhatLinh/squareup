import * as apiClient from './apiClient';

/**
 * Get all orders for a restaurant
 */
export const getRestaurantOrders = async (restaurantId) => {
  const response = await apiClient.get(`/api/orders/restaurant/${restaurantId}`);
  return response.data;
};

/**
 * Get all orders (admin)
 */
export const getAllOrders = async () => {
  const response = await apiClient.get('/api/orders/all');
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
 * This retrieves the order saved by webhook (more secure than verifyPayment)
 */
export const getOrderBySession = async (sessionId) => {
  const response = await apiClient.get(`/api/orders/session/${sessionId}`);
  return response.data;
};