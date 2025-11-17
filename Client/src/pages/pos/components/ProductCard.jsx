export default function ProductCard({ item, onClick, onQuickAdd }) {
  const hasDiscount = item.hasDiscount && item.discountedPrice < item.price;
  const isSoldOut = item.isSoldOut === true;
  const displayPrice = hasDiscount ? item.discountedPrice : item.price;

  return (
    <div
      onClick={() => !isSoldOut && onClick()}
      className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
        isSoldOut
          ? "opacity-60 cursor-not-allowed border-gray-200"
          : "cursor-pointer border-gray-200 hover:border-red-400 hover:shadow-lg"
      }`}
    >
      {/* Image */}
      <div className="relative h-32 bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover ${
              isSoldOut ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && !isSoldOut && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{item.discountPercent}%
          </div>
        )}

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
              HẾT HÀNG
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {item.name}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-1">
                <span className="text-red-600 font-bold text-base">
                  ${displayPrice.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through text-xs">
                  ${item.originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-red-600 font-bold text-base">
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </div>

          {!isSoldOut && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd();
              }}
              className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
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
  );
}
