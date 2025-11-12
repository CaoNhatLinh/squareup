import React from "react";
import TabButton from "@/pages/shop/components/TabButton";

export default function CategoryNavigation({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const handleCategoryClick = (categoryId) => {
    onSelectCategory(categoryId);
    if (categoryId !== "all") {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const offset = 150; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[92px] z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
          <TabButton
            name="Tất cả"
            isActive={selectedCategory === "all"}
            onClick={() => handleCategoryClick("all")}
          />
          {categories.map((category) => (
            <TabButton
              key={category.id}
              name={category.name}
              isActive={selectedCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
