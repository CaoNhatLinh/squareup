import * as apiClient from './apiClient';

/**
 * Get all roles for a restaurant
 */
export const getRoles = async (restaurantId, params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.q) query.append('q', params.q);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDir) query.append('sortDir', params.sortDir);
  const url = `/restaurants/${restaurantId}/roles${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return { roles: response.data || [], meta: response.meta || {} };
};

/**
 * Get a single role
 */
export const getRole = async (restaurantId, roleId) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/roles/${roleId}`);
  return response.data;
};

/**
 * Create a new role
 */
export const createRole = async (restaurantId, roleData) => {
  const response = await apiClient.post(`/restaurants/${restaurantId}/roles`, roleData);
  return response.data;
};

/**
 * Update a role
 */
export const updateRole = async (restaurantId, roleId, roleData) => {
  const response = await apiClient.patch(`/restaurants/${restaurantId}/roles/${roleId}`, roleData);
  return response.data;
};

/**
 * Delete a role
 */
export const deleteRole = async (restaurantId, roleId) => {
  const response = await apiClient.delete(`/restaurants/${restaurantId}/roles/${roleId}`);
  return response.data;
};

/**
 * Get permissions structure
 */
export const getPermissionsStructure = async () => {
  const response = await apiClient.get('/roles/permissions-structure');
  return response.data;
};
