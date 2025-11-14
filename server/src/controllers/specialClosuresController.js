const admin = require('firebase-admin');
const db = admin.database();
async function fetchSpecialClosures(req, res) {
    const { restaurantId } = req.params;
    try {
        const snapshot = await db.ref(`restaurants/${restaurantId}/specialClosures`).get();
        const specialClosuresData = snapshot.val();
        
        let specialClosures = [];
        if (specialClosuresData) {
            if (Array.isArray(specialClosuresData)) {
                specialClosures = specialClosuresData;
            } else {
                specialClosures = Object.entries(specialClosuresData).map(([id, data]) => ({
                    id,
                    ...data
                }));
            }
        }
        res.json(specialClosures);
    } catch (error) {
        console.error('Error fetching special closures:', error);
        res.status(500).json({ error: 'Failed to fetch special closures' });
    }
}
async function getSpecialClosures(req, res) {
  const { restaurantId, specialClosureId } = req.params;
  try {
    const snapshot = await db.ref(`restaurants/${restaurantId}/specialClosures/${specialClosureId}`).once('value');
    const specialClosure = snapshot.val();
    res.json(specialClosure);
  } catch (error) {
    console.error('Error fetching special closures:', error);
    res.status(500).json({ error: 'Failed to fetch special closures' });
  }
}
async function addSpecialClosure(req, res) {
  const { restaurantId } = req.params;
  const closure = req.body;
  try {
    await db.ref(`restaurants/${restaurantId}/specialClosures`).push(closure);
    res.status(201).json({ message: 'Special closure added successfully' });
  } catch (error) {
    console.error('Error adding special closure:', error);
    res.status(500).json({ error: 'Failed to add special closure' });
  }
}
async function updateSpecialClosure(req, res) {
  const { restaurantId, specialClosureId } = req.params;
  const updatedClosure = req.body;
  try {
    await db.ref(`restaurants/${restaurantId}/specialClosures/${specialClosureId}`).update(updatedClosure);
    res.json({ message: 'Special closure updated successfully' });
  } catch (error) {
    console.error('Error updating special closure:', error);
    res.status(500).json({ error: 'Failed to update special closure' });
  }
}
async function removeSpecialClosure(req, res) {
  const { restaurantId, specialClosureId } = req.params;
  try {
    await db.ref(`restaurants/${restaurantId}/specialClosures/${specialClosureId}`).remove();
    res.json({ message: 'Special closure removed successfully' });
  } catch (error) {
    console.error('Error removing special closure:', error);
    res.status(500).json({ error: 'Failed to remove special closure' });
  }
}

module.exports = {
  fetchSpecialClosures,
  getSpecialClosures,
  addSpecialClosure,
  updateSpecialClosure,
  removeSpecialClosure
};