import axios from 'axios'
import { auth } from '@/firebase'
const instance = axios.create({
  baseURL: "/api",
  withCredentials: true,
})
export function parseApiResponse(response) {
  const payload = response?.data;
  if (!payload) return { data: null };
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return {
      success: payload.success !== undefined ? payload.success : true,
      data: payload.data,
      meta: payload.meta || {},
      has_more: payload.has_more || false,
    };
  }
  return { data: payload };
}
instance.interceptors.response.use(
  (response) => parseApiResponse(response),
  async (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      console.log('401 Error intercepted at:', currentPath);
      const protectedPrefixes = [
        '/admin',
        '/settings',
        '/pos',
        '/restaurants',
        '/dashboard',
        '/customers',
        '/transactions',
        '/reviews',
        '/staff'
      ];
      const isProtected = protectedPrefixes.some(prefix => currentPath.startsWith(prefix));
      if (!isProtected) {
        console.log('Public/Dynamic path detected, skipping redirect');
        return Promise.reject(error);
      }
      console.log('Protected path detected, redirecting to signin');
      try {
        await auth.signOut();
      } catch (e) {
        console.error('Error signing out on 401:', e);
      }
      window.location.href = `/signin?returnUrl=${encodeURIComponent(currentPath + window.location.search)}`;
    }
    return Promise.reject(error);
  }
);
instance.interceptors.request.use((config) => {
  if (config && config.url && /\/restaurants\/(undefined|null)/.test(config.url)) {
    throw new Error(`Invalid API request to ${config.url}. restaurantId is missing or invalid.`);
  }
  return config;
});
async function buildAuthHeaders(contentType, idTokenOverride) {
  const headers = {}
  if (contentType) headers['Content-Type'] = contentType
  let token = idTokenOverride;
  if (!token && auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.error("Error getting ID token:", e);
    }
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }
  return headers
}
export async function get(url, opts = {}) {
  const headers = await buildAuthHeaders(null, opts.idToken)
  return instance.get(url, { headers })
}
export async function post(url, body, opts = {}) {
  let contentType = opts.headers?.['Content-Type'];
  if (!contentType && !(body instanceof FormData)) {
    contentType = 'application/json';
  }
  const headers = await buildAuthHeaders(contentType === 'multipart/form-data' ? null : contentType, opts.idToken);
  if (opts.headers) {
    Object.assign(headers, opts.headers);
    if (headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }
  }
  return instance.post(url, body, { headers });
}
export async function put(url, body, opts = {}) {
  let contentType = opts.headers?.['Content-Type'];
  if (!contentType && !(body instanceof FormData)) {
    contentType = 'application/json';
  }
  const headers = await buildAuthHeaders(contentType, opts.idToken);
  if (opts.headers) Object.assign(headers, opts.headers);
  return instance.put(url, body, { headers });
}
export async function patch(url, body, opts = {}) {
  let contentType = opts.headers?.['Content-Type'];
  if (!contentType && !(body instanceof FormData)) {
    contentType = 'application/json';
  }
  const headers = await buildAuthHeaders(contentType, opts.idToken);
  if (opts.headers) Object.assign(headers, opts.headers);
  return instance.patch(url, body, { headers });
}
export async function del(url, opts = {}) {
  const headers = await buildAuthHeaders(null, opts.idToken)
  return instance.delete(url, { headers })
}
export const apiClient = instance;
