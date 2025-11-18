/**
 * Centralized token decoder for middlewares.
 * Use `getDecodedUserFromRequest(req)` to ensure a decoded user set on `req.user`.
 * This avoids repeating token parsing (session cookie or idToken) across middleware.
 */
const admin = require('firebase-admin');
/**
 * Reactive normalized struct for `req.user` in middleware: { uid, email, admin, role, restaurantId, customClaims }
 */

async function getDecodedUserFromRequest(req) {
  const adminAuth = admin.auth();
  if (req.user) {
    return normalizeDecodedClaims(req.user);
  }
  const sessionCookie = req.cookies?.session;
  if (sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      if (decoded.role === 'guest') {
        const err = new Error('Guest users cannot access management routes');
        err.status = 403;
        err.isGuest = true;
        throw err;
      }
      return normalizeDecodedClaims(decoded);
    } catch (err) {
      const error = new Error('Session cookie verification failed');
      error.status = 401;
      throw error;
    }
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid authentication');
    err.status = 401;
    throw err;
  }
  const idToken = authHeader.split(' ')[1];
  const decoded = await adminAuth.verifyIdToken(idToken);
  if (decoded.role === 'guest') {
    const err = new Error('Guest users cannot access management routes');
    err.status = 403;
    err.isGuest = true;
    throw err;
  }
  return normalizeDecodedClaims(decoded);
}

function normalizeDecodedClaims(decoded) {
  // Ensure common fields are always present for middleware
  const claims = decoded || {};
  const normalized = {
    uid: claims.uid,
    email: claims.email,
    admin: !!claims.admin,
    role: claims.role || claims.customClaims?.role || null,
    restaurantId: claims.restaurantId || claims.customClaims?.restaurantId || null,
    customClaims: claims,
  };
  return normalized;
}

module.exports = {
  getDecodedUserFromRequest,
};
