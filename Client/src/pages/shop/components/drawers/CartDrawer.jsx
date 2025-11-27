import { useState } from "react";
import { useShop } from "@/context/ShopContext.jsx";
import { useGuestUser } from "@/context/GuestUserContext.jsx";
import useAppStore from '@/store/useAppStore';
import RemoveItemModal from "@/pages/shop/components/modals/RemoveItemModal";
import { normalizeSelectedOptions } from "@/utils/normalizeOptions";
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
import { Button, Input } from '@/components/ui';

export default function CartDrawer({ isOpen, onClose, onEditItem }) {
  const restaurantId = useAppStore(s => s.restaurantId);
  const { guestUuid } = useGuestUser();
  const { restaurant, cart, removeFromCart, clearCart, getCartTotal, discountCalculation } = useShop();
  const { error: showError } = useToast();
  const totalAmount = getCartTotal();
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState({ line1: '', city: '', postalCode: '', instructions: '' });
  const [seatNumber, setSeatNumber] = useState('');
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
      const returnUrl = `${window.location.origin}/${restaurant?.slug ? restaurant.slug : 'shop'}/order/success`;
      const response = await createCheckoutSession(
        restaurantId,
        cart,
        guestUuid,
        { orderType, deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined, seatNumber: orderType === 'dine_in' ? seatNumber : undefined, returnUrl }
      );

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error("Checkout error:", error);
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
            <Button onClick={handleClearCart} variant="destructive" size="small" className="flex items-center gap-1.5" title="Clear all items from cart">
              <HiTrash className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
        <div className="px-4 py-2 bg-white border-b">
          <h3 className="text-lg font-bold text-red-600 mb-1">{restaurant?.name || "Restaurant"}</h3>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <HiMapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>{restaurant?.address || "restaurant address"}</span>
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium">Order Type</label>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setOrderType('delivery')} variant={orderType === 'delivery' ? 'default' : 'outline'} size="small">Delivery</Button>
              <Button onClick={() => setOrderType('pickup')} variant={orderType === 'pickup' ? 'default' : 'outline'} size="small">Pickup</Button>
              <Button onClick={() => setOrderType('dine_in')} variant={orderType === 'dine_in' ? 'default' : 'outline'} size="small">Dine-in</Button>
            </div>
            {orderType === 'delivery' && (
              <div className="mt-2 grid grid-cols-1 gap-2">
                <Input value={deliveryAddress.line1} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, line1: e.target.value }))} placeholder="Address line 1" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={deliveryAddress.city} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))} placeholder="City" />
                  <Input value={deliveryAddress.postalCode} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postalCode: e.target.value }))} placeholder="Postal code" />
                </div>
              </div>
            )}
            {orderType === 'dine_in' && (
              <div className="mt-2">
                <Input value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} placeholder="Seat number (optional)" />
              </div>
            )}
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
            <Button onClick={handleCheckout} disabled={checkoutLoading || restaurant?.isOpen === false} variant="primary" size="large" className="w-full flex items-center justify-between px-4 py-3">
              <span>{restaurant?.isOpen === false ? "Closed - Cannot Order" : checkoutLoading ? "Processing..." : "Checkout"}</span>
              <span>${(total || totalAmount).toFixed(2)}</span>
            </Button>
            {restaurant?.isOpen === false && restaurant?.nextOpenTime && (
              <p className="text-xs text-red-600 text-center mt-1">
                Opens {restaurant.nextOpenTime}
              </p>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <div className="px-4 py-2 bg-white">
            <Button onClick={onClose} variant="primary" btnStyle="outline" className="w-full flex items-center justify-center gap-2" size="small">
              <HiPlus className="w-4 h-4" />
              <span>Add More Items</span>
            </Button>
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

                      {normalizeSelectedOptions(item.selectedOptions).length > 0 && (
                        <div className="mb-2">
                          {normalizeSelectedOptions(item.selectedOptions).map((option, idx) => (
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
                <Button variant="outline" className="flex-1" onClick={() => setShowClearCartConfirm(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleConfirmClearCart}>Clear Cart</Button>
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