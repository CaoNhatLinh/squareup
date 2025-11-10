import * as client from './apiClient'

export async function fetchRestaurant(uid) {
  const res = await client.get(`/api/restaurants/${uid}`, )
  return res.data
}

export async function fetchRestaurantForShop(uid) {
  // Public endpoint - no authentication required
  const res = await client.get(`/api/restaurants/${uid}/shop`)
  return res.data
}

export async function upsertRestaurant(uid, body) {
  const res = await client.put(`/api/restaurants/${uid}`, body, )
  return res.data
}

export async function updateBusinessHours(uid, hours) {
  const res = await client.put(`/api/restaurants/${uid}`, { hours } )
  return res.data
}

export async function updateBusinessLocation(uid, location) {
  const res = await client.put(`/api/restaurants/${uid}`, { 
    address: location.address,
    phone: location.phone,
    email: location.email
  })
  return res.data
}

