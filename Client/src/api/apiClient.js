import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect for public pages
      if (!currentPath.includes('/signin') &&
        !currentPath.includes('/signup') &&
        !currentPath.includes('/accept-invitation') &&
        !currentPath.includes('/admin') &&
        !currentPath.includes('/restaurant') &&
        !currentPath.includes('/pos') &&
        !currentPath.includes('/settings') &&
        !currentPath.includes('/customers') &&
        !currentPath.includes('/reviews') &&
        !currentPath.includes('/transactions')) {
        // For public pages, don't redirect on 401
        return Promise.reject(error);
      }
      window.location.href = '/signin';
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
  if (idTokenOverride) {
    headers['Authorization'] = 'Bearer ' + idTokenOverride
    return headers
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
    // Ensure we don't send Content-Type if it's multipart/form-data (let browser handle boundary)
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

