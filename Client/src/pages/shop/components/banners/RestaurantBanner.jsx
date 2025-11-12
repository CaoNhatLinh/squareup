import {
  HiLocationMarker,
  HiStar,
  HiClock,
  HiChevronRight,
} from "react-icons/hi";

export default function RestaurantBanner({
  restaurant,
  onInfoClick,
  onPromotionsClick,
  activeDiscounts,
}) {
  if (!restaurant) return null;
  const bannerImage =
    restaurant.coverImage ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop";

  const discountsList = Object.values(activeDiscounts || {}).filter(
    (d) => d.automaticDiscount
  );
  const highestDiscount =
    discountsList.length > 0
      ? discountsList.reduce((max, discount) => {
          const currentValue =
            discount.amountType === "percentage"
              ? parseFloat(discount.amount)
              : parseFloat(discount.amount) * 2; 
          const maxValue =
            max.amountType === "percentage"
              ? parseFloat(max.amount)
              : parseFloat(max.amount) * 2;
          return currentValue > maxValue ? discount : max;
        })
      : null;
  return (
    <div className="relative bg-white">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={bannerImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 mb-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div
            className="flex items-start justify-between gap-4"
            onClick={onInfoClick}
          >
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Ordering from
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-3">
                {restaurant.name}
              </h2>

              {restaurant.address && (
                <div className="flex items-start gap-2 text-gray-600 mb-2">
                  <HiLocationMarker className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">4.4</span>
                  <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-600">(1,000+ ratings)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">$0 Pickup Fee</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <HiClock className="w-5 h-5 text-gray-600" />
                <span
                  className={`font-medium ${
                    restaurant.isOpen ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Open:
                  {restaurant.isOpen ? "Yes" : restaurant.nextOpenTime || "-"}
                </span>
              </div>
            </div>
            {restaurant.featuredImage && (
              <div className="hidden md:block">
                <img
                  src={restaurant.featuredImage}
                  alt="Food preview"
                  className="w-48 h-36 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}
          </div>

          {highestDiscount && (
            <button
              onClick={onPromotionsClick}
              className="mt-4 w-full flex items-center justify-between bg-amber-50 border-2 border-amber-400 rounded-xl px-5 py-3 hover:bg-amber-100 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Limited Offer:</span>
                <span className="text-red-600 font-bold">
                  {highestDiscount.amountType === "percentage"
                    ? `${highestDiscount.amount}% OFF`
                    : `$${highestDiscount.amount} OFF`}
                </span>
                <span className="text-gray-700">Today!</span>
              </div>
              <HiChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
