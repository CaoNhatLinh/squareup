import * as client from './apiClient'

export async function fetchItems(uid) {
  const res = await client.get(`/api/restaurants/${uid}/items`)
  return res.data
}

export async function createItem(uid, body) {
  const res = await client.post(`/api/restaurants/${uid}/items`, body)
  return res.data
}

export async function updateItem(uid, itemId, body) {
  const res = await client.put(`/api/restaurants/${uid}/items/${itemId}`, body)
  return res.data
}

export async function deleteItem(uid, itemId) {
  const res = await client.del(`/api/restaurants/${uid}/items/${itemId}`)
  return res.data
}
