import * as client from './apiClient'

export async function verifySession() {
  const res = await client.get('/auth/verifySession');
  // client.get returns normalized shape { data, meta, success }
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
    // Don't throw - allow logout to proceed even if server call fails
    return { ok: false }
  }
}
