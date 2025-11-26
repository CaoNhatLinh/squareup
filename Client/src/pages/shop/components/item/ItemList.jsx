import { useMemo } from "react";
import ItemCard from "@/pages/shop/components/item/ItemCard";

export default function ItemList({
  categories,
  items,
  onItemClick,
  onQuickAdd,
}) {
  const itemsByCategory = useMemo(() => {
    const itemsArray = Object.values(items);
    const grouped = {};
    categories.forEach((category) => {
      const categoryItemIds = Array.isArray(category.itemIds)
        ? category.itemIds
        : category.itemIds ? Object.values(category.itemIds) : [];
      
      grouped[category.id] = itemsArray.filter((item) =>
        categoryItemIds.includes(item.id)
      );
  
    });
    return grouped;
  }, [items, categories]);

  if (Object.keys(items).length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-lg">Chưa có món ăn nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
      {categories.map((category) => {
        const categoryItems = itemsByCategory[category.id] || [];
        if (categoryItems.length === 0) return null;

        return (
          <div
            key={category.id}
            id={`category-${category.id}`}
            className="mb-12 scroll-mt-32"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoryItems.map((item) => (
                <ItemCard key={item.id} item={item} onItemClick={onItemClick} onQuickAdd={onQuickAdd} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

