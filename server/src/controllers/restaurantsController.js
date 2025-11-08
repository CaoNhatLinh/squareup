const admin = require('firebase-admin');
const db = admin.database();

async function getRestaurant(req, res) {
  const { uid } = req.params;
  try {
    const snap = await db.ref(`restaurants/${uid}`).get();
    if (!snap.exists()) return res.status(404).json({ error: 'Restaurant not found' });
    
    const data = snap.val();
    
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
        const todayDateStr = now.toISOString().split('T')[0]; 
        const dayOfWeekKey = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); 
        const currentTime = now.toTimeString().slice(0, 5);
        
        let isOpen = false;
        let nextOpenTime = null;
        let closureReason = null;
        
        const specialClosuresData = data.specialClosures || [];
        let specialClosures = [];
        if (specialClosuresData) {
            if (Array.isArray(specialClosuresData)) {
                specialClosures = specialClosuresData;
            } else if (typeof specialClosuresData === 'object') {
                specialClosures = Object.values(specialClosuresData);
            }
        }
        
        const todaySpecialClosure = specialClosures.find(closure => {
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
            closureReason, 
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
