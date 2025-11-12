import React, { useState, useMemo } from "react";
import { MdClose } from "react-icons/md";

export default function ItemModal({
  item,
  modifiers,
  onClose,
  onAddToCart,
}) {
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
        required: modifier.required || false,
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
      itemModifiers.every(
        (modifier) =>
          !modifier.required ||
          selectedOptions.some((opt) => opt.modifierId === modifier.id)
      ),
    [itemModifiers, selectedOptions]
  );

  const handleAddToCart = () => {
    if (!canAddToCart) {
      alert("Please select all required options");
      return;
    }
    onAddToCart(
      item,
      selectedOptions,
      quantity,
      specialInstruction,
      item.editingCartKey
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full grid grid-cols-1 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-4 bg-gray-100 flex flex-col">
          <div className="relativerounded-lg overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="relative h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <svg
                  className="w-32 h-32 text-gray-400"
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
          </div>
          <div className="p-6 border-t">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {item.name}
            </h2>
            {item.description && (
              <div className="mb-2">
                <p className="text-gray-600">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col bg-white relative max-h-screen">
          {/* Header */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-24">
            <div className="w-full max-w-[560px] mx-auto space-y-6">
              {hasModifiers && (
                <>
                  {itemModifiers.map((modifier) => {
                    const isSingle = modifier.selectionType === "single";
                    return (
                      <div
                        key={modifier.id}
                        className="border-t pt-5 first:border-t-0 first:pt-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {modifier.displayName || modifier.name}
                          </h3>
                          {modifier.required && (
                            <span className="text-xs font-bold text-red-600 uppercase bg-red-50 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {isSingle
                            ? "Choose one option"
                            : "Choose multiple options"}
                        </p>
                        <div className="space-y-2">
                          {modifier.options.map((option) => {
                            const isSelected = isOptionSelected(
                              modifier.id,
                              option.id
                            );
                            return (
                              <label
                                key={option.id}
                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-red-600 bg-red-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type={isSingle ? "radio" : "checkbox"}
                                    name={modifier.id}
                                    checked={isSelected}
                                    onChange={() =>
                                      handleOptionChange(modifier, option, isSingle)
                                    }
                                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                                  />
                                  <span className="text-gray-900">
                                    {option.name}
                                  </span>
                                </div>
                                {option.price > 0 && (
                                  <span className="text-gray-900 font-medium">
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
                </>
              )}

              <div className={`${hasModifiers ? 'border-t pt-6' : ''}`}>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Special Instruction
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {specialInstruction.length}/100
                </p>
                <textarea
                  value={specialInstruction}
                  onChange={(e) => setSpecialInstruction(e.target.value)}
                  placeholder="Add instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows="3"
                  maxLength="100"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Special instruction is not guaranteed and will be fulfilled
                  within the store's capability.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t px-6 py-4 bg-white flex items-center justify-end gap-4 shadow-lg">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100"
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-lg font-semibold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100"
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
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="bg-red-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <span>Add Item</span>
              <span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="line-through text-red-200 text-sm mr-2">
                    {(
                      (item.originalPrice +
                        selectedOptions.reduce(
                          (sum, opt) => sum + (opt.price || 0),
                          0
                        )) *
                      quantity
                    ).toFixed(2)}
                  </span>
                )}
                ${totalPrice.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}