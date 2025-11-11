import * as client from './apiClient'

export async function fetchItems(restaurantId) {
  const res = await client.get(`/api/restaurants/${restaurantId}/items`)
  return res.data
}

export async function createItem(restaurantId, body) {
  const res = await client.post(`/api/restaurants/${restaurantId}/items`, body)
  return res.data
}

export async function updateItem(restaurantId, itemId, body) {
  const res = await client.put(`/api/restaurants/${restaurantId}/items/${itemId}`, body)
  return res.data
}

export async function deleteItem(restaurantId, itemId) {
  const res = await client.del(`/api/restaurants/${restaurantId}/items/${itemId}`)
  return res.data
}

/**
 * Toggle item sold out status
 */
export async function toggleItemSoldOut(restaurantId, itemId, isSoldOut) {
  const res = await client.patch(`/api/restaurants/${restaurantId}/items/${itemId}`, { isSoldOut })
  return res.data
}
