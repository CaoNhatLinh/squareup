import * as client from '@/api/apiClient'

function validateRestaurantId(restaurantId) {
  if (!restaurantId || restaurantId === 'undefined' || restaurantId === 'null') {
    throw new Error('Invalid restaurantId provided');
  }
}

export async function getUserRestaurants() {
  const res = await client.get('/restaurants')
  return res.data
}

export async function createRestaurant(data) {
  const res = await client.post('/restaurants', data)
  return res.data
}

export async function fetchRestaurant(restaurantId) {
  validateRestaurantId(restaurantId);
  const res = await client.get(`/restaurants/${restaurantId}`, )
  return res.data
}

export async function fetchRestaurantForShop(restaurantId) {
  validateRestaurantId(restaurantId);
  const res = await client.get(`/restaurants/${restaurantId}/shop`)
  return res.data
}

export async function upsertRestaurant(restaurantId, body) {
  validateRestaurantId(restaurantId);
  const res = await client.put(`/restaurants/${restaurantId}`, body, )
  return res.data
}

export async function updateBusinessHours(restaurantId, hours) {
  validateRestaurantId(restaurantId);
  const res = await client.put(`/restaurants/${restaurantId}`, { hours } )
  return res.data
}

export async function updateBusinessLocation(restaurantId, location) {
  validateRestaurantId(restaurantId);
  const res = await client.put(`/restaurants/${restaurantId}`, {
    address: location.address,
    phone: location.phone,
    email: location.email
  })
  return res.data
}

export async function deleteRestaurant(restaurantId) {
  validateRestaurantId(restaurantId);
  const res = await client.del(`/restaurants/${restaurantId}`)
  return res.data
}
