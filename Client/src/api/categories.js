import * as client from './apiClient'

export async function fetchCategories(restaurantId) {
  const res = await client.get(`/api/restaurants/${restaurantId}/categories`)
  return res.data
}

export async function createCategory(restaurantId, body) {
  const res = await client.post(`/api/restaurants/${restaurantId}/categories`, body)
  return res.data
}

export async function deleteCategory(restaurantId, catId) {
  const res = await client.del(`/api/restaurants/${restaurantId}/categories/${catId}`)
  return res.data
}

export async function updateCategory(restaurantId, catId, body) {
  const res = await client.put(`/api/restaurants/${restaurantId}/categories/${catId}`, body)
  return res.data
}

export async function fetchCategory(restaurantId, catId) {
  const res = await client.get(`/api/restaurants/${restaurantId}/categories/${catId}`)
  return res.data
}
