const admin = require('firebase-admin');
const db = admin.database();

async function listCategories(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}/categories`).get();
    return res.json(snap.exists() ? snap.val() : {});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getCategory(req, res) {
  const { uid, categoryId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}/categories/${categoryId}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Category not found' });
    return res.json(snap.val());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createCategory(req, res) {
  const { uid } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  const { name, image = null, parentCategoryId = null, itemIds = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (itemIds && !Array.isArray(itemIds)) return res.status(400).json({ error: 'itemIds must be an array' });
  
  try {
    // If parentCategoryId is provided, validate it exists and is not a subcategory
    if (parentCategoryId) {
      const parentRef = db.ref(`restaurants/${uid}/categories/${parentCategoryId}`);
      const parentSnap = await parentRef.get();
      if (!parentSnap.exists()) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
      const parentData = parentSnap.val();
      // Check if parent is already a subcategory (has a parentCategoryId)
      if (parentData.parentCategoryId) {
        return res.status(400).json({ error: 'Cannot create subcategory of a subcategory. Maximum 2 levels allowed.' });
      }
    }
    
    const ref = db.ref(`restaurants/${uid}/categories`).push();
    const id = ref.key;
    await ref.set({ 
      id, 
      name, 
      image, 
      parentCategoryId,
      itemIds: itemIds || [],
      createdAt: Date.now() 
    });
    return res.status(201).json({ id, name, image, parentCategoryId, itemIds });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateCategory(req, res) {
  const { uid, categoryId } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  const { name, image, parentCategoryId, itemIds } = req.body;
  if (!name && image === undefined && parentCategoryId === undefined && itemIds === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  if (itemIds !== undefined && !Array.isArray(itemIds)) {
    return res.status(400).json({ error: 'itemIds must be an array' });
  }
  
  try {
    const catRef = db.ref(`restaurants/${uid}/categories/${categoryId}`);
    const snap = await catRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Category not found' });
    
    const currentData = snap.val();
    
    // If updating parentCategoryId, validate
    if (parentCategoryId !== undefined && parentCategoryId !== null) {
      const parentRef = db.ref(`restaurants/${uid}/categories/${parentCategoryId}`);
      const parentSnap = await parentRef.get();
      if (!parentSnap.exists()) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
      const parentData = parentSnap.val();
      // Check if parent is already a subcategory
      if (parentData.parentCategoryId) {
        return res.status(400).json({ error: 'Cannot make this a subcategory of a subcategory. Maximum 2 levels allowed.' });
      }
      // Check if current category has any subcategories
      const allCategoriesSnap = await db.ref(`restaurants/${uid}/categories`).get();
      if (allCategoriesSnap.exists()) {
        const allCategories = allCategoriesSnap.val();
        const hasSubcategories = Object.values(allCategories).some(
          cat => cat.parentCategoryId === categoryId
        );
        if (hasSubcategories) {
          return res.status(400).json({ error: 'Cannot make this a subcategory because it already has subcategories.' });
        }
      }
    }
    
    const updates = {};
    if (name) updates.name = name;
    if (image !== undefined) updates.image = image;
    if (parentCategoryId !== undefined) updates.parentCategoryId = parentCategoryId;
    if (itemIds !== undefined) updates.itemIds = itemIds;
    updates.updatedAt = Date.now();
    await catRef.update(updates);
    const updated = (await catRef.get()).val();
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteCategory(req, res) {
  const { uid, categoryId } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  try {
    const catRef = db.ref(`restaurants/${uid}/categories/${categoryId}`);
    const snap = await catRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Category not found' });
    await catRef.remove();
    // categories hold itemIds; items do not reference categories
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
