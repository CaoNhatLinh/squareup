import * as apiClient from '@/api/apiClient';

export async function calculateDiscounts(restaurantId, items, options = {}) {
  
  const res = await apiClient.post('/checkout/calculate-discounts', { restaurantId, items, options });
  return res.data;
}

export default { calculateDiscounts };
