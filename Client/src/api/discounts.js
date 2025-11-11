import * as client from './apiClient';

export const fetchActiveDiscounts = async (restaurantId) => {
  try {
    const url = `api/restaurants/${restaurantId}/discounts/active`;
    console.log('🌐 API Call:', url);
    const response = await client.get(url);
    console.log('📡 API Response:', response);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

export const fetchDiscounts = async (restaurantId) => {
  try {
    const response = await client.get(`api/restaurants/${restaurantId}/discounts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
};

export const fetchDiscount = async (restaurantId, discountId) => {
  try {
    const response = await client.get(`api/restaurants/${restaurantId}/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discount:', error);
    throw error;
  }
};

export const createDiscount = async (restaurantId, discountData) => {
  try {
    const response = await client.post(`api/restaurants/${restaurantId}/discounts`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
};

export const updateDiscount = async (restaurantId, discountId, discountData) => {
  try {
    const response = await client.put(`api/restaurants/${restaurantId}/discounts/${discountId}`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error updating discount:', error);
    throw error;
  }
};

export const deleteDiscount = async (restaurantId, discountId) => {
  try {
    const response = await client.del(`api/restaurants/${restaurantId}/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting discount:', error);
    throw error;
  }
};
