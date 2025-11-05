import { auth } from '../firebase'

async function getIdToken() {
  if (!auth.currentUser) return null
  return await auth.currentUser.getIdToken()
}

function buildHeaders(token, contentType) {
  const headers = {}
  if (contentType) headers['Content-Type'] = contentType
  if (token) headers['Authorization'] = 'Bearer ' + token
  return headers
}

export default function useApi() {
  async function get(url) {
    const token = await getIdToken()
    return fetch(url, { headers: buildHeaders(token) })
  }
  async function post(url, body) {
    const token = await getIdToken()
    return fetch(url, { method: 'POST', headers: buildHeaders(token, 'application/json'), body: JSON.stringify(body) })
  }
  async function put(url, body) {
    const token = await getIdToken()
    return fetch(url, { method: 'PUT', headers: buildHeaders(token, 'application/json'), body: JSON.stringify(body) })
  }
  async function del(url) {
    const token = await getIdToken()
    return fetch(url, { method: 'DELETE', headers: buildHeaders(token) })
  }

  return { get, post, put, del }
}
