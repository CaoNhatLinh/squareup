const admin = require('firebase-admin');
const db = admin.database();

/**
 * Calculate applicable discounts for a cart
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} cartItems - Array of cart items with {itemId, categoryId, quantity, price, totalPrice}
 * @returns {Object} - {appliedDiscounts, totalDiscount, itemDiscounts}
 */
async function calculateCartDiscounts(restaurantId, cartItems) {
  try {
    // Fetch all active discounts
    const discountsSnapshot = await db.ref(`restaurants/${restaurantId}/discounts`).once('value');
    const allDiscounts = discountsSnapshot.val() || {};
    
    // Filter active discounts
    const now = Date.now();
    const activeDiscounts = Object.entries(allDiscounts)
      .map(([id, discount]) => ({ id, ...discount }))
      .filter(discount => {
        // Check if discount is enabled (assuming there's an 'enabled' field)
        // Check date range if set
        if (discount.setDateRange) {
          const startTime = discount.dateRangeStart ? new Date(discount.dateRangeStart).getTime() : 0;
          const endTime = discount.dateRangeEnd ? new Date(discount.dateRangeEnd).getTime() : Infinity;
          if (now < startTime || now > endTime) return false;
        }
        
        // Check schedule if set
        if (discount.setSchedule) {
          const currentDate = new Date();
          const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const currentTime = currentDate.toTimeString().slice(0, 5); // HH:MM format
          
          if (!discount.scheduleDays?.[dayName]) return false;
          if (currentTime < discount.scheduleTimeStart || currentTime > discount.scheduleTimeEnd) return false;
        }
        
        return true;
      });

    // Calculate discount for each applicable discount
    const discountResults = [];
    
    for (const discount of activeDiscounts) {
      const result = calculateSingleDiscount(discount, cartItems);
      if (result && result.discountAmount > 0) {
        discountResults.push(result);
      }
    }

    // Stack multiple discounts - but avoid applying multiple discounts to same item
    if (discountResults.length === 0) {
      return {
        appliedDiscounts: [],
        totalDiscount: 0,
        itemDiscounts: {},
        discountBreakdown: []
      };
    }

    // Sort by discount amount descending (apply higher discounts first)
    discountResults.sort((a, b) => b.discountAmount - a.discountAmount);

    const appliedDiscounts = [];
    const combinedItemDiscounts = {};
    const itemsAlreadyDiscounted = new Set();
    const discountAmounts = {}; // Track amount per discount
    let totalDiscount = 0;

    for (const result of discountResults) {
      // Check if any items in this discount have already been discounted
      const affectedItemKeys = Object.keys(result.itemDiscounts);
      const hasOverlap = affectedItemKeys.some(key => itemsAlreadyDiscounted.has(key));

      if (!hasOverlap) {
        // No overlap - can apply this discount
        appliedDiscounts.push(result.discount);
        totalDiscount += result.discountAmount;
        
        // Track discount amount for this specific promotion
        discountAmounts[result.discount.id] = result.discountAmount;

        // Add item discounts
        Object.assign(combinedItemDiscounts, result.itemDiscounts);

        // Mark items as discounted
        affectedItemKeys.forEach(key => itemsAlreadyDiscounted.add(key));
        
        console.log(`✅ Applied discount "${result.discount.name}": $${result.discountAmount.toFixed(2)}`);
      } else {
        console.log(`⚠️ Skipped discount "${result.discount.name}" - items already discounted`);
      }
    }

    return {
      appliedDiscounts: appliedDiscounts,
      totalDiscount: totalDiscount,
      itemDiscounts: combinedItemDiscounts,
      discountBreakdown: appliedDiscounts.map(discount => ({
        discountId: discount.id,
        discountName: discount.name,
        discountType: discount.amountType,
        discountValue: discount.amount,
        discountAmount: discountAmounts[discount.id] || 0,
      }))
    };

  } catch (error) {
    console.error('Error calculating cart discounts:', error);
    return {
      appliedDiscounts: [],
      totalDiscount: 0,
      itemDiscounts: {},
      discountBreakdown: []
    };
  }
}

/**
 * Calculate discount for a single discount rule
 */
function calculateSingleDiscount(discount, cartItems) {
  if (!discount.automaticDiscount) {
    // Manual discounts need to be applied explicitly
    return null;
  }

  let discountAmount = 0;
  const itemDiscounts = {};
  const affectedItems = [];

  if (discount.discountApplyTo === 'item_category') {
    // Item/Category mode - apply discount to selected items/categories
    const eligibleItems = cartItems.filter(item => {
      if (discount.addAllItemsToPurchase) return true;
      
      const matchesCategory = discount.purchaseCategories?.some(cat => cat.id === item.categoryId);
      const matchesItem = discount.purchaseItems?.some(i => i.id === item.itemId);
      
      return matchesCategory || matchesItem;
    });

    eligibleItems.forEach(item => {
      const itemDiscount = calculateItemDiscount(discount, item.price, item.quantity);
      discountAmount += itemDiscount;
      const itemKey = item.groupKey || item.id || item.itemId;
      itemDiscounts[itemKey] = {
        originalPrice: item.price,
        discountAmount: itemDiscount / item.quantity, // per item
        finalPrice: item.price - (itemDiscount / item.quantity),
        quantityDiscounted: item.quantity,
        discountPercentage: discount.amountType === 'percentage' ? discount.amount : Math.round((itemDiscount / item.quantity / item.price) * 100)
      };
      affectedItems.push({
        itemId: item.itemId,
        itemName: item.name,
        quantity: item.quantity,
        discountPerItem: itemDiscount / item.quantity
      });
    });

  } else if (discount.discountApplyTo === 'quantity') {
    // Quantity mode - BOGO, Exact, Minimum
    const result = calculateQuantityDiscount(discount, cartItems);
    discountAmount = result.discountAmount;
    Object.assign(itemDiscounts, result.itemDiscounts);
    affectedItems.push(...result.affectedItems);
  }

  // Apply minimum spend check
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  if (discount.setMinimumSpend && cartSubtotal < discount.minimumSubtotal) {
    return null;
  }

  // Apply maximum discount cap
  if (discount.setMaximumValue && discountAmount > discount.maximumValue) {
    discountAmount = discount.maximumValue;
  }

  return {
    discount,
    discountAmount,
    itemDiscounts,
    affectedItems
  };
}

/**
 * Calculate item discount based on discount type
 */
function calculateItemDiscount(discount, itemPrice, quantity) {
  if (discount.amountType === 'percentage') {
    return (itemPrice * quantity * discount.amount) / 100;
  } else if (discount.amountType === 'fixed') {
    return discount.amount * quantity;
  }
  return 0;
}

/**
 * Calculate quantity-based discount (BOGO, Exact, Minimum)
 */
function calculateQuantityDiscount(discount, cartItems) {
  let discountAmount = 0;
  const itemDiscounts = {};
  const affectedItems = [];

  // Filter eligible items for purchase requirement
  const eligibleItems = cartItems.filter(item => {
    if (discount.addAllItemsToPurchase) return true;
    
    const matchesCategory = discount.purchaseCategories?.some(cat => cat.id === item.categoryId);
    const matchesItem = discount.purchaseItems?.some(i => i.id === item.itemId);
    
    return matchesCategory || matchesItem;
  });

  const totalEligibleQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

  if (discount.quantityRuleType === 'exact') {
    // Exact quantity - apply discount if exact quantity is met
    if (totalEligibleQuantity === discount.purchaseQuantity) {
      // Apply discount to discountQuantity items (cheapest items)
      const discountQty = discount.discountQuantity || discount.purchaseQuantity;
      
      // Get discount target items
      let discountTargetItems = [];
      if (discount.copyEligibleItems || discount.addAllItemsToDiscount) {
        discountTargetItems = [...eligibleItems];
      } else if (discount.discountTargetCategories?.length > 0 || discount.discountTargetItems?.length > 0) {
        discountTargetItems = eligibleItems.filter(item => {
          const matchesCategory = discount.discountTargetCategories?.some(cat => cat.id === item.categoryId);
          const matchesItem = discount.discountTargetItems?.some(i => i.id === item.itemId);
          return matchesCategory || matchesItem;
        });
      } else {
        discountTargetItems = [...eligibleItems];
      }
      
      // Sort by price ascending (cheapest first for discount application)
      const sortedItems = [...discountTargetItems].sort((a, b) => a.price - b.price);
      
      let remainingDiscountQty = discountQty;
      
      // Apply discount to cheapest items up to discountQty
      for (let i = 0; i < sortedItems.length && remainingDiscountQty > 0; i++) {
        const item = sortedItems[i];
        const qtyToDiscount = Math.min(item.quantity, remainingDiscountQty);
        
        const itemDiscount = calculateItemDiscount(discount, item.price, qtyToDiscount);
        discountAmount += itemDiscount;
        
        const itemKey = item.groupKey || item.id || item.itemId;
        itemDiscounts[itemKey] = {
          originalPrice: item.price,
          discountAmount: itemDiscount / qtyToDiscount,
          finalPrice: item.price - (itemDiscount / qtyToDiscount),
          quantityDiscounted: qtyToDiscount,
          discountPercentage: discount.amountType === 'percentage' ? discount.amount : Math.round((itemDiscount / qtyToDiscount / item.price) * 100)
        };
        
        affectedItems.push({
          itemId: item.itemId,
          itemName: item.name,
          quantity: qtyToDiscount,
          discountPerItem: itemDiscount / qtyToDiscount
        });
        
        remainingDiscountQty -= qtyToDiscount;
      }
    }

  } else if (discount.quantityRuleType === 'minimum') {
    // Minimum quantity - apply discount if minimum is met
    if (totalEligibleQuantity >= discount.purchaseQuantity) {
      // Apply discount to discountQuantity items (cheapest items)
      const discountQty = discount.discountQuantity || totalEligibleQuantity;
      
      // Get discount target items
      let discountTargetItems = [];
      if (discount.copyEligibleItems || discount.addAllItemsToDiscount) {
        discountTargetItems = [...eligibleItems];
      } else if (discount.discountTargetCategories?.length > 0 || discount.discountTargetItems?.length > 0) {
        discountTargetItems = eligibleItems.filter(item => {
          const matchesCategory = discount.discountTargetCategories?.some(cat => cat.id === item.categoryId);
          const matchesItem = discount.discountTargetItems?.some(i => i.id === item.itemId);
          return matchesCategory || matchesItem;
        });
      } else {
        discountTargetItems = [...eligibleItems];
      }
      
      // Sort by price ascending (cheapest first for discount application)
      const sortedItems = [...discountTargetItems].sort((a, b) => a.price - b.price);
      
      let remainingDiscountQty = discountQty;
      
      // Apply discount to cheapest items up to discountQty
      for (let i = 0; i < sortedItems.length && remainingDiscountQty > 0; i++) {
        const item = sortedItems[i];
        const qtyToDiscount = Math.min(item.quantity, remainingDiscountQty);
        
        const itemDiscount = calculateItemDiscount(discount, item.price, qtyToDiscount);
        discountAmount += itemDiscount;
        
        const itemKey = item.groupKey || item.id || item.itemId;
        itemDiscounts[itemKey] = {
          originalPrice: item.price,
          discountAmount: itemDiscount / qtyToDiscount,
          finalPrice: item.price - (itemDiscount / qtyToDiscount),
          quantityDiscounted: qtyToDiscount,
          discountPercentage: discount.amountType === 'percentage' ? discount.amount : Math.round((itemDiscount / qtyToDiscount / item.price) * 100)
        };
        
        affectedItems.push({
          itemId: item.itemId,
          itemName: item.name,
          quantity: qtyToDiscount,
          discountPerItem: itemDiscount / qtyToDiscount
        });
        
        remainingDiscountQty -= qtyToDiscount;
      }
    }

  } else if (discount.quantityRuleType === 'bogo') {
    // BOGO - Buy X Get Y with "equal or lesser value" rule
    const purchaseQty = discount.purchaseQuantity || 1;
    const discountQty = discount.discountQuantity || 1;

    if (totalEligibleQuantity >= purchaseQty + discountQty) {
      // Get items for discount target
      let discountTargetItems = [];
      
      if (discount.copyEligibleItems || discount.addAllItemsToDiscount) {
        // Use same items as purchase requirement
        discountTargetItems = [...eligibleItems];
      } else {
        // Use different items specified in discountTarget
        discountTargetItems = cartItems.filter(item => {
          const matchesCategory = discount.discountTargetCategories?.some(cat => cat.id === item.categoryId);
          const matchesItem = discount.discountTargetItems?.some(i => i.id === item.itemId);
          return matchesCategory || matchesItem;
        });
      }

      // Apply "equal or lesser value" rule
      // Sort items by price descending
      const sortedItems = [...discountTargetItems].sort((a, b) => b.price - a.price);
      
      // Calculate how many BOGO sets we can apply
      const bogoSets = Math.floor(totalEligibleQuantity / (purchaseQty + discountQty));
      
      // Apply discount to the cheaper items (discountQty items per set)
      let itemsToDiscount = bogoSets * discountQty;
      
      for (let i = sortedItems.length - 1; i >= 0 && itemsToDiscount > 0; i--) {
        const item = sortedItems[i];
        const qtyToDiscount = Math.min(item.quantity, itemsToDiscount);
        
        const itemDiscount = calculateItemDiscount(discount, item.price, qtyToDiscount);
        discountAmount += itemDiscount;
        
        const itemKey = item.groupKey || item.id || item.itemId;
        itemDiscounts[itemKey] = {
          originalPrice: item.price,
          discountAmount: itemDiscount / qtyToDiscount,
          finalPrice: item.price - (itemDiscount / qtyToDiscount),
          quantityDiscounted: qtyToDiscount,
          discountPercentage: discount.amountType === 'percentage' ? discount.amount : Math.round((itemDiscount / qtyToDiscount / item.price) * 100)
        };
        
        affectedItems.push({
          itemId: item.itemId,
          itemName: item.name,
          quantity: qtyToDiscount,
          discountPerItem: itemDiscount / qtyToDiscount
        });
        
        itemsToDiscount -= qtyToDiscount;
      }
    }
  }

  return {
    discountAmount,
    itemDiscounts,
    affectedItems
  };
}

module.exports = {
  calculateCartDiscounts,
  calculateSingleDiscount
};
