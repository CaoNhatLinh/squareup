import * as apiClient from './apiClient'

export const createCheckoutSession = async (restaurantId, items) => {
  const response = await apiClient.post("/api/checkout/create-session", {
    restaurantId,
    items,
  });
  return response.data;
};

export const getSessionStatus = async (sessionId) => {
  const response = await apiClient.get(`/api/checkout/session/${sessionId}`);
  return response.data;
};
