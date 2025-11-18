import * as apiClient from './apiClient';

export async function calculateDiscounts(restaurantId, items, options = {}) {
  // options: { couponCode, loyaltyCard }
  const res = await apiClient.post('/checkout/calculate-discounts', { restaurantId, items, options });
  return res.data;
}

export default { calculateDiscounts };
