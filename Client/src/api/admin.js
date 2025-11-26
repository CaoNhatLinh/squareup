import * as apiClient from '@/api/apiClient';

export const getAllRestaurants = () => {
  return apiClient.get('/admin/restaurants').then(res => ({ restaurants: res.data || [], meta: res.meta || {} }));
};

export const getAllUsers = () => {
  return apiClient.get('/admin/users').then(res => ({ users: res.data || [], meta: res.meta || {} }));
};

export const setAdminRole = (uid) => {
  return apiClient.post('/admin/set-admin', { uid }).then(res => res.data);
};

export const removeAdminRole = (uid) => {
  return apiClient.post('/admin/remove-admin', { uid }).then(res => res.data);
};
