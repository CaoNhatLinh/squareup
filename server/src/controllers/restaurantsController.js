const admin = require('firebase-admin');
const db = admin.database();

async function getRestaurant(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Restaurant not found' });
    return res.json({ id: uid, ...snap.val() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getRestaurantForShop(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Restaurant not found' });
    
    const data = snap.val();
    // Return only public data needed for shop page
    return res.json({
      id: uid,
      name: data.name || '',
      categories: data.categories || {},
      items: data.items || {},
      modifiers: data.modifiers || {},
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateRestaurant(req, res) {
  const { uid } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  try {
    await db.ref(`restaurants/${uid}`).update(req.body);
    const snap = await db.ref(`restaurants/${uid}`).get();
    return res.json({ id: uid, ...snap.val() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getRestaurant,
  getRestaurantForShop,
  updateRestaurant,
};
