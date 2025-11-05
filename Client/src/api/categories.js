import * as client from './apiClient'

export async function fetchCategories(uid) {
  const res = await client.get(`/api/restaurants/${uid}/categories`)
  return res.data
}

export async function createCategory(uid, body) {
  const res = await client.post(`/api/restaurants/${uid}/categories`, body)
  return res.data
}

export async function deleteCategory(uid, catId) {
  const res = await client.del(`/api/restaurants/${uid}/categories/${catId}`)
  return res.data
}

export async function updateCategory(uid, catId, body) {
  const res = await client.put(`/api/restaurants/${uid}/categories/${catId}`, body)
  return res.data
}

export async function fetchCategory(uid, catId) {
  const res = await client.get(`/api/restaurants/${uid}/categories/${catId}`)
  return res.data
}
