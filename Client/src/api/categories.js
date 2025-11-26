import * as client from '@/api/apiClient'

export async function fetchCategories(restaurantId, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.q) queryParams.append('q', params.q);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDir) queryParams.append('sortDir', params.sortDir);
  const url = `/restaurants/${restaurantId}/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await client.get(url);
  return { categories: res.data || [], meta: res.meta || {} };
}

export async function createCategory(restaurantId, body) {
  const res = await client.post(`/restaurants/${restaurantId}/categories`, body)
  return res.data;
}

export async function deleteCategory(restaurantId, catId) {
  const res = await client.del(`/restaurants/${restaurantId}/categories/${catId}`)
  return res.data;
}

export async function updateCategory(restaurantId, catId, body) {
  const res = await client.put(`/restaurants/${restaurantId}/categories/${catId}`, body)
  return res.data;
}

export async function fetchCategory(restaurantId, catId) {
  const res = await client.get(`/restaurants/${restaurantId}/categories/${catId}`)
  return res.data;
}
