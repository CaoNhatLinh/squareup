const admin = require('firebase-admin');

async function verifyToken(req, res, next) {
  try {
    if (!req.user) {
      const decoded = await getDecodedUserFromRequest(req);
      req.user = decoded;
    }
    return next();
  } catch (err) {
    if (err?.status === 403 && err?.isGuest) {
      return res.status(403).json({ error: err.message, isGuest: true });
    }
    return res.status(err?.status || 401).json({ error: err?.message || 'Unauthorized' });
  }
}

const { getDecodedUserFromRequest } = require('../utils/auth');

async function verifyMembership(req, res, next) {
  let user = req.user;
  if (!user) {
    try {
      user = await getDecodedUserFromRequest(req);
      req.user = user;
    } catch (err) {
      if (err?.status === 403 && err?.isGuest) {
        return res.status(403).json({ error: 'Guest users cannot manage restaurants' });
      }
      return res.status(err?.status || 401).json({ error: err?.message || 'Authentication required' });
    }
  }
  const userId = user.uid;
  const restaurantId = req.params.restaurantId;
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }
  
  try {
    // Use normalized claims on req.user. No need to re-fetch getUser unless required.
    if (req.user.admin) {
      req.restaurantId = restaurantId;
      return next();
    }
    if (req.user.role === 'guest') {
      return res.status(403).json({ error: 'Guest users cannot manage restaurants' });
    }
    const db = admin.database();
    const snapshot = await db.ref(`users/${userId}/restaurants/${restaurantId}`).once('value');
    
    if (!snapshot.exists()) {
      return res.status(403).json({ error: 'Not authorized to access this restaurant' });
    }
    
    req.restaurantId = restaurantId;
    next();
  } catch (err) {
    console.error('verifyMembership error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { verifyToken, verifyMembership, getDecodedUserFromRequest };
