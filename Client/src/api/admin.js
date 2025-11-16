import * as apiClient from './apiClient';

export const getAllRestaurants = () => {
  return apiClient.get('/admin/restaurants');
};

export const getAllUsers = () => {
  return apiClient.get('/admin/users');
};

export const setAdminRole = (uid) => {
  return apiClient.post('/admin/set-admin', { uid });
};

export const removeAdminRole = (uid) => {
  return apiClient.post('/admin/remove-admin', { uid });
};
