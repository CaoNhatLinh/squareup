import { useMemo } from 'react';

export function useDiscountCalculation(cart, activeDiscounts) {
  return useMemo(() => {
    if (!activeDiscounts || Object.keys(activeDiscounts).length === 0 || cart.length === 0) {
      return {
        appliedDiscount: null,
        totalDiscount: 0,
        itemDiscounts: {},
        discountBreakdown: null,
        subtotal: cart.reduce((sum, item) => sum + item.totalPrice, 0)
      };
    }

    const discounts = Object.values(activeDiscounts);
    const discountResults = [];

    for (const discount of discounts) {
      const result = calculateSingleDiscount(discount, cart);
      if (result && result.discountAmount > 0) {
        discountResults.push(result);
      }
    }

    if (discountResults.length === 0) {
      return {
        appliedDiscount: null,
        totalDiscount: 0,
        itemDiscounts: {},
        discountBreakdown: null,
        subtotal: cart.reduce((sum, item) => sum + item.totalPrice, 0)
      };
    }

    const appliedDiscounts = [];
    const combinedItemDiscounts = {};
    const itemsAlreadyDiscounted = new Set();
    const discountAmounts = {}; 
    let totalDiscount = 0;

    discountResults.sort((a, b) => b.discountAmount - a.discountAmount);

    for (const result of discountResults) {
      const affectedItemKeys = Object.keys(result.itemDiscounts);
      const hasOverlap = affectedItemKeys.some(key => itemsAlreadyDiscounted.has(key));

      if (!hasOverlap) {
        appliedDiscounts.push(result.discount);
        totalDiscount += result.discountAmount;
        
        discountAmounts[result.discount.id] = result.discountAmount;
        Object.assign(combinedItemDiscounts, result.itemDiscounts);
        affectedItemKeys.forEach(key => itemsAlreadyDiscounted.add(key));
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      appliedDiscount: appliedDiscounts[0] || null, 
      appliedDiscounts: appliedDiscounts, 
      discountAmounts: discountAmounts, 
      totalDiscount: totalDiscount,
      itemDiscounts: combinedItemDiscounts,
      discountBreakdown: appliedDiscounts.map(d => ({
        discountId: d.id,
        discountName: d.name,
        discountType: d.amountType,
        discountValue: d.amount,
        discountAmount: discountAmounts[d.id] || 0,
      })),
      subtotal,
      total: subtotal - totalDiscount
    };
  }, [cart, activeDiscounts]);
}

function calculateSingleDiscount(discount, cartItems) {
  if (!discount.automaticDiscount) return null;

  let discountAmount = 0;
  const itemDiscounts = {};
  const affectedItems = [];

  if (discount.discountApplyTo === 'item_category') {
    const eligibleItems = cartItems.filter(item => {
      if (discount.addAllItemsToPurchase) return true;
      
      const matchesCategory = discount.purchaseCategories?.some(cat => cat.id === item.categoryId);
      const matchesItem = discount.purchaseItems?.some(i => i.id === item.itemId);
      
      return matchesCategory || matchesItem;
    });

    eligibleItems.forEach(item => {
      const itemDiscount = calculateItemDiscount(discount, item.price, item.quantity);
      discountAmount += itemDiscount;
      itemDiscounts[item.groupKey] = {
        originalPrice: item.price,
        discountAmount: itemDiscount / item.quantity,
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
    const result = calculateQuantityDiscount(discount, cartItems);
    discountAmount = result.discountAmount;
    Object.assign(itemDiscounts, result.itemDiscounts);
    affectedItems.push(...result.affectedItems);
  }

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  if (discount.setMinimumSpend && cartSubtotal < discount.minimumSubtotal) {
    return null;
  }

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

function calculateItemDiscount(discount, itemPrice, quantity) {
  if (discount.amountType === 'percentage') {
    return (itemPrice * quantity * discount.amount) / 100;
  } else if (discount.amountType === 'fixed') {
    return discount.amount * quantity;
  }
  return 0;
}

function calculateQuantityDiscount(discount, cartItems) {
  let discountAmount = 0;
  const itemDiscounts = {};
  const affectedItems = [];

  const eligibleItems = cartItems.filter(item => {
    if (discount.addAllItemsToPurchase) return true;
    
    const matchesCategory = discount.purchaseCategories?.some(cat => cat.id === item.categoryId);
    const matchesItem = discount.purchaseItems?.some(i => i.id === item.itemId);
    
    return matchesCategory || matchesItem;
  });

  const totalEligibleQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

  if (discount.quantityRuleType === 'exact') {
    if (totalEligibleQuantity === discount.purchaseQuantity) {
      const discountQty = discount.discountQuantity || discount.purchaseQuantity;
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
      const sortedItems = [...discountTargetItems].sort((a, b) => a.price - b.price);
      
      let remainingDiscountQty = discountQty;
      for (let i = 0; i < sortedItems.length && remainingDiscountQty > 0; i++) {
        const item = sortedItems[i];
        const qtyToDiscount = Math.min(item.quantity, remainingDiscountQty);
        
        const itemDiscount = calculateItemDiscount(discount, item.price, qtyToDiscount);
        discountAmount += itemDiscount;
        
        itemDiscounts[item.groupKey] = {
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
    if (totalEligibleQuantity >= discount.purchaseQuantity) {
      const discountQty = discount.discountQuantity || totalEligibleQuantity;
      
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
      const sortedItems = [...discountTargetItems].sort((a, b) => a.price - b.price);
      
      let remainingDiscountQty = discountQty;
      
      for (let i = 0; i < sortedItems.length && remainingDiscountQty > 0; i++) {
        const item = sortedItems[i];
        const qtyToDiscount = Math.min(item.quantity, remainingDiscountQty);
        
        const itemDiscount = calculateItemDiscount(discount, item.price, qtyToDiscount);
        discountAmount += itemDiscount;
        
        itemDiscounts[item.groupKey] = {
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
    const purchaseQty = discount.purchaseQuantity || 1;
    const discountQty = discount.discountQuantity || 1;

    if (totalEligibleQuantity >= purchaseQty + discountQty) {
      let discountTargetItems = [];
      
      if (discount.copyEligibleItems || discount.addAllItemsToDiscount) {
        discountTargetItems = [...eligibleItems];
      } else {
        discountTargetItems = cartItems.filter(item => {
          const matchesCategory = discount.discountTargetCategories?.some(cat => cat.id === item.categoryId);
          const matchesItem = discount.discountTargetItems?.some(i => i.id === item.itemId);
          return matchesCategory || matchesItem;
        });
      }

      const sortedItems = [...discountTargetItems].sort((a, b) => b.price - a.price);
      
      const bogoSets = Math.floor(totalEligibleQuantity / (purchaseQty + discountQty));
      let itemsToDiscount = bogoSets * discountQty;
      
      for (let i = sortedItems.length - 1; i >= 0 && itemsToDiscount > 0; i--) {
        const item = sortedItems[i];
        const qtyToDiscount = Math.min(item.quantity, itemsToDiscount);
        
        const itemDiscount = calculateItemDiscount(discount, item.price, qtyToDiscount);
        discountAmount += itemDiscount;
        
        itemDiscounts[item.groupKey] = {
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
