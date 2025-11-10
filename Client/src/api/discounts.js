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

export const fetchDiscounts = async (uid) => {
  try {
    const response = await client.get(`api/restaurants/${uid}/discounts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
};

export const fetchDiscount = async (uid, discountId) => {
  try {
    const response = await client.get(`api/restaurants/${uid}/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discount:', error);
    throw error;
  }
};

export const createDiscount = async (uid, discountData) => {
  try {
    const response = await client.post(`api/restaurants/${uid}/discounts`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
};

export const updateDiscount = async (uid, discountId, discountData) => {
  try {
    const response = await client.put(`api/restaurants/${uid}/discounts/${discountId}`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error updating discount:', error);
    throw error;
  }
};

export const deleteDiscount = async (uid, discountId) => {
  try {
    const response = await client.del(`api/restaurants/${uid}/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting discount:', error);
    throw error;
  }
};
