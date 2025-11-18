// Cart helper utilities for POS

/**
 * Generate a unique cart key for an item with modifiers
 */
export const generateCartKey = (itemId, selectedOptions = [], specialInstruction = '') => {
  const optionsKey = selectedOptions
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(opt => `${opt.modifierId}:${opt.id}`)
    .join('|');
  const instructionKey = specialInstruction ? `:note:${specialInstruction}` : '';
  return `${itemId}${optionsKey ? `::${optionsKey}` : ''}${instructionKey}`;
};

/**
 * Check if two items have the same modifiers and notes
 */
export const isSameCartItem = (item1, item2) => {
  if (item1.itemId !== item2.itemId) return false;
  
  const opts1 = (item1.selectedOptions || []).sort((a, b) => a.id.localeCompare(b.id));
  const opts2 = (item2.selectedOptions || []).sort((a, b) => a.id.localeCompare(b.id));
  
  if (opts1.length !== opts2.length) return false;
  
  const optionsMatch = opts1.every((opt, idx) => 
    opt.modifierId === opts2[idx].modifierId && opt.id === opts2[idx].id
  );
  
  const notesMatch = (item1.specialInstruction || '') === (item2.specialInstruction || '');
  
  return optionsMatch && notesMatch;
};

/**
 * Merge cart item if duplicate exists, otherwise add new
 */
export const mergeOrAddCartItem = (cart, newItem) => {
  const existingIndex = cart.findIndex(item => isSameCartItem(item, newItem));
  
  if (existingIndex >= 0) {
    // Merge quantities
    return cart.map((item, idx) => 
      idx === existingIndex 
        ? { ...item, quantity: item.quantity + newItem.quantity }
        : item
    );
  } else {
    // Add as new item
    return [...cart, { ...newItem, id: `${newItem.itemId}-${Date.now()}-${Math.random()}` }];
  }
};

/**
 * Categorize items for kitchen vs bar
 */
export const categorizeItemsForPrint = (items, kitchenCategories = [], barCategories = []) => {
  const kitchen = [];
  const bar = [];
  
  items.forEach(item => {
    const category = (item.category || '').toLowerCase();
    if (barCategories.some(cat => category.includes(cat))) {
      bar.push(item);
    } else if (kitchenCategories.some(cat => category.includes(cat)) || !barCategories.some(cat => category.includes(cat))) {
      kitchen.push(item);
    }
  });
  
  return { kitchen, bar };
};
