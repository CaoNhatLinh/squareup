const admin = require('firebase-admin');
const db = admin.database();

async function listItems(req, res) {
  const { restaurantId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const q = (req.query.q || '').toLowerCase().trim();
  const sortBy = req.query.sortBy || 'name';
  const sortDir = (req.query.sortDir || 'asc').toLowerCase();
  try {
    const snap = await db.ref(`restaurants/${restaurantId}/items`).get();
    const allObj = snap.exists() ? snap.val() : {};
    let list = Object.values(allObj || {});
    if (q) {
      list = list.filter(i => (i.name || '').toLowerCase().includes(q));
    }
    // sort
    if (sortBy) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = list.sort((a, b) => {
        let va = a[sortBy];
        let vb = b[sortBy];
        if (va === undefined || va === null) va = '';
        if (vb === undefined || vb === null) vb = '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    const total = list.length;
    const startIndex = Math.max((page - 1) * limit, 0);
    const endIndex = startIndex + limit;
    const paged = list.slice(startIndex, endIndex);
    return res.json({ success: true, data: paged, meta: { total, limit, page } });
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


    return res.status(201).json({ success: true, data: itemObj });
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
    return res.json({ success: true, data: updated });
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
    return res.json({ success: true, data: { ok: true } });
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
