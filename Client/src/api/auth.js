import axios from 'axios'

export async function verifySession() {
  const res = await axios.get('http://localhost:5000/api/auth/verifySession', { withCredentials: true })
  return res.data
}

export async function sessionLogin(idToken) {
  try {
    const res = await axios.post(
      'http://localhost:5000/api/auth/sessionLogin',
      { idToken },
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    return res.data
  } catch (error) {
    console.error('sessionLogin failed:', error)
    throw error
  }
}

export async function sessionLogout() {
  try {
    const res = await axios.post(
      'http://localhost:5000/api/auth/sessionLogout',
      {},
      { withCredentials: true }
    )
    return res.data
  } catch (error) {
    console.error('sessionLogout failed:', error)
    // Don't throw - allow logout to proceed even if server call fails
    return { ok: false }
  }
}
