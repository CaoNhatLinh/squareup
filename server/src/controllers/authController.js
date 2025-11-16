const admin = require('firebase-admin');
const config = require('../config');
const db = admin.database();

async function createDefaultRestaurant(uid, userName) {
  const restaurantId = db.ref('restaurants').push().key;
  const restaurantData = {
    id: restaurantId,
    ownerId: uid,
    name: `${userName}'s Restaurant`,
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    coverImage: '',
    hours: {},
    socialMedia: {},
    settings: {},
    items: {},
    categories: {},
    modifiers: {},
    discounts: {},
    specialClosures: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.ref(`restaurants/${restaurantId}`).set(restaurantData);
  await db.ref(`users/${uid}/restaurants/${restaurantId}`).set({
    name: restaurantData.name,
    role: 'owner',
    createdAt: Date.now(),
    active: true,
  });
  return restaurantId;
}

async function sessionLogin(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await admin.auth().getUser(uid);
    const userRef = db.ref(`users/${uid}`);
    const userSnapshot = await userRef.get();
    const customClaims = userRecord.customClaims || {};
    let role = 'user';
    let isAdmin = false;
    let staffRestaurantId = null;

    if (customClaims.admin) {
      role = 'admin';
      isAdmin = true;
    } else if (customClaims.role === 'guest') {
      role = 'guest';
    } else if (customClaims.role === 'staff') {
      role = 'staff';
      staffRestaurantId = customClaims.restaurantId || null;
    }
    
    console.log('sessionLogin - User:', {
      uid,
      email: userRecord.email,
      role,
      isAdmin,
      customClaims
    });
    
    const userData = {
      uid: uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
      photoURL: userRecord.photoURL || null,
      emailVerified: userRecord.emailVerified,
      role: role,
      isAdmin: isAdmin,
      lastLoginAt: Date.now(),
    };

    // Only create/check restaurants for non-guest users
    if (role !== 'guest') {
      if (!userSnapshot.exists()) {
        userData.createdAt = Date.now();
        await userRef.set(userData);
        if (role === 'staff' && staffRestaurantId) {
          const restSnap = await db.ref(`restaurants/${staffRestaurantId}`).get();
          const restName = restSnap.exists() ? restSnap.val().name : 'Restaurant';
          await db.ref(`users/${uid}/restaurants/${staffRestaurantId}`).set({
            name: restName,
            role: 'staff',
            createdAt: Date.now(),
            active: true,
          });
        } else if (role !== 'staff') {
          const restaurantId = await createDefaultRestaurant(uid, userData.displayName);
        }
      } else {
        await userRef.update(userData);
        const restaurantsSnapshot = await db.ref(`users/${uid}/restaurants`).get();
        if (!restaurantsSnapshot.exists()) {
          if (role === 'staff' && staffRestaurantId) {
            const restSnap = await db.ref(`restaurants/${staffRestaurantId}`).get();
            const restName = restSnap.exists() ? restSnap.val().name : 'Restaurant';
            await db.ref(`users/${uid}/restaurants/${staffRestaurantId}`).set({
              name: restName,
              role: 'staff',
              createdAt: Date.now(),
              active: true,
            });
          } else if (role !== 'staff') {
            const restaurantId = await createDefaultRestaurant(uid, userData.displayName);
          }
        }
      }
    } else {
      // For guest users, only save/update user data without creating restaurants
      if (!userSnapshot.exists()) {
        userData.createdAt = Date.now();
        await userRef.set(userData);
      } else {
        await userRef.update(userData);
      }
    }
    
    const expiresIn = 5 * 24 * 60 * 60 * 1000; 
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    res.cookie('session', sessionCookie, options);
    return res.json({ ok: true, user: userData });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Failed to create session' });
  }
}

async function sessionLogout(req, res) {
  try {
    const sessionCookie = req.cookies && req.cookies.session;
    if (sessionCookie) {
      try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie);
        await admin.auth().revokeRefreshTokens(decoded.uid);
      } catch (e) {
      }
    }
    res.clearCookie('session', { path: '/' });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to logout' });
  }
}

async function verifySession(req, res) {
  try {
    const sessionCookie = req.cookies && req.cookies.session;
    if (!sessionCookie) {
      return res.status(401).json({ error: 'No session' });
    }
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    const userRecord = await admin.auth().getUser(decoded.uid);
    const customClaims = userRecord.customClaims || {};
    let role = 'user';
    let isAdmin = false;
    let restaurantId = null;
    let permissions = {};
    
    if (customClaims.admin) {
      role = 'admin';
      isAdmin = true;
    } else if (customClaims.role === 'guest') {
      role = 'guest';
    } else if (customClaims.role === 'staff') {
      role = 'staff';
      restaurantId = customClaims.restaurantId;
      if (restaurantId) {
        const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff/${decoded.uid}`).get();
        if (staffSnapshot.exists()) {
          const staffData = staffSnapshot.val();
          const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${staffData.roleId}`).get();
          if (roleSnapshot.exists()) {
            permissions = roleSnapshot.val().permissions || {};
          }
        }
      }
    }
    
    return res.json({ 
      uid: decoded.uid, 
      email: decoded.email,
      isAdmin: isAdmin,
      role: role,
      restaurantId: restaurantId,
      permissions: permissions
    });
  } catch (err) {
    console.error('verifySession error:', err.message);
    return res.status(401).json({ error: 'Invalid session' });
  }
}

module.exports = { sessionLogin, sessionLogout, verifySession };
