import * as client from '@/api/apiClient'

export async function verifySession() {
  const res = await client.get('/auth/verifySession');

  return res.data;
}

export async function sessionLogin(idToken) {
  try {
    const res = await client.post('/auth/sessionLogin', { idToken }, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
  } catch (error) {
    console.error('sessionLogin failed:', error)
    throw error
  }
}

export async function sessionLogout() {
  try {
    const res = await client.post('/auth/sessionLogout', {});
    return res.data;
  } catch (error) {
    console.error('sessionLogout failed:', error)

    return { ok: false }
  }
}
