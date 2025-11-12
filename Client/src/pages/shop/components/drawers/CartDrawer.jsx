import { useState } from "react";
import { useShop } from "@/context/ShopContext.jsx";
import { useParams } from "react-router-dom";
import RemoveItemModal from "@/pages/shop/components/modals/RemoveItemModal";
import { createCheckoutSession } from "@/api/checkout";
import { useToast } from "@/hooks/useToast";
import { 
  HiArrowLeft, 
  HiTrash, 
  HiMapPin, 
  HiCheck, 
  HiPlus, 
  HiShoppingCart 
} from "react-icons/hi2";

export default function CartDrawer({ isOpen, onClose, onEditItem }) {
  const { restaurantId } = useParams();
  const { restaurant, cart, removeFromCart, clearCart, getCartTotal, discountCalculation } = useShop();
  const { error: showError } = useToast();
  const totalAmount = getCartTotal();
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

  const {
    subtotal = totalAmount,
    totalDiscount = 0,
    total = totalAmount,
    itemDiscounts = {},
    appliedDiscount = null,
    appliedDiscounts = [],
    discountAmounts = {}
  } = discountCalculation || {};
  
  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.groupKey);
      setItemToRemove(null);
    }
  };

  const handleClearCart = () => {
    if (cart.length > 0) {
      setShowClearCartConfirm(true);
    }
  };

  const handleConfirmClearCart = () => {
    clearCart();
    setShowClearCartConfirm(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (restaurant?.isOpen === false) {
      showError("Sorry, the restaurant is currently closed. Please come back during business hours.");
      return;
    }
    
    if (!restaurantId) {
      showError("Restaurant ID is invalid. Please reload the page.");
      return;
    }
    
    setCheckoutLoading(true);
    try {

      const response = await createCheckoutSession(
        restaurantId,
        cart
      );

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      showError(`Payment error: ${error.response?.data?.error || error.message || "Please try again"}`);
      setCheckoutLoading(false);
    }
  };
  
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Back"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm"
              title="Clear all items from cart"
            >
              <HiTrash className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <div className="px-4 py-2 bg-white border-b">
          <h3 className="text-lg font-bold text-red-600 mb-1">{restaurant?.name || "Restaurant"}</h3>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <HiMapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>{restaurant?.address || "restaurant address"}</span>
          </div>
        </div>

        {cart.length > 0 && totalDiscount > 0 && (
          <div className="px-4 py-2 bg-green-50 border-b border-green-200">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              {appliedDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {appliedDiscounts.map((discount, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <HiCheck className="w-3 h-3 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {discount.name}
                          {discount.amountType === 'percentage' && ` (${discount.amount}%)`}
                        </span>
                      </div>
                      <span className="font-medium text-green-700">
                        -${(discountAmounts[discount.id] || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-green-300 mt-1">
                    <span className="text-gray-700 font-semibold">Total Savings:</span>
                    <span className="font-bold text-green-700">-${totalDiscount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HiCheck className="w-3 h-3 text-green-600" />
                    <span className="text-green-700 font-medium">
                      {appliedDiscount?.name || 'Discount'}
                      {appliedDiscount?.amountType === 'percentage' && ` (${appliedDiscount.amount}%)`}
                    </span>
                  </div>
                  <span className="font-medium text-green-700">-${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-1 border-t border-green-300 flex items-center justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="px-4 py-2 bg-white ">
            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading || restaurant?.isOpen === false}
              className={`w-full py-3 rounded-full font-bold text-base transition-colors flex items-center justify-between px-4 ${
                restaurant?.isOpen === false
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <span>
                {restaurant?.isOpen === false
                  ? "Closed - Cannot Order"
                  : checkoutLoading
                  ? "Processing..."
                  : "Checkout"}
              </span>
              <span>${(total || totalAmount).toFixed(2)}</span>
            </button>
            {restaurant?.isOpen === false && restaurant?.nextOpenTime && (
              <p className="text-xs text-red-600 text-center mt-1">
                Opens {restaurant.nextOpenTime}
              </p>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <div className="px-4 py-2 bg-white">
            <button 
              onClick={onClose}
              className="w-full border-2 border-gray-900 text-gray-900 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <HiPlus className="w-4 h-4" />
              <span>Add More Items</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 h-full flex flex-col justify-center items-center">
              <HiShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.groupKey} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start gap-4 mb-2">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.quantity}×
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                      
                      {/* Show discount badge and pricing if discount applied */}
                      {itemDiscounts[item.groupKey] && itemDiscounts[item.groupKey].discountAmount > 0 ? (
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded">
                              {itemDiscounts[item.groupKey].discountPercentage}% OFF
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 line-through">${item.price.toFixed(2)}</span>
                            <span className="text-sm text-red-600 font-semibold">
                              ${(item.price - (itemDiscounts[item.groupKey].discountAmount / item.quantity)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mb-1">${item.price.toFixed(2)}</p>
                      )}

                      {item.selectedOptions.length > 0 && (
                        <div className="mb-2">
                          {item.selectedOptions.map((option, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              {option.name}
                            </p>
                          ))}
                        </div>
                      )}

                      {item.note && (
                        <p className="text-sm text-gray-500 italic">If sold out, Chef recommendation</p>
                      )}

                      <div className="flex gap-4 mt-2">
                        <button 
                          onClick={() => onEditItem(item)}
                          className="text-sm text-blue-600 font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRemoveClick(item)}
                          className="text-sm text-red-600 font-medium hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showClearCartConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 ">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <HiTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 ">Clear Cart</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearCartConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearCart}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <RemoveItemModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setItemToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        itemName={itemToRemove?.name}
      />
    </>
  );
}