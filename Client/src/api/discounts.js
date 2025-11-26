import * as client from '@/api/apiClient';

export const fetchActiveDiscounts = async (restaurantId) => {
  try {
    const url = `/restaurants/${restaurantId}/discounts/active`;
    const response = await client.get(url);
    return { discounts: response.data || [], meta: response.meta || {} };
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

export const fetchDiscounts = async (restaurantId, params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.q) query.append('q', params.q);
    const url = `/restaurants/${restaurantId}/discounts${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await client.get(url);
    return { discounts: response.data || [], meta: response.meta || {} };
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
};

export const fetchDiscount = async (restaurantId, discountId) => {
  try {
    const response = await client.get(`/restaurants/${restaurantId}/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discount:', error);
    throw error;
  }
};

export const createDiscount = async (restaurantId, discountData) => {
  try {
    const response = await client.post(`/restaurants/${restaurantId}/discounts`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
};

export const updateDiscount = async (restaurantId, discountId, discountData) => {
  try {
    const response = await client.put(`/restaurants/${restaurantId}/discounts/${discountId}`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error updating discount:', error);
    throw error;
  }
};

export const deleteDiscount = async (restaurantId, discountId) => {
  try {
    const response = await client.del(`/restaurants/${restaurantId}/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting discount:', error);
    throw error;
  }
};
