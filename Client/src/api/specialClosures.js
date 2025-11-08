import * as client from './apiClient'
export async function fetchSpecialClosures(uid) {
  const res = await client.get(`/api/restaurants/${uid}/special-closures`)
  return res.data
}
export async function updateSpecialClosures(uid, specialClosures ) {
  const res = await client.put(`/api/restaurants/${uid}/special-closures/${specialClosures.id}`, { specialClosures })
  return res.data
}
export async function addSpecialClosure(uid, closure) {
  const res = await client.post(`/api/restaurants/${uid}/special-closures`, closure)
  return res.data
}
export async function removeSpecialClosure(uid, specialClosureId) {
  const res = await client.del(`/api/restaurants/${uid}/special-closures/${specialClosureId}`)
  return res.data
}
