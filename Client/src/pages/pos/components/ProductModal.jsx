import { useState, useEffect, useMemo } from "react";

export default function ProductModal({ item, modifiers, onClose, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const itemModifiers = useMemo(() => 
    (item.modifierIds || [])
      .map((id) => modifiers[id])
      .filter(Boolean),
    [item.modifierIds, modifiers]
  );

  useEffect(() => {
    // Pre-select default options
    const defaults = itemModifiers.map((modifier) => {
      const defaultOption = modifier.options?.find((opt) => opt.isDefault);
      return defaultOption || modifier.options?.[0];
    }).filter(Boolean);
    setSelectedOptions(defaults);
  }, [itemModifiers]);

  const handleOptionSelect = (modifierId, option) => {
    setSelectedOptions((prev) => {
      const filtered = prev.filter((opt) => opt.modifierId !== modifierId);
      return [...filtered, { ...option, modifierId }];
    });
  };

  const calculateTotal = () => {
    const basePrice = item.hasDiscount ? item.discountedPrice : item.price;
    const modifierTotal = selectedOptions.reduce(
      (sum, opt) => sum + (opt.price || 0),
      0
    );
    return (basePrice + modifierTotal) * quantity;
  };

  const handleAdd = () => {
    onAddToCart(item, selectedOptions, quantity);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-64 object-cover"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {item.name}
          </h2>
          {item.description && (
            <p className="text-gray-600 mb-4">{item.description}</p>
          )}

          <div className="flex items-center gap-2 mb-6">
            {item.hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-red-600">
                  ${item.discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
                <div className="bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                  {item.discountPercent}% OFF
                </div>
              </>
            ) : (
              <span className="text-2xl font-bold text-red-600">
                ${item.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Modifiers */}
          {itemModifiers.map((modifier) => (
            <div key={modifier.id} className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {modifier.name}
                {modifier.isRequired && (
                  <span className="text-red-600 ml-1">*</span>
                )}
              </h3>
              <div className="space-y-2">
                {modifier.options?.map((option) => {
                  const isSelected = selectedOptions.some(
                    (opt) =>
                      opt.modifierId === modifier.id && opt.id === option.id
                  );
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(modifier.id, option)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-gray-900">
                        {option.name}
                      </span>
                      <span className="text-gray-600">
                        {option.price > 0 ? `+$${option.price.toFixed(2)}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Số lượng</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-2xl font-bold text-gray-900 w-16 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <button
            onClick={handleAdd}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors"
          >
            Thêm vào đơn - ${calculateTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
