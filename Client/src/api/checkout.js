import * as apiClient from './apiClient';

export const createSession = async (payload) => {
  const res = await apiClient.post('/checkout/create-session', payload);
  return res.data;
};

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

export const calculateDiscounts = async (restaurantId, items) => {
  const res = await apiClient.post('/checkout/calculate-discounts', { restaurantId, items });
  return res.data;
};

export default {
  createSession,
  createCheckoutSession,
  getSessionStatus,
  calculateDiscounts,
};
