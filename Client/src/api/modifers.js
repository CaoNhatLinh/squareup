import * as client from './apiClient'

export async function fetchModifiers(restaurantId) {
  const res = await client.get(`/restaurants/${restaurantId}/modifiers`)
  return res.data
}

export async function createModifier(restaurantId, body) {
  const res = await client.post(`/restaurants/${restaurantId}/modifiers`, body)
  return res.data
}

export async function deleteModifier(restaurantId, modId) {
  const res = await client.del(`/restaurants/${restaurantId}/modifiers/${modId}`)
  return res.data
}

export async function updateModifier(restaurantId, modId, body) {
  const res = await client.put(`/restaurants/${restaurantId}/modifiers/${modId}`, body)
  return res.data
}

export async function getModifier(restaurantId, modId) {
  const res = await client.get(`/restaurants/${restaurantId}/modifiers/${modId}`)
  return res.data
}
