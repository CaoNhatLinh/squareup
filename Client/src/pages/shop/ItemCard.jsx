
export default function ItemCard({ item, onItemClick }) {
  const hasDiscount = item.discount && item.discount > 0;
  const discountPercent = hasDiscount ? Math.round((item.discount / item.price) * 100) : 0;

  return (
    <div
      onClick={() => onItemClick(item)} 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:border-gray-300 relative"
    >
      <div className="relative h-48 bg-gray-50">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <button 
          className="absolute top-3 right-3 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onItemClick(item);
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {hasDiscount && (
          <div className="absolute bottom-3 left-3 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}