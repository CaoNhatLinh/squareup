/**
 * Calculate discount information for items based on active item_category discounts
 * Only processes automatic discounts that are currently active
 */

function isDiscountActive(discount) {
  const now = Date.now();
  const currentDate = new Date();
  
  if (!discount.automaticDiscount) {
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
}

function calculateItemDiscounts(items, categories, discounts) {
  if (!items || !discounts) {
    return items;
  }

  const activeItemCategoryDiscounts = Object.values(discounts)
    .filter(discount => {
      return discount.discountApplyTo === 'item_category' && isDiscountActive(discount);
    });
  
  if (activeItemCategoryDiscounts.length === 0) {
    return items;
  }
  

  const itemsWithDiscounts = {};  Object.entries(items).forEach(([itemId, item]) => {
    let bestDiscount = null;
    let bestDiscountValue = 0;

    activeItemCategoryDiscounts.forEach(discount => {
      let isEligible = false;

      if (discount.addAllItemsToPurchase) {
        isEligible = true;
      } else {
        // Check if item is directly in purchaseItems
        if (discount.purchaseItems && Array.isArray(discount.purchaseItems)) {
          isEligible = discount.purchaseItems.some(purchaseItem => purchaseItem.id === itemId);
        }

        // Check if item's category is in purchaseCategories
        if (!isEligible && discount.purchaseCategories && Array.isArray(discount.purchaseCategories) && item.categoryId) {
          isEligible = discount.purchaseCategories.some(cat => {
            // Compare both string and direct id
            return cat.id === item.categoryId || cat === item.categoryId;
          });
          
          // Debug logging
          if (isEligible) {
            console.log(`✅ Item ${itemId} (${item.name}) eligible for discount ${discount.name} via category ${item.categoryId}`);
          }
        }
      }
      
      if (isEligible) {
        let discountValue = 0;
        if (discount.amountType === 'percentage') {
          discountValue = parseFloat(discount.amount);
        } else {
          discountValue = (parseFloat(discount.amount) / item.price) * 100;
        }

        if (discountValue > bestDiscountValue) {
          bestDiscountValue = discountValue;
          bestDiscount = discount;
        }
      }
    });

    if (bestDiscount) {
      let discountAmount = 0;
      let discountPercent = 0;
      
      if (bestDiscount.amountType === 'percentage') {
        discountPercent = parseFloat(bestDiscount.amount);
        discountAmount = (item.price * discountPercent) / 100;
      } else {
        discountAmount = parseFloat(bestDiscount.amount);
        discountPercent = (discountAmount / item.price) * 100;
      }

      if (bestDiscount.setMaximumValue && bestDiscount.maximumValue) {
        const maxValue = parseFloat(bestDiscount.maximumValue);
        if (discountAmount > maxValue) {
          discountAmount = maxValue;
          discountPercent = (discountAmount / item.price) * 100;
        }
      }
      
      const discountedPrice = Math.max(0, item.price - discountAmount);
      
      itemsWithDiscounts[itemId] = {
        ...item,
        hasDiscount: true,
        discountId: bestDiscount.id,
        discountName: bestDiscount.name,
        discountPercent: Math.round(discountPercent),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        originalPrice: item.price,
        discountedPrice: parseFloat(discountedPrice.toFixed(2))
      };
      
    } else {
      itemsWithDiscounts[itemId] = item;
    }
  });
  
  return itemsWithDiscounts;
}

module.exports = {
  calculateItemDiscounts,
  isDiscountActive
};
