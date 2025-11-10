import { useState } from "react";
import { useShop } from "../../../context/ShopContext";
import { useParams } from "react-router-dom";
import RemoveItemModal from "./RemoveItemModal";
import { createCheckoutSession } from "../../../api/checkout";

export default function CartDrawer({ isOpen, onClose, onEditItem }) {
  const { restaurantId } = useParams();
  const { restaurant, cart, removeFromCart, getCartTotal, discountCalculation } = useShop();
  const totalAmount = getCartTotal();
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Use discount calculation from context
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Block checkout if restaurant is closed
    if (restaurant?.isOpen === false) {
      alert("Sorry, the restaurant is currently closed. Please come back during business hours.");
      return;
    }
    
    if (!restaurantId) {
      alert("Restaurant ID không hợp lệ. Vui lòng tải lại trang.");
      return;
    }
    
    setCheckoutLoading(true);
    try {
      console.log("🛒 Starting checkout for restaurant:", restaurantId);
      console.log("📦 Cart items:", cart.length);

      // Create checkout session (success and cancel URLs handled by backend)
      const response = await createCheckoutSession(
        restaurantId,
        cart
      );

      console.log("✅ Session created:", response.sessionId);
      console.log("🚀 Redirecting to:", response.url);

      // Redirect to Stripe Checkout using URL
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      alert(`Lỗi thanh toán: ${error.response?.data?.error || error.message || "Vui lòng thử lại"}`);
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
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-b">
          <h3 className="text-xl font-bold text-red-600 mb-1">{restaurant?.name || "Restaurant"}</h3>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>địa chỉ</span>
          </div>
        </div>

        {/* Discount Summary - Show before checkout button */}
        {cart.length > 0 && totalDiscount > 0 && (
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Show all applied discounts */}
              {appliedDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {appliedDiscounts.map((discount, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
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
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-700 font-medium">
                      {appliedDiscount?.name || 'Discount'}
                      {appliedDiscount?.amountType === 'percentage' && ` (${appliedDiscount.amount}%)`}
                    </span>
                  </div>
                  <span className="font-medium text-green-700">-${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-green-300 flex items-center justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-xl text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="px-6 py-3 bg-white border-b">
            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading || restaurant?.isOpen === false}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-between px-6 ${
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
              <p className="text-sm text-red-600 text-center mt-2">
                Opens {restaurant.nextOpenTime}
              </p>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <div className="px-6 py-3 bg-white border-b">
            <button 
              onClick={onClose}
              className="w-full border-2 border-gray-900 text-gray-900 py-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add More Items</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 h-full flex flex-col justify-center items-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
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