import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
})

export function parseApiResponse(response) {
  const payload = response?.data;
  if (!payload) return { data: null };
  // If payload uses { success, data, meta } shape, unwrap to normalized shape
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return {
      success: payload.success !== undefined ? payload.success : true,
      data: payload.data,
      meta: payload.meta || {},
      has_more: payload.has_more || false,
    };
  }
  // Otherwise, return { data } with the whole payload
  return { data: payload };
}

instance.interceptors.response.use(
  (response) => parseApiResponse(response),
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/signin') && 
          !currentPath.includes('/signup') && 
          !currentPath.includes('/accept-invitation')) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);


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
  const contentType = opts.headers?.['Content-Type'] || 'application/json'
  const headers = await buildAuthHeaders(contentType === 'multipart/form-data' ? null : contentType, opts.idToken)
  if (opts.headers) {
    Object.assign(headers, opts.headers)
  }


  return instance.post(url, body, { headers })
}
export async function put(url, body, opts = {}) {
  const headers = await buildAuthHeaders('application/json', opts.idToken)
  return instance.put(url, body, { headers })
}
export async function patch(url, body, opts = {}) {
  const headers = await buildAuthHeaders('application/json', opts.idToken)
  return instance.patch(url, body, { headers })
}
export async function del(url, opts = {}) {
  const headers = await buildAuthHeaders(null, opts.idToken)
  return instance.delete(url, { headers })
}
