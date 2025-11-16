import * as client from './apiClient'
export async function fetchSpecialClosures(restaurantId) {
  const res = await client.get(`/restaurants/${restaurantId}/special-closures`)
  return res.data
}
export async function updateSpecialClosures(restaurantId, specialClosures ) {
  const res = await client.put(`/restaurants/${restaurantId}/special-closures/${specialClosures.id}`, { specialClosures })
  return res.data
}
export async function addSpecialClosure(restaurantId, closure) {
  const res = await client.post(`/restaurants/${restaurantId}/special-closures`, closure)
  return res.data
}
export async function removeSpecialClosure(restaurantId, specialClosureId) {
  const res = await client.del(`/restaurants/${restaurantId}/special-closures/${specialClosureId}`)
  return res.data
}
