const admin = require('firebase-admin');
const db = admin.database();

async function listModifiers(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}/modifiers`).get();
    return res.json(snap.exists() ? snap.val() : {});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getModifier(req, res) {
  const { uid, modifierId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}/modifiers/${modifierId}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Modifier not found' });
    return res.json(snap.val());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createModifier(req, res) {
  const { uid } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  
  const { name, displayName, options = [], selectionType = 'multiple', required = false } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (!Array.isArray(options)) return res.status(400).json({ error: 'options must be an array' });
  
  try {
    const ref = db.ref(`restaurants/${uid}/modifiers`).push();
    const id = ref.key;
    
    // Convert options array to object with generated IDs
    const optionsObject = {};
    options.forEach(option => {
      const optionRef = db.ref(`restaurants/${uid}/modifiers/${id}/options`).push();
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
      selectionType: selectionType, // 'single' or 'multiple'
      required: required || false,
      createdAt: Date.now() 
    });
    
    return res.status(201).json({ 
      id, 
      name,
      displayName: displayName || name, 
      options: optionsObject,
      selectionType,
      required
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateModifier(req, res) {
  const { uid, modifierId } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  
  const { name, displayName, options, selectionType, required } = req.body;
  if (!name && options === undefined && selectionType === undefined && required === undefined && displayName === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  if (options !== undefined && !Array.isArray(options)) {
    return res.status(400).json({ error: 'options must be an array' });
  }
  
  try {
    const modRef = db.ref(`restaurants/${uid}/modifiers/${modifierId}`);
    const snap = await modRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Modifier not found' });
    
    const updates = {};
    if (name) updates.name = name;
    if (displayName !== undefined) updates.displayName = displayName;
    if (selectionType !== undefined) updates.selectionType = selectionType;
    if (required !== undefined) updates.required = required;
    
    // If options are provided, convert array to object
    if (options !== undefined) {
      const optionsObject = {};
      options.forEach(option => {
        // If option has an id, use it; otherwise generate a new one
        const optionId = option.id || db.ref(`restaurants/${uid}/modifiers/${modifierId}/options`).push().key;
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
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteModifier(req, res) {
  const { uid, modifierId } = req.params;
  if (req.user.uid !== uid) return res.status(403).json({ error: 'Forbidden' });
  
  try {
    const modRef = db.ref(`restaurants/${uid}/modifiers/${modifierId}`);
    const snap = await modRef.get();
    if (!snap.exists()) return res.status(404).json({ error: 'Modifier not found' });
    
    await modRef.remove();
    
    // Note: modifierIds are stored on items; we don't need to clean up reverse references
    // since we removed the itemIds array from modifiers
    
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
