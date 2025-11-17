import { useState } from "react";
import { useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function ProductGrid({
  categories,
  items,
  selectedCategory,
  onAddToCart,
  modifiers,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const itemsArray = Object.values(items);
    if (selectedCategory === "all") return itemsArray;

    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    const categoryItemIds = Array.isArray(category.itemIds)
      ? category.itemIds
      : category.itemIds
      ? Object.values(category.itemIds)
      : [];

    return itemsArray.filter((item) => categoryItemIds.includes(item.id));
  }, [items, categories, selectedCategory]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (item) => {
    if (item.modifierIds && item.modifierIds.length > 0) {
      handleItemClick(item);
    } else {
      onAddToCart(item, [], 1);
    }
  };

  const handleAddToCart = (item, selectedOptions, quantity) => {
    onAddToCart(item, selectedOptions, quantity);
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (filteredItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">Không có món ăn nào</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              onQuickAdd={() => handleQuickAdd(item)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && selectedItem && (
        <ProductModal
          item={selectedItem}
          modifiers={modifiers}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}
