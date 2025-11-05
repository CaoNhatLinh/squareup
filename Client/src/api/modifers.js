import * as client from './apiClient'

export async function fetchModifiers(uid) {
  const res = await client.get(`/api/restaurants/${uid}/modifiers`)
  return res.data
}

export async function createModifier(uid, body) {
  const res = await client.post(`/api/restaurants/${uid}/modifiers`, body)
  return res.data
}

export async function deleteModifier(uid, modId) {
  const res = await client.del(`/api/restaurants/${uid}/modifiers/${modId}`)
  return res.data
}

export async function updateModifier(uid, modId, body) {
  const res = await client.put(`/api/restaurants/${uid}/modifiers/${modId}`, body)
  return res.data
}

export async function getModifier(uid, modId) {
  const res = await client.get(`/api/restaurants/${uid}/modifiers/${modId}`)
  return res.data
}
