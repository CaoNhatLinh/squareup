const admin = require('firebase-admin');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
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
    if (req.user.admin) {
      req.restaurantId = restaurantId;
      return next();
    }

    const db = admin.database();
    const snapshot = await db.ref(`users/${userId}/restaurants/${restaurantId}`).once('value');
    
    if (!snapshot.exists()) {
      return res.status(403).json({ error: 'Not authorized to access this restaurant' });
    }
    
    req.restaurantId = restaurantId;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { verifyToken, verifyRestaurantOwnership };
