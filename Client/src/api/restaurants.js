import * as client from './apiClient'

export async function getUserRestaurants() {
  const res = await client.get('/restaurants')
  return res.data
}

export async function createRestaurant(data) {
  const res = await client.post('/restaurants', data)
  return res.data
}

export async function fetchRestaurant(restaurantId) {
  const res = await client.get(`/restaurants/${restaurantId}`, )
  return res.data
}

export async function fetchRestaurantForShop(restaurantId) {
  const res = await client.get(`/restaurants/${restaurantId}/shop`)
  return res.data
}

export async function upsertRestaurant(restaurantId, body) {
  const res = await client.put(`/restaurants/${restaurantId}`, body, )
  return res.data
}

export async function updateBusinessHours(restaurantId, hours) {
  const res = await client.put(`/restaurants/${restaurantId}`, { hours } )
  return res.data
}

export async function updateBusinessLocation(restaurantId, location) {
  const res = await client.put(`/restaurants/${restaurantId}`, {
    address: location.address,
    phone: location.phone,
    email: location.email
  })
  return res.data
}

export async function deleteRestaurant(restaurantId) {
  const res = await client.del(`/restaurants/${restaurantId}`)
  return res.data
}
