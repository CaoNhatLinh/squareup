import * as client from './apiClient'

export async function fetchRestaurant(uid, idToken) {
  const res = await client.get(`/api/restaurants/${uid}`, { idToken })
  return res.data
}

export async function fetchRestaurantForShop(uid) {
  // Public endpoint - no authentication required
  const res = await client.get(`/api/restaurants/${uid}/shop`)
  return res.data
}

export async function upsertRestaurant(uid, body, idToken) {
  const res = await client.put(`/api/restaurants/${uid}`, body, { idToken })
  return res.data
}

export async function updateBusinessHours(uid, hours, idToken) {
  const res = await client.put(`/api/restaurants/${uid}`, { hours }, { idToken })
  return res.data
}

export async function updateBusinessLocation(uid, location, idToken) {
  const res = await client.put(`/api/restaurants/${uid}`, { 
    address: location.address,
    phone: location.phone,
    email: location.email
  }, { idToken })
  return res.data
}

