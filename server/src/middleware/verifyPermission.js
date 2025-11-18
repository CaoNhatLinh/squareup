const admin = require('firebase-admin');
const db = admin.database();
function verifyPermission(resource, permission) {
  return async (req, res, next) => {
    try {
      let user = req.user;
      if (!user) {
        try {
            const { getDecodedUserFromRequest } = require('../utils/auth');
          user = await getDecodedUserFromRequest(req);
        } catch (err) {
          return res.status(401).json({ error: 'Authentication required' });
        }
      }
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (user.admin || user.admin === true) {
        return next();
      }
      const userRole = user.role || user.customClaims?.role || null;

      if (userRole !== 'staff') {
        return next();
      }

      const restaurantId = user.restaurantId || req.params.restaurantId || user.customClaims?.restaurantId;
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID not found' });
      }
      const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff/${user.uid}`).get();
      if (!staffSnapshot.exists()) {
        return res.status(403).json({ error: 'Not a staff member of this restaurant' });
      }

      const staffData = staffSnapshot.val();
      const roleId = staffData.roleId;
      const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).get();
      if (!roleSnapshot.exists()) {
        return res.status(403).json({ error: 'Role not found' });
      }

      const role = roleSnapshot.val();
      const permissions = role.permissions || {};

      if (permissions[resource] && permissions[resource][permission]) {
        req.restaurantId = restaurantId;
        req.userRole = role;
        return next();
      }

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: { resource, permission }
      });
    } catch (error) {
      console.error('verifyPermission error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
}

async function verifyStaffOrAdmin(req, res, next) {
  try {
    let user = req.user;
    if (!user) {
      try {
          const { getDecodedUserFromRequest } = require('../utils/auth');
        user = await getDecodedUserFromRequest(req);
        req.user = user;
      } catch (err) {
        if (err?.status === 403 && err?.isGuest) {
          return res.status(403).json({ error: 'Guest users cannot access this route', isGuest: true });
        }
        return res.status(err?.status || 401).json({ error: err?.message || 'Authentication required' });
      }
    }
    if (user.admin) {
      return next();
    }
    const userRole = user.role || user.customClaims?.role || null;
    if (userRole === 'staff') {
      req.staffRestaurantId = user.restaurantId || user.customClaims?.restaurantId;
      return next();
    }

      return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('verifyStaffOrAdmin error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}


async function getUserPermissions(userId, restaurantId) {
  try {
    const userRecord = await admin.auth().getUser(userId);
    if (userRecord.customClaims?.admin) {
      return getAllPermissions();
    }
    const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff/${userId}`).get();
    
    if (!staffSnapshot.exists()) {
      return {};
    }

    const staffData = staffSnapshot.val();
    const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${staffData.roleId}`).get();
    
    if (!roleSnapshot.exists()) {
      return {};
    }

    return roleSnapshot.val().permissions || {};
  } catch (error) {
    console.error('getUserPermissions error:', error);
    return {};
  }
}


function getAllPermissions() {
  const resources = [
    'items',
    'categories',
    'modifiers',
    'discounts',
    'orders',
    'transactions',
    'reviews',
    'business_settings',
    'staff',
    'customers',
    'pos',
  ];

  const allPermissions = {};
  resources.forEach(resource => {
    allPermissions[resource] = {
      create: true,
      read: true,
      update: true,
      delete: true,
      access: true,
    };
  });

  return allPermissions;
}

module.exports = {
  verifyPermission,
  verifyStaffOrAdmin,
  getUserPermissions,
};
