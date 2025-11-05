
export function hasChildren(categories = [], categoryId) {
  if (!Array.isArray(categories) || !categoryId) return false;
  return categories.some(cat => cat.parentCategoryId === categoryId);
}


export function getChildren(categories = [], categoryId) {
  return (categories || []).filter(cat => cat.parentCategoryId === categoryId);
}