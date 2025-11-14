import axios from 'axios'
import { auth } from '../firebase'

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, 
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

let authReadyPromise = null;
// waitForAuthReady is kept for potential future use with guest orders
// eslint-disable-next-line no-unused-vars
function waitForAuthReady() {
  if (authReadyPromise) return authReadyPromise;
  
  authReadyPromise = new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
    
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);
  });
  
  return authReadyPromise;
}

async function buildAuthHeaders(contentType, idTokenOverride) {
  const headers = {}
  if (contentType) headers['Content-Type'] = contentType
  
  // If idTokenOverride is explicitly provided, use it (for guest orders)
  if (idTokenOverride) {
    headers['Authorization'] = 'Bearer ' + idTokenOverride
    return headers
  }
  
  // Otherwise, rely on session cookies (for authenticated admin/restaurant routes)
  // withCredentials: true will send session cookies automatically
  return headers
}

export async function get(url, opts = {}) {
  const headers = await buildAuthHeaders(null, opts.idToken)
  return instance.get(url, { headers })
}
export async function post(url, body, opts = {}) {
  const contentType = opts.headers?.['Content-Type'] || 'application/json'
  const headers = await buildAuthHeaders(contentType === 'multipart/form-data' ? null : contentType, opts.idToken)
  
  // Merge with custom headers if provided
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
