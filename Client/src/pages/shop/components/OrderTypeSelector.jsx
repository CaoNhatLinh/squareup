import { HiShoppingBag, HiTruck, HiLocationMarker } from "react-icons/hi";
import { MdTableRestaurant } from "react-icons/md";

export default function OrderTypeSelector({ selectedType = "pickup", onSelectType }) {
  const orderTypes = [
    {
      id: "dine-in",
      name: "Dine In",
      icon: MdTableRestaurant,
      color: "blue",
      disabled: true,
    },
    {
      id: "pickup",
      name: "Pickup",
      icon: HiShoppingBag,
      color: "red",
      disabled: false,
    },
    {
      id: "delivery",
      name: "Delivery",
      icon: HiTruck,
      color: "green",
      disabled: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-3 gap-4">
        {orderTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => !type.disabled && onSelectType(type.id)}
              disabled={type.disabled}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl transition-all ${
                type.disabled
                  ? "bg-gray-100 cursor-not-allowed opacity-50"
                  : isActive
                  ? `bg-${type.color}-50 border-2 border-${type.color}-500 shadow-lg scale-105`
                  : "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {type.disabled && (
                <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}
              
              <div
                className={`p-4 rounded-full transition-colors ${
                  isActive
                    ? `bg-${type.color}-500`
                    : type.disabled
                    ? "bg-gray-300"
                    : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-8 h-8 ${
                    isActive
                      ? "text-white"
                      : type.disabled
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                />
              </div>
              
              <span
                className={`font-semibold text-lg ${
                  isActive
                    ? `text-${type.color}-700`
                    : type.disabled
                    ? "text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {type.name}
              </span>
              
              {isActive && !type.disabled && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`w-2 h-2 bg-${type.color}-500 rounded-full`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
