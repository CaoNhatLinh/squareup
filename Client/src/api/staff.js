import * as apiClient from '@/api/apiClient';


export const getStaffMembers = async (restaurantId, params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.q) query.append('q', params.q);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDir) query.append('sortDir', params.sortDir);
  const url = `/restaurants/${restaurantId}/staff${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return { staff: response.data || [], meta: response.meta || {} };
};


export const inviteStaff = async (restaurantId, data) => {
  const response = await apiClient.post(`/restaurants/${restaurantId}/staff/invite`, data);
  return response.data;
};


export const updateStaffRole = async (restaurantId, staffId, roleId) => {
  const response = await apiClient.patch(`/restaurants/${restaurantId}/staff/${staffId}/role`, { roleId });
  return response.data;
};


export const deleteStaff = async (restaurantId, staffId) => {
  const response = await apiClient.del(`/restaurants/${restaurantId}/staff/${staffId}`);
  return response.data;
};


export const getInvitation = async (token) => {
  const response = await apiClient.get(`/invitations/${token}`);
  return response.data;
};


export const acceptInvitation = async (data) => {
  const response = await apiClient.post('/invitations/accept', data);
  return response.data;
};


export const resendInvitation = async (invitationId) => {
  const response = await apiClient.post(`/invitations/${invitationId}/resend`);
  return response.data;
};
