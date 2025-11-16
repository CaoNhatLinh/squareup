import * as apiClient from './apiClient';

export const createCheckoutSession = async (restaurantId, items, guestUuid = null) => {
  const response = await apiClient.post("/checkout/create-session", {
    restaurantId,
    items,
    guestUuid,
  });
  return response.data;
};

export const getSessionStatus = async (sessionId) => {
  const response = await apiClient.get(`/checkout/session/${sessionId}`);
  return response.data;
};
