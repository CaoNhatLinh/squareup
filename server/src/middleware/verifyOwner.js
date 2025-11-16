const admin = require('firebase-admin');
const db = admin.database();

async function verifyOwner(req, res, next) {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (user.admin || user.admin === true) {
      return next();
    }

    const restaurantId = req.params.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID not found' });
    }
    const userRole = user.role || user.customClaims?.role || null;
    if (userRole === 'staff') {
      return res.status(403).json({ 
        error: 'Owner access required',
        message: 'This action is restricted to restaurant owners only'
      });
    }
    const ownershipSnapshot = await db.ref(`users/${user.uid}/restaurants/${restaurantId}`).get();
    if (!ownershipSnapshot.exists()) {
      return res.status(403).json({ 
        error: 'Owner access required',
        message: 'You are not the owner of this restaurant'
      });
    }

    const restaurantMeta = ownershipSnapshot.val();
    if (restaurantMeta.role !== 'owner') {
      return res.status(403).json({ 
        error: 'Owner access required',
        message: 'This action is restricted to restaurant owners only'
      });
    }

    return next();
  } catch (error) {
    console.error('verifyOwner error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = verifyOwner;
