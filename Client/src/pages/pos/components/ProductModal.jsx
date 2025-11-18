import { useState, useEffect, useMemo } from "react";
import { normalizeOptions } from "../../../utils/normalizeOptions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function ProductModal({ item, modifiers, onClose, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstruction, setSpecialInstruction] = useState("");
  const isSoldOut = item?.isSoldOut === true || (item?.stock !== undefined && item?.stock <= 0);

  const itemModifiers = useMemo(() => 
    (item.modifierIds || [])
      .map((id) => modifiers[id])
      .filter(Boolean)
      .map((modifier) => ({
        ...modifier,
        options: normalizeOptions(modifier.options).sort((a, b) => (a.index || 0) - (b.index || 0)),
      })),
    [item.modifierIds, modifiers]
  );

  useEffect(() => {
    const defaults = itemModifiers
      .map((modifier) => {
        const opts = normalizeOptions(modifier.options);
        const defaultOption = opts.find((opt) => opt.isDefault);
        return defaultOption || opts[0];
      })
      .filter(Boolean);
    setSelectedOptions(defaults);
  }, [itemModifiers]);

  const handleOptionSelect = (modifierId, option) => {
    setSelectedOptions((prev) => {
      const filtered = prev.filter((opt) => opt.modifierId !== modifierId);
      return [...filtered, { ...option, modifierId }];
    });
  };

  const calculateTotal = () => {
    const basePrice = Number(item?.hasDiscount ? item?.discountedPrice : item?.price ?? 0);
    const modifierTotal = selectedOptions.reduce((sum, opt) => sum + Number(opt?.price ?? 0), 0);
    return (basePrice + modifierTotal) * Number(quantity ?? 0);
  };

  const handleAdd = () => {
    if (isSoldOut) return;
    onAddToCart(item, selectedOptions, quantity, specialInstruction);
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="large"
      title={item.name}
      footer={
        <Button
          onClick={handleAdd}
          disabled={isSoldOut}
          variant={isSoldOut ? "ghost" : "primary"}
          fullWidth
          size="large"
        >
          {isSoldOut ? 'OUT OF STOCK' : `Add to cart - $${Number(calculateTotal() ?? 0).toFixed(2)}`}
        </Button>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Header Image */}
        {item.image && (
          <div className="relative -mx-6 -mt-6 mb-6">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-64 object-cover"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="danger" size="large">OUT OF STOCK</Badge>
              </div>
            )}
          </div>
        )}

        {/* Description and Price */}
        {item.description && (
          <p className="text-gray-600">{item.description}</p>
        )}

        <div className="flex items-center gap-2">
          {item.hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-red-600">
                ${Number(item?.discountedPrice ?? item?.price ?? 0).toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${Number(item?.originalPrice ?? item?.price ?? 0).toFixed(2)}
              </span>
              <Badge variant="danger">{item.discountPercent}% OFF</Badge>
            </>
          ) : (
            <span className="text-2xl font-bold text-red-600">
              ${Number(item?.price ?? 0).toFixed(2)}
            </span>
          )}
        </div>

        {/* Modifiers */}
        {itemModifiers.map((modifier) => (
          <div key={modifier.id}>
            <h3 className="font-semibold text-gray-900 mb-3">
              {modifier.name}
              {modifier.isRequired && (
                <span className="text-red-600 ml-1">*</span>
              )}
            </h3>
            <div className="space-y-2">
              {modifier.options?.map((option) => {
                const isSelected = selectedOptions.some(
                  (opt) => opt.modifierId === modifier.id && opt.id === option.id
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
                      {option.price > 0 ? `+$${Number(option.price ?? 0).toFixed(2)}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Special Instructions */}
        <div>
          <Input
            as="textarea"
            label="Special Instructions"
            placeholder="e.g., No onions, extra spicy, allergies, etc."
            value={specialInstruction}
            onChange={(e) => setSpecialInstruction(e.target.value)}
            rows={3}
          />
        </div>

        {/* Quantity */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="large"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </Button>
            <span className="text-2xl font-bold text-gray-900 w-16 text-center">
              {quantity}
            </span>
            <Button
              variant="secondary"
              size="large"
              onClick={() => setQuantity(quantity + 1)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
