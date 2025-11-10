export default function ItemCard({ item, onItemClick }) {
  const hasDiscount = item.hasDiscount && item.discountedPrice < item.price;
  const isSoldOut = item.isSoldOut === true;

  return (
    <div
      onClick={() => !isSoldOut && onItemClick(item)}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden group transition-all duration-200 hover:shadow-lg hover:border-gray-300 relative ${
        isSoldOut ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {item.image && (
        <div className="relative h-48 bg-gray-50">
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover ${
              isSoldOut ? "grayscale" : ""
            }`}
          />

          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl transform -rotate-12 shadow-lg">
                SOLD OUT
              </div>
            </div>
          )}

          {!isSoldOut && (
            <button
              className="absolute top-3 right-3 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Price with discount display */}
            <div className="flex items-center gap-2 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold text-red-600">
                    ${item.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                  <div className=" bg-gradient-to-r from-pink-600 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {item.discountPercent}% OFF
                  </div>
                </>
              ) : (
                <span className="text-lg font-bold text-red-600">
                  ${item.price?.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Show SOLD OUT badge and add button for non-image items */}
          <div className="flex flex-col items-end gap-2">
            {isSoldOut && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                SOLD OUT
              </span>
            )}
            {!item.image && !isSoldOut && (
              <button
                className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(item);
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
