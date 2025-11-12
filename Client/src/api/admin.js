import * as apiClient from './apiClient';

export const getAllRestaurants = () => {
  return apiClient.get('/api/admin/restaurants');
};

export const getAllUsers = () => {
  return apiClient.get('/api/admin/users');
};

export const setAdminRole = (uid) => {
  return apiClient.post('/api/admin/set-admin', { uid });
};

export const removeAdminRole = (uid) => {
  return apiClient.post('/api/admin/remove-admin', { uid });
};
