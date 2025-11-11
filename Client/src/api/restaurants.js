import * as client from './apiClient'

export async function getUserRestaurants() {
  const res = await client.get('/api/restaurants')
  return res.data
}

export async function createRestaurant(data) {
  const res = await client.post('/api/restaurants', data)
  return res.data
}

export async function fetchRestaurant(restaurantId) {
  const res = await client.get(`/api/restaurants/${restaurantId}`, )
  return res.data
}

export async function fetchRestaurantForShop(restaurantId) {
  const res = await client.get(`/api/restaurants/${restaurantId}/shop`)
  return res.data
}

export async function upsertRestaurant(restaurantId, body) {
  const res = await client.put(`/api/restaurants/${restaurantId}`, body, )
  return res.data
}

export async function updateBusinessHours(restaurantId, hours) {
  const res = await client.put(`/api/restaurants/${restaurantId}`, { hours } )
  return res.data
}

export async function updateBusinessLocation(restaurantId, location) {
  const res = await client.put(`/api/restaurants/${restaurantId}`, {
    address: location.address,
    phone: location.phone,
    email: location.email
  })
  return res.data
}

export async function deleteRestaurant(restaurantId) {
  const res = await client.del(`/api/restaurants/${restaurantId}`)
  return res.data
}
