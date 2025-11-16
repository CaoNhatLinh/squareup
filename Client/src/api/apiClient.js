import axios from 'axios'
const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, 
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on signin/signup/accept-invitation pages
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
