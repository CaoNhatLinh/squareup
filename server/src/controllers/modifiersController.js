const admin = require('firebase-admin');
const db = admin.database();

async function listModifiers(req, res) {
  const { restaurantId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const q = (req.query.q || '').toLowerCase().trim();
  const sortBy = req.query.sortBy || 'name';
  const sortDir = (req.query.sortDir || 'asc').toLowerCase();
  try {
    const snap = await db.ref(`restaurants/${restaurantId}/modifiers`).get();
    const allObj = snap.exists() ? snap.val() : {};
    let list = Object.values(allObj || {});
    if (q) {
      list = list.filter(m => (m.name || '').toLowerCase().includes(q) || (m.displayName || '').toLowerCase().includes(q));
    }
    if (sortBy) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = list.sort((a, b) => {
        const va = (a[sortBy] || '').toString().toLowerCase();
        const vb = (b[sortBy] || '').toString().toLowerCase();
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
async function getModifier(req, res) {
  const { restaurantId, modifierId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${restaurantId}/modifiers/${modifierId}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Modifier not found' });
    return res.json({ success: true, data: snap.val() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createModifier(req, res) {
  const { restaurantId } = req.params;
  
  const { name, displayName, options = [], selectionType = 'multiple', required = false } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (!Array.isArray(options)) return res.status(400).json({ error: 'options must be an array' });
  
  try {
    const ref = db.ref(`restaurants/${restaurantId}/modifiers`).push();
    const id = ref.key;
    
    const optionsObject = {};
    options.forEach(option => {
      const optionRef = db.ref(`restaurants/${restaurantId}/modifiers/${id}/options`).push();
      const optionId = optionRef.key;
      optionsObject[optionId] = {
        id: optionId,
        name: option.name || '',
        price: option.price || 0,
        index: option.index || 0
      };
    });
    
    await ref.set({ 
      id, 
      name,
      displayName: displayName || name,
      options: optionsObject,
      selectionType: selectionType,
      required: required || false,
      createdAt: Date.now() 
    });
    
    return res.status(201).json({ success: true, data: {
      id, 
      name,
      displayName: displayName || name, 
      options: optionsObject,
      selectionType,
      required
    } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateModifier(req, res) {
  const { restaurantId, modifierId } = req.params;
  
  const { name, displayName, options, selectionType, required } = req.body;
  if (!name && options === undefined && selectionType === undefined && required === undefined && displayName === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  if (options !== undefined && !Array.isArray(options)) {
    return res.status(400).json({ error: 'options must be an array' });
  }
  
  try {
    const modRef = db.ref(`restaurants/${restaurantId}/modifiers/${modifierId}`);
    const snap = await modRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Modifier not found' });
    
    const updates = {};
    if (name) updates.name = name;
    if (displayName !== undefined) updates.displayName = displayName;
    if (selectionType !== undefined) updates.selectionType = selectionType;
    if (required !== undefined) updates.required = required;
    
    if (options !== undefined) {
      const optionsObject = {};
      options.forEach(option => {
        const optionId = option.id || db.ref(`restaurants/${restaurantId}/modifiers/${modifierId}/options`).push().key;
        optionsObject[optionId] = {
          id: optionId,
          name: option.name || '',
          price: option.price || 0,
          index: option.index || 0
        };
      });
      updates.options = optionsObject;
    }
    
    updates.updatedAt = Date.now();
    await modRef.update(updates);
    
    const updated = (await modRef.get()).val();
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteModifier(req, res) {
  const { restaurantId, modifierId } = req.params;
  
  try {
    const modRef = db.ref(`restaurants/${restaurantId}/modifiers/${modifierId}`);
    const snap = await modRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Modifier not found' });
    await modRef.remove();
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listModifiers,
  getModifier,
  createModifier,
  updateModifier,
  deleteModifier,
};
