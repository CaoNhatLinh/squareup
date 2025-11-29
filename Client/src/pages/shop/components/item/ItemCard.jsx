export default function ItemCard({ item, onItemClick, onQuickAdd }) {
  const hasDiscount = item.hasDiscount && item.discountedPrice < item.price;
  const isSoldOut = item.isSoldOut === true;
  return (
    <div
      onClick={() => !isSoldOut && onItemClick(item)}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden group transition-all duration-200 hover:shadow-lg hover:border-gray-300 relative flex flex-row md:flex-col h-32 md:h-auto ${isSoldOut ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
    >
      {item.image && (
        <div className="relative w-32 md:w-full h-full md:h-48 bg-gray-50 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover ${isSoldOut ? "grayscale" : ""
              }`}
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-600 text-white px-2 md:px-6 py-1 md:py-3 rounded-lg font-bold text-xs md:text-xl transform -rotate-12 shadow-lg whitespace-nowrap">
                SOLD OUT
              </div>
            </div>
          )}
        </div>
      )}
      <div className='p-3 md:p-4 flex-1 flex flex-col justify-between md:justify-start'>
        <div className='flex items-start justify-between gap-2'>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 truncate md:whitespace-normal">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-base md:text-lg font-bold text-red-600">
                    ${item.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                  <div className="hidden md:block bg-gradient-to-r from-pink-600 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {item.discountPercent}% OFF
                  </div>
                </>
              ) : (
                <span className="text-base md:text-lg font-bold text-red-600">
                  ${item.price?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
            {isSoldOut && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
                SOLD OUT
              </span>
            )}
            {!isSoldOut && (
              <button
                className="w-8 h-8 md:w-10 md:h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd?.(item);
                }}
                title="Quick add to cart"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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