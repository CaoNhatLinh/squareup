import * as apiClient from './apiClient';

/**
 * Get all staff members for a restaurant
 */
export const getStaffMembers = async (restaurantId) => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/staff`);
  return response.data;
};

/**
 * Invite a new staff member
 */
export const inviteStaff = async (restaurantId, data) => {
  const response = await apiClient.post(`/restaurants/${restaurantId}/staff/invite`, data);
  return response.data;
};

/**
 * Update staff member's role
 */
export const updateStaffRole = async (restaurantId, staffId, roleId) => {
  const response = await apiClient.patch(`/restaurants/${restaurantId}/staff/${staffId}/role`, { roleId });
  return response.data;
};

/**
 * Remove a staff member
 */
export const removeStaff = async (restaurantId, staffId) => {
  const response = await apiClient.delete(`/restaurants/${restaurantId}/staff/${staffId}`);
  return response.data;
};

/**
 * Get invitation details by token
 */
export const getInvitation = async (token) => {
  const response = await apiClient.get(`/invitations/${token}`);
  return response.data;
};

/**
 * Accept invitation and create account
 */
export const acceptInvitation = async (data) => {
  const response = await apiClient.post('/invitations/accept', data);
  return response.data;
};

/**
 * Resend invitation
 */
export const resendInvitation = async (invitationId) => {
  const response = await apiClient.post(`/invitations/${invitationId}/resend`);
  return response.data;
};
