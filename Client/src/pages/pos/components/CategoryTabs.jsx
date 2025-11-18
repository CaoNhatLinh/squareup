export default function CategoryTabs({ categories, selectedCategory, onSelectCategory, items = {} }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 overflow-x-auto">
      <div className="flex gap-2">
        <button
          onClick={() => onSelectCategory("all")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name} {" "}
            {(() => {
              const ids = Array.isArray(category.itemIds) ? category.itemIds : (category.itemIds ? Object.values(category.itemIds) : []);
              const count = ids.filter(id => items[id]).length;
              return <span className="text-xs text-gray-500">({count})</span>
            })()}
          </button>
        ))}
      </div>
    </div>
  );
}
