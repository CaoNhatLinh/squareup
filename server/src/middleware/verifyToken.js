const admin = require('firebase-admin');

async function verifyToken(req, res, next) {
  try {
    const sessionCookie = req.cookies?.session;
    if (sessionCookie) {
      try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
        
        // Block guest users from accessing admin/restaurant routes
        if (decoded.role === 'guest') {
          return res.status(403).json({ 
            error: 'Guest users cannot access management routes',
            isGuest: true 
          });
        }
        
        req.user = decoded;
        return next();
      } catch (err) {
        console.log('Session cookie verification failed:', err.message);
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authentication' });
    }
    
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    
    // Block guest users from accessing admin/restaurant routes
    if (decoded.role === 'guest') {
      return res.status(403).json({ 
        error: 'Guest users cannot access management routes',
        isGuest: true 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('verifyToken error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function verifyRestaurantOwnership(req, res, next) {
  const userId = req.user.uid;
  const restaurantId = req.params.restaurantId;
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }
  
  try {
    // Get user record to check custom claims
    const userRecord = await admin.auth().getUser(userId);
    const customClaims = userRecord.customClaims || {};
    
    // Allow admin users
    if (req.user.admin || customClaims.admin) {
      req.restaurantId = restaurantId;
      return next();
    }

    // Block guest users from restaurant management
    if (customClaims.role === 'guest') {
      return res.status(403).json({ error: 'Guest users cannot manage restaurants' });
    }

    // Check restaurant ownership for regular users
    const db = admin.database();
    const snapshot = await db.ref(`users/${userId}/restaurants/${restaurantId}`).once('value');
    
    if (!snapshot.exists()) {
      return res.status(403).json({ error: 'Not authorized to access this restaurant' });
    }
    
    req.restaurantId = restaurantId;
    next();
  } catch (err) {
    console.error('verifyRestaurantOwnership error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { verifyToken, verifyRestaurantOwnership };
