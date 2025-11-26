import { apiClient } from '@/api/apiClient';


export async function findRestaurantBySlug(slug) {
  try {
    const response = await apiClient.get(`/restaurants/slug/${slug}`);
    return response;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error finding restaurant by slug:', error);
    throw error;
  }
}


export async function updateRestaurantSiteConfig(restaurantId, updates) {
  try {
    const response = await apiClient.put(`/restaurants/${restaurantId}/site-config`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating site config:', error);
    throw error;
  }
}


export async function isSlugAvailable(slug, currentRestaurantId = null) {
  try {
    const params = currentRestaurantId ? { currentRestaurantId } : {};
    const response = await apiClient.get(`/restaurants/check-slug/${slug}`, { params });
    return response.data.available;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
}


export async function generateSlug(name) {
  try {
    const response = await apiClient.post('/restaurants/generate-slug', { name });
    return response.data.slug;
  } catch (error) {
    console.error('Error generating slug:', error);
    
    return generateSlugClient(name);
  }
}


function generateSlugClient(name) {
  if (!name) return '';

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}