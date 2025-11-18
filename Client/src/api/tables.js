import apiClient from './apiClient';

/**
 * Get all tables for a restaurant
 */
export const getTables = async (restaurantId) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/tables`);
  return response.data;
};

/**
 * Get a specific table
 */
export const getTableById = async (restaurantId, tableId) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/tables/${tableId}`);
  return response.data;
};

/**
 * Create a new table
 */
export const createTable = async (restaurantId, tableData) => {
  const response = await apiClient.post(`/restaurants/${restaurantId}/tables`, tableData);
  return response.data;
};

/**
 * Update a table
 */
export const updateTable = async (restaurantId, tableId, tableData) => {
  const response = await apiClient.put(`/restaurants/${restaurantId}/tables/${tableId}`, tableData);
  return response.data;
};

/**
 * Delete a table
 */
export const deleteTable = async (restaurantId, tableId) => {
  const response = await apiClient.delete(`/restaurants/${restaurantId}/tables/${tableId}`);
  return response.data;
};

/**
 * Merge tables
 */
export const mergeTables = async (restaurantId, mergeData) => {
  const response = await apiClient.post(`/restaurants/${restaurantId}/tables/merge`, mergeData);
  return response.data;
};

/**
 * Clear table after checkout
 */
export const clearTable = async (restaurantId, tableId) => {
  const response = await apiClient.post(`/restaurants/${restaurantId}/tables/${tableId}/clear`);
  return response.data;
};
