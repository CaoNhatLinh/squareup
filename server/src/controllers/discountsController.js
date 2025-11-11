const { db } = require('../config/firebaseAdmin');

exports.getActiveDiscounts = async (req, res) => {
  const { uid } = req.params;
  const restaurantId = uid;
  
  try {
    const snapshot = await db.ref(`restaurants/${restaurantId}/discounts`).get();
    const allDiscounts = snapshot.val() || {};
    const now = Date.now();
    const currentDate = new Date();
    const activeDiscounts = Object.entries(allDiscounts)
      .filter(([id, discount]) => {
        try {
          if (!discount?.automaticDiscount) {
            return false;
          }
          if (discount.setDateRange) {
            const startTime = discount.dateRangeStart ? new Date(discount.dateRangeStart + 'T00:00:00').getTime() : 0;
            const endTime = discount.dateRangeEnd ? new Date(discount.dateRangeEnd + 'T23:59:59').getTime() : Infinity;
            if (now < startTime || now > endTime) {
              return false;
            }
          }
          if (discount.setSchedule) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const currentTime = currentDate.toTimeString().slice(0, 5);
            if (!discount.scheduleDays?.[dayName]) {
              return false;
            }
            if (currentTime < discount.scheduleTimeStart || currentTime > discount.scheduleTimeEnd) {
              return false;
            }
          }
          return true;
        } catch (err) {
          console.error(`Error processing discount ${id}:`, err.message);
          return false;
        }
      })
      .reduce((acc, [id, discount]) => {
        acc[id] = discount;
        return acc;
      }, {});
    res.json(activeDiscounts);
  } catch (error) {
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch active discounts', message: error.message });
  }
};

// Get all discounts for a restaurant
exports.getDiscounts = async (req, res) => {
  const { uid } = req.user;
  try {
    const snapshot = await db.ref(`restaurants/${uid}/discounts`).get();
    const discounts = snapshot.val() || {};
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
};

// Get single discount
exports.getDiscount = async (req, res) => {
  const { uid } = req.user;
  const { discountId } = req.params;
  try {
    const snapshot = await db.ref(`restaurants/${uid}/discounts/${discountId}`).get();
    const discount = snapshot.val();
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({ error: 'Failed to fetch discount' });
  }
};

// Create new discount
exports.createDiscount = async (req, res) => {
  const { uid } = req.user;
  const discountData = req.body;
  try {
    const newDiscountRef = db.ref(`restaurants/${uid}/discounts`).push();
    const discountId = newDiscountRef.key;
    
    const discount = {
      ...discountData,
      id: discountId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await newDiscountRef.set(discount);
    res.status(201).json({ id: discountId, ...discount });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ error: 'Failed to create discount' });
  }
};
exports.updateDiscount = async (req, res) => {
  const { uid } = req.user;
  const { discountId } = req.params;
  const updates = req.body;
  
  try {
    const discountRef = db.ref(`restaurants/${uid}/discounts/${discountId}`);
    const snapshot = await discountRef.get();
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    
    const updatedDiscount = {
      ...updates,
      id: discountId,
      updatedAt: Date.now(),
    };
    
    await discountRef.update(updatedDiscount);
    res.json(updatedDiscount);
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({ error: 'Failed to update discount' });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  const { uid } = req.user;
  const { discountId } = req.params;
  
  try {
    const discountRef = db.ref(`restaurants/${uid}/discounts/${discountId}`);
    const snapshot = await discountRef.get();
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    
    await discountRef.remove();
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
};
