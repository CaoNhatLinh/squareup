import * as apiClient from './apiClient'

/**
 * Create Stripe checkout session
 */
export const createCheckoutSession = async (restaurantId, items) => {
  const response = await apiClient.post("/api/checkout/create-session", {
    restaurantId,
    items,
  });
  return response.data;
};

/**
 * Get checkout session status
 */
export const getSessionStatus = async (sessionId) => {
  const response = await apiClient.get(`/api/checkout/session/${sessionId}`);
  return response.data;
};
