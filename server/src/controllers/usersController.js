const admin = require('firebase-admin');
const db = admin.database();

async function getUser(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`users/${uid}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: uid, ...snap.val() });
  } catch (err) {
    console.error('getUser error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAllUsers(req, res) {
  try {
    const snap = await db.ref('users').get();
    if (!snap.exists()) return res.json({ users: [] });
    
    const users = [];
    snap.forEach((child) => {
      users.push({ id: child.key, ...child.val() });
    });
    
    return res.json({ users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getUser,
  getAllUsers,
};
