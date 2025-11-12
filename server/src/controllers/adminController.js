const admin = require('firebase-admin');
const db = admin.database();

const getAllRestaurants = async (req, res) => {
  try {
    const restaurantsSnapshot = await db.ref('restaurants').once('value');
    const restaurantsData = restaurantsSnapshot.val();

    if (!restaurantsData) {
      return res.status(200).json({
        success: true,
        restaurants: [],
      });
    }

    const restaurants = Object.values(restaurantsData).map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      ownerId: restaurant.ownerId,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    }));

    const restaurantsWithOwnerInfo = await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          if (!restaurant.ownerId || typeof restaurant.ownerId !== 'string') {
            return {
              ...restaurant,
              ownerEmail: 'Unknown',
              ownerName: 'Unknown',
            };
          }

          const ownerRecord = await admin.auth().getUser(restaurant.ownerId);
          return {
            ...restaurant,
            ownerEmail: ownerRecord.email,
            ownerName: ownerRecord.displayName || ownerRecord.email?.split('@')[0],
          };
        } catch (error) {
          return {
            ...restaurant,
            ownerEmail: 'Unknown',
            ownerName: 'Unknown',
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      restaurants: restaurantsWithOwnerInfo,
      total: restaurantsWithOwnerInfo.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setAdminRole = async (req, res) => {
  try {
    const { uid } = req.body;
    const currentUserUid = req.user.uid;
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (uid === currentUserUid) {
      return res.status(403).json({ error: 'You cannot modify your own admin role' });
    }

    await admin.auth().setCustomUserClaims(uid, { admin: true });
    const userRef = db.ref(`users/${uid}`);
    await userRef.update({
      role: 'admin',
      updatedAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: `Admin role set for user ${uid}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeAdminRole = async (req, res) => {
  try {
    const { uid } = req.body;
    const currentUserUid = req.user.uid;
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (uid === currentUserUid) {
      return res.status(403).json({ error: 'You cannot modify your own admin role' });
    }

    await admin.auth().setCustomUserClaims(uid, { admin: false });

    const userRef = db.ref(`users/${uid}`);
    await userRef.update({
      role: 'user',
      updatedAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: `Admin role removed for user ${uid}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);

    const users = await Promise.all(
      listUsersResult.users.map(async (userRecord) => {
        const userSnapshot = await db.ref(`users/${userRecord.uid}`).once('value');
        const userData = userSnapshot.val();

        return {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          role: userData?.role || 'user',
          isAdmin: userRecord.customClaims?.admin || false,
          createdAt: userData?.createdAt || null,
          lastLoginAt: userData?.lastLoginAt || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRestaurants,
  setAdminRole,
  removeAdminRole,
  getAllUsers,
};
