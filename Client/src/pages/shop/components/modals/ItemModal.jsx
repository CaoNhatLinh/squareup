import { useMemo, useState } from "react";
import { MdClose } from "react-icons/md";

export default function ItemModal({ item, modifiers, onClose, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState(
    item.preSelectedOptions || []
  );
  const [quantity, setQuantity] = useState(item.editingQuantity || 1);
  const [specialInstruction, setSpecialInstruction] = useState(
    item.specialInstruction || ""
  );

  const itemModifiers = useMemo(() => {
    if (!item.modifierIds || item.modifierIds.length === 0) return [];
    return item.modifierIds
      .map((modId) => modifiers[modId])
      .filter(Boolean)
      .map((modifier) => ({
        ...modifier,
        selectionType: modifier.selectionType || "multiple",
        required: modifier.required || modifier.isRequired || false,
        options: modifier.options
          ? Object.values(modifier.options).sort(
              (a, b) => (a.index || 0) - (b.index || 0)
            )
          : [],
      }));
  }, [item.modifierIds, modifiers]);

  const hasModifiers = itemModifiers.length > 0;

  const totalPrice = useMemo(() => {
    const basePrice = item.price || 0;
    const optionsPrice = selectedOptions.reduce(
      (sum, opt) => sum + (opt.price || 0),
      0
    );
    return (basePrice + optionsPrice) * quantity;
  }, [item.price, selectedOptions, quantity]);

  const handleOptionChange = (modifier, option, isSingle) => {
    const newSelection = {
      modifierId: modifier.id,
      id: option.id,
      name: option.name,
      price: option.price,
    };
    if (isSingle) {
      const otherOptions = selectedOptions.filter(
        (opt) => opt.modifierId !== modifier.id
      );
      setSelectedOptions([...otherOptions, newSelection]);
    } else {
      const existingIndex = selectedOptions.findIndex(
        (opt) => opt.modifierId === modifier.id && opt.id === option.id
      );
      if (existingIndex >= 0) {
        setSelectedOptions(
          selectedOptions.filter((_, i) => i !== existingIndex)
        );
      } else {
        setSelectedOptions([...selectedOptions, newSelection]);
      }
    }
  };

  const isOptionSelected = (modifierId, optionId) =>
    selectedOptions.some(
      (opt) => opt.modifierId === modifierId && opt.id === optionId
    );

  const canAddToCart = useMemo(
    () =>
      itemModifiers.length === 0 || 
      itemModifiers.every(
        (modifier) =>
          !modifier.required ||
          selectedOptions.some((opt) => opt.modifierId === modifier.id)
      ),
    [itemModifiers, selectedOptions]
  );

  console.log("🎯 Modal state:", {
    canAddToCart,
    itemModifiers: itemModifiers.length,
    selectedOptions: selectedOptions.length,
    requiredModifiers: itemModifiers.filter((m) => m.required).length,
  });

  const handleAddToCart = () => {
    if (!canAddToCart) {
      alert("Please select all required options");
      return;
    }
    console.log("🎯 Adding to cart:", {
      item,
      selectedOptions,
      quantity,
      specialInstruction,
    });
    onAddToCart(
      item,
      selectedOptions,
      quantity,
      specialInstruction,
      item.editingCartKey
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-white w-full h-full rounded-none overflow-hidden grid grid-cols-[1fr_2fr] grid-rows-[4fr_1fr]">
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
          {item.image ? (
            <div className="relative h-full">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  {item.name}
                </h1>
                {item.description && (
                  <p className="text-white/90 text-sm drop-shadow-md line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
              <div className="text-center">
                <div className="text-6xl mb-4">🍕</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {item.name}
                </h1>
                {item.description && (
                  <p className="text-gray-600 text-sm">{item.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            >
              <MdClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="h-full grid grid-cols-2 gap-8 p-8 pt-16 items-stretch">
            <div className="space-y-6 h-full flex flex-col">
              {hasModifiers ? (
                <div className="space-y-6 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                    Customize Your Order
                  </h2>
                  <div className="space-y-6 mt-6 overflow-y-auto">
                    {itemModifiers.map((modifier) => {
                      const isSingle = modifier.selectionType === "single";
                      return (
                        <div
                          key={modifier.id}
                          className="bg-gray-50 rounded-xl p-5"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {modifier.displayName || modifier.name}
                            </h3>
                            {modifier.required && (
                              <span className="text-xs font-bold text-red-600 uppercase bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {isSingle
                              ? "Choose one option"
                              : "Choose multiple options"}
                          </p>
                          <div className="space-y-3">
                            {modifier.options.map((option) => {
                              const isSelected = isOptionSelected(
                                modifier.id,
                                option.id
                              );
                              return (
                                <label
                                  key={option.id}
                                  onClick={() =>
                                    handleOptionChange(
                                      modifier,
                                      option,
                                      isSingle
                                    )
                                  }
                                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    isSelected
                                      ? "border-orange-500 bg-orange-50 shadow-md"
                                      : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isSelected
                                          ? "border-orange-500 bg-orange-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      )}
                                    </div>
                                    <span
                                      className={`font-medium ${
                                        isSelected
                                          ? "text-orange-900"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {option.name}
                                    </span>
                                  </div>
                                  {option.price > 0 && (
                                    <span
                                      className={`font-semibold ${
                                        isSelected
                                          ? "text-orange-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      +${option.price.toFixed(2)}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🍽️</div>
                    <p className="text-lg font-medium">
                      No customizations available
                    </p>
                    <p className="text-sm">This item comes as is</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6 h-full flex flex-col">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Special Instructions
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {specialInstruction.length}/100 characters
                </p>
                <textarea
                  value={specialInstruction}
                  onChange={(e) => setSpecialInstruction(e.target.value)}
                  placeholder="e.g., No onions, extra spicy, allergies..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                  rows="6"
                  maxLength="100"
                />
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Special instructions are not guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border-t border-gray-200 p-6 flex flex-col justify-center">
          <div className="text-sm text-gray-600 font-medium mb-2">
            Price
          </div>
          <div className="flex flex-col gap-2">
            {item.originalPrice && item.originalPrice > item.price ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  ${item.price.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-red-600">
                ${item.price.toFixed(2)}
              </span>
            )}
            {item.originalPrice && item.originalPrice > item.price && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  Save ${(item.originalPrice - item.price).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  (
                  {Math.round(
                    ((item.originalPrice - item.price) /
                      item.originalPrice) *
                      100
                  )}
                  % off)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
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
                <span className="text-lg font-bold w-12 text-center text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
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
            <div className="text-right">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3"
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"
              />
            </svg>
            <span>Add to Cart</span>
            <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
