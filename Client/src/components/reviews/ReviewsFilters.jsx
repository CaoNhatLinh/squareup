import React from "react";

const ReviewsFilters = ({
  selectedRating,
  setSelectedRating,
  selectedItem,
  setSelectedItem,
  sortBy,
  setSortBy,
  itemStats,
  onClearFilters
}) => {
  const hasFilters = selectedRating !== "all" || selectedItem !== "all";

  return (
    <div className="flex flex-wrap items-end gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Rating
        </label>
        <select
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Item Reviewed
        </label>

        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
        >
          <option value="all">All Items</option>

          {itemStats.map((item) => (
            <option key={item.itemId} value={item.itemId}>
              {item.name} ({item.reviewCount})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Sort by
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>

          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {hasFilters && (
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 rounded-lg bg-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsFilters;