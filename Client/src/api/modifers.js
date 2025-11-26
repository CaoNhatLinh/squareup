import * as client from '@/api/apiClient'

export async function fetchModifiers(restaurantId, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.q) queryParams.append('q', params.q);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDir) queryParams.append('sortDir', params.sortDir);
  const url = `/restaurants/${restaurantId}/modifiers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await client.get(url);
  return { modifiers: res.data || [], meta: res.meta || {} };
}

export async function createModifier(restaurantId, body) {
  const res = await client.post(`/restaurants/${restaurantId}/modifiers`, body)
  return res.data;
}

export async function deleteModifier(restaurantId, modId) {
  const res = await client.del(`/restaurants/${restaurantId}/modifiers/${modId}`)
  return res.data;
}

export async function updateModifier(restaurantId, modId, body) {
  const res = await client.put(`/restaurants/${restaurantId}/modifiers/${modId}`, body)
  return res.data;
}

export async function getModifier(restaurantId, modId) {
  const res = await client.get(`/restaurants/${restaurantId}/modifiers/${modId}`)
  return res.data;
}
