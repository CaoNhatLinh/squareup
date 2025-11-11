const admin = require('firebase-admin');
const db = admin.database();

async function listItems(req, res) {
  const { restaurantId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${restaurantId}/items`).get();
    return res.json(snap.exists() ? snap.val() : {});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createItem(req, res) {
  const { restaurantId } = req.params;
  const { type = null, name, price = 0, description = '', image = null, categoryIds = [], modifierIds = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (categoryIds && !Array.isArray(categoryIds)) return res.status(400).json({ error: 'categoryIds must be an array' });
  if (modifierIds && !Array.isArray(modifierIds)) return res.status(400).json({ error: 'modifierIds must be an array' });
  try {
    const ref = db.ref(`restaurants/${restaurantId}/items`).push();
    const id = ref.key;
  const itemObj = { id, type, name, price, description, image, modifierIds: Array.isArray(modifierIds) ? modifierIds : [], createdAt: Date.now() };
    await ref.set(itemObj);

    if (Array.isArray(categoryIds) && categoryIds.length) {
      await Promise.all(categoryIds.map(async (catId) => {
        const itemIdsRef = db.ref(`restaurants/${restaurantId}/categories/${catId}/itemIds`);
        await itemIdsRef.transaction((current) => {
          if (current === null) return [id];
          if (!Array.isArray(current)) current = Object.values(current);
          if (current.includes(id)) return current;
          current.push(id);
          return current;
        });
      }));
    }


    return res.status(201).json(itemObj);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getItem(req, res) {
  const { restaurantId, itemId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${restaurantId}/items/${itemId}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Item not found' });
    return res.json(snap.val());
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateItem(req, res) {
  const { restaurantId, itemId } = req.params;
  const { type, name, price, description, image, categoryIds, modifierIds } = req.body;
  if (name === undefined && type === undefined && price === undefined && description === undefined && image === undefined && categoryIds === undefined && modifierIds === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  try {
    const itemRef = db.ref(`restaurants/${restaurantId}/items/${itemId}`);
    const snap = await itemRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Item not found' });
    const updates = {};
    if (type !== undefined) updates.type = type;
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;

    if (categoryIds !== undefined) {
      if (!Array.isArray(categoryIds)) return res.status(400).json({ error: 'categoryIds must be an array' });
      const catsSnap = await db.ref(`restaurants/${restaurantId}/categories`).get();
      const cats = catsSnap.exists() ? catsSnap.val() : {};
      const updatesForCats = {};
      Object.keys(cats).forEach((catId) => {
        const cat = cats[catId] || {};
        const currentItemIds = Array.isArray(cat.itemIds) ? cat.itemIds : (cat.itemIds ? Object.values(cat.itemIds) : []);
        const shouldContain = categoryIds.includes(catId);
        const contains = currentItemIds.includes(itemId);
        if (shouldContain && !contains) {
          const newArr = currentItemIds.concat([itemId]);
          updatesForCats[`categories/${catId}/itemIds`] = newArr;
        } else if (!shouldContain && contains) {
          const newArr = currentItemIds.filter((i) => i !== itemId);
          updatesForCats[`categories/${catId}/itemIds`] = newArr;
        }
      });
      if (Object.keys(updatesForCats).length) {
        await db.ref(`restaurants/${restaurantId}`).update(updatesForCats);
      }
    }

    if (modifierIds !== undefined) {
      if (!Array.isArray(modifierIds)) return res.status(400).json({ error: 'modifierIds must be an array' });
      updates.modifierIds = modifierIds;
    }

    updates.updatedAt = Date.now();
    await itemRef.update(updates);
    const updated = (await itemRef.get()).val();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteItem(req, res) {
  const { restaurantId, itemId } = req.params;
  try {
    const itemRef = db.ref(`restaurants/${restaurantId}/items/${itemId}`);
    const snap = await itemRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Item not found' });
    await itemRef.remove();

    const catsRef = db.ref(`restaurants/${restaurantId}/categories`);
    const catsSnap = await catsRef.get();
    if (catsSnap.exists()) {
      const cats = catsSnap.val();
      const updates = {};
      Object.keys(cats).forEach((catId) => {
        const cat = cats[catId] || {};
        const current = Array.isArray(cat.itemIds) ? cat.itemIds : (cat.itemIds ? Object.values(cat.itemIds) : []);
        if (current.includes(itemId)) {
          const newArr = current.filter((i) => i !== itemId);
          updates[`categories/${catId}/itemIds`] = newArr;
        }
      });
      if (Object.keys(updates).length) {
        await catsRef.update(updates);
      }
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listItems,
  createItem,
  getItem,
  updateItem,
  deleteItem,
};
