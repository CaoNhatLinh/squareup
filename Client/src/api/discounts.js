import * as client from './apiClient';

export const fetchActiveDiscounts = async (restaurantId) => {
  try {
    const url = `/restaurants/${restaurantId}/discounts/active`;
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

export const fetchDiscounts = async (restaurantId) => {
  try {
    const response = await client.get(`/restaurants/${restaurantId}/discounts`);
    return response.data;
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
