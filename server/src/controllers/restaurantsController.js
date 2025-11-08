const admin = require('firebase-admin');
const db = admin.database();

async function getRestaurant(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Restaurant not found' });
    
    const data = snap.val();
    
    // Return only essential restaurant metadata (not orders, items, categories, modifiers)
    return res.json({
      id: uid,
      name: data.name || '',
      description: data.description || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      logo: data.logo || '',
      coverImage: data.coverImage || '',
      hours: data.hours || {},
      socialMedia: data.socialMedia || {},
      settings: data.settings || {},
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
function findNextOpenTime(hoursData, currentDayKey, currentTime) {
    const todayHours = hoursData[currentDayKey];
    if (todayHours && todayHours.timeSlots) {
        for (const slot of todayHours.timeSlots) {
            if (currentTime < slot.open) {
                return slot.open;
            }
        }
    }
    
    return null; 
}
async function getRestaurantForShop(req, res) {
    const { uid } = req.params;
    try {
        const snap = await db.ref(`restaurants/${uid}`).get();
        if (!snap.exists()) return res.status(404).json({ error: 'Restaurant not found' });
        
        const data = snap.val();
        const now = new Date();
        const todayDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const dayOfWeekKey = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); 
        const currentTime = now.toTimeString().slice(0, 5);
        
        let isOpen = false;
        let nextOpenTime = null;
        let closureReason = null; // NEW: Track closure reason
        
        // Check if today is a special closure date
        const specialClosuresData = data.specialClosures || [];
        
        // Convert to array if it's an object (Firebase push keys)
        let specialClosures = [];
        if (specialClosuresData) {
            if (Array.isArray(specialClosuresData)) {
                specialClosures = specialClosuresData;
            } else if (typeof specialClosuresData === 'object') {
                // Convert object with keys to array
                specialClosures = Object.values(specialClosuresData);
            }
        }
        
        const todaySpecialClosure = specialClosures.find(closure => {
            // Support both string format (old) and object format (new)
            if (typeof closure === 'string') {
                return closure === todayDateStr;
            }
            return closure.date === todayDateStr;
        });
        
        if (todaySpecialClosure) {
            isOpen = false;
            closureReason = typeof todaySpecialClosure === 'string' 
                ? 'Special Closure' 
                : todaySpecialClosure.reason || 'Special Closure';
        } else if (data.hours && data.hours[dayOfWeekKey]) {
            const todayHours = data.hours[dayOfWeekKey];

            if (todayHours.isClosed) {
                isOpen = false;
            } else if (todayHours.timeSlots && todayHours.timeSlots.length > 0) {
                
                for (const slot of todayHours.timeSlots) {
                    if (currentTime >= slot.open && currentTime < slot.close) {
                        isOpen = true;
                        break;
                    }
                }
                
                if (!isOpen) {
                    nextOpenTime = findNextOpenTime(data.hours, dayOfWeekKey, currentTime);
                }
            }
        }
        return res.json({
            id: uid,
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            categories: data.categories || {},
            items: data.items || {},
            modifiers: data.modifiers || {},
            hours: data.hours || {},
            isOpen,
            nextOpenTime,
            closureReason, // NEW: Send closure reason to frontend
            specialClosures: specialClosures, 
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
    const updateData = { ...req.body, updatedAt: Date.now() };
    await db.ref(`restaurants/${uid}`).update(updateData);
    const snap = await db.ref(`restaurants/${uid}`).get();
    const data = snap.val();
    
    // Return only essential metadata
    return res.json({
      id: uid,
      name: data.name || '',
      description: data.description || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      logo: data.logo || '',
      coverImage: data.coverImage || '',
      hours: data.hours || {},
      socialMedia: data.socialMedia || {},
      settings: data.settings || {},
      specialClosures: data.specialClosures || [],
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    });
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
