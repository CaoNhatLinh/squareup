import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "@/api/orders";
import {
  HiArrowCircleLeft,
  HiCheck,
  HiX,
  HiTag,
  HiClock,
  HiCurrencyDollar,
  HiCheckCircle,
} from "react-icons/hi";
import { useOrderNotification } from "@/hooks/useOrderNotification";
import { getNextStatus, getStatusButtonText } from "@/utils/statusUtils";
import { normalizeSelectedOptions } from "@/utils/normalizeOptions";
import { formatDate } from "@/utils/dateUtils";
import { StatusBadge } from "@/utils/uiUtils";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId, restaurantId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('out_of_stock');
  const [cancelNote, setCancelNote] = useState('');
  const { markOrderAsViewed } = useOrderNotification();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
      markOrderAsViewed(orderId);
    }
  }, [orderId, markOrderAsViewed]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      const response = await getOrderById(id);
      setOrder(response.order);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Không tìm thấy đơn hàng hoặc lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!restaurantId) {
      console.error("Restaurant ID not available");
      return;
    }

    if (newStatus === "cancelled") {
      setShowCancelDialog(true);
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(restaurantId, orderId, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };
  
  const handleCancelOrder = async () => {
    try {
      setUpdating(true);
      await updateOrderStatus(restaurantId, orderId, 'cancelled', cancelReason, cancelNote);
      setOrder((prev) => ({ ...prev, status: 'cancelled', cancelReason, cancelNote }));
      setShowCancelDialog(false);
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>

          <p className="text-lg text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
          >
            <HiArrowCircleLeft className="w-6 h-6" />
            Back
          </button>
        </div>

        {order.status !== "completed" && order.status !== "cancelled" && (
          <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-red-500 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Next Action Required
                </h3>

                <p className="text-sm text-gray-700">
                  Current status:
                  <StatusBadge status={order.status} />
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={updating}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors shadow-md ${
                    updating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-400"
                  }`}
                >
                  <HiX className="w-5 h-5" />
                  {updating ? "Updating..." : "Reject/Cancel"}
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(getNextStatus(order.status))
                  }
                  disabled={updating || !getNextStatus(order.status)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-md ${
                    updating || !getNextStatus(order.status)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-red-300"
                  }`}
                >
                  <HiCheck size={18} />
                  {updating ? "Updating..." : getStatusButtonText(order.status)}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase flex items-center gap-2">
              <HiTag className="w-4 h-4 text-red-500" /> Order Details
            </h3>

            <p className="text-xl font-extrabold text-gray-900 mb-1">
              #{order.id?.substring(0, 8).toUpperCase()}
            </p>

            <p className="text-sm text-gray-600 mb-4">
              {formatDate(order.createdAt)}
            </p>

            <div className="space-y-1">
              <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <HiClock className="w-4 h-4 text-gray-500" /> Fulfillment:{" "}
                {order.fulfillmentType || "Pickup"}
              </p>

              <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <HiCurrencyDollar className="w-4 h-4 text-gray-500" /> Payment:
                {order.paymentMethod || "Card"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">
              Customer
            </h3>

            <p className="text-lg font-semibold text-gray-900">
              {order.customerName || "Guest"}
            </p>

            <p className="text-gray-600">{order.customerPhone || "No Phone"}</p>

            <p className="text-gray-600">{order.customerEmail || "No Email"}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">
              Delivery/Pickup
            </h3>

            <p className="text-gray-700 font-medium">
              {order.address?.street || "Pickup at Restaurant"}
            </p>

            {order.address?.city && (
              <p className="text-gray-600">
                {order.address.city}, {order.address.state}
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Order Items ({order.items?.length || 0})
          </h2>

          <div className="space-y-6">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-6 gap-4 pb-4 border-b border-gray-200"
              >
                <div className="sm:col-span-3 flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  )}

                  <div>
                    {(() => {
                      const itemDiscountData =
                        order.discount?.itemDiscounts?.[item.groupKey];
                      const isItemDiscounted =
                        itemDiscountData?.discountAmount > 0;

                      if (!isItemDiscounted) {
                        return (
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.name}
                          </h3>
                        );
                      }

                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">
                              {item.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                              <HiTag className="w-4 h-4" />
                              {itemDiscountData.discountPercentage}% OFF
                            </span>
                          </div>
                          
                        </div>
                      );
                    })()}
                        <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">{item.quantity}x</span> @
                      ${(function() {
                        const basePrice = item.price || 0;
                        const optsArray = normalizeSelectedOptions(item.selectedOptions);
                        const optionsTotal = optsArray.reduce((sum, opt) => sum + (opt.price || 0), 0) || 0;
                        const originalPrice = basePrice + optionsTotal;
                        return (originalPrice / item.quantity).toFixed(2);
                      })()} each
                    </p>

                    {item.specialInstruction && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border-l-4 border-red-600 shadow-sm">
                        <p className="text-sm font-extrabold text-red-700 flex items-center gap-2 mb-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          SPECIAL INSTRUCTION!
                        </p>

                        <p className="text-sm text-red-800 italic">
                          {item.specialInstruction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                    {normalizeSelectedOptions(item.selectedOptions).length > 0 && (
                    <div className="space-y-1">
                      {normalizeSelectedOptions(item.selectedOptions).map((opt, idx) => (
                        <p
                          key={idx}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {opt.name}

                          {opt.price > 0 && (
                            <span className="text-green-600 font-medium">
                              +$
                              {opt.price.toFixed(2)}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-1 flex justify-end items-start">
                  <span className="text-xl font-extrabold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-600">
              <span className="font-medium">
                Subtotal ({order.items?.length || 0} items)
              </span>

              <span className="font-semibold">
                ${order.subtotal?.toFixed(2)}
              </span>
            </div>

            {order.discount && order.discount.totalDiscount > 0 && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 my-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HiCheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0" />

                    <span className="font-bold text-cyan-800">
                      Discount Applied
                    </span>
                  </div>

                  <span className="font-extrabold text-lg text-cyan-700">
                    -$
                    {Number(order.discount.totalDiscount || 0).toFixed(2)}
                  </span>
                </div>

                {order.discount.appliedDiscounts &&
                  order.discount.appliedDiscounts.length > 0 && (
                    <div className="space-y-1 mt-3 border-t border-cyan-200 pt-3">
                      {order.discount.appliedDiscounts.map((discount, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <HiTag className="w-4 h-4 text-cyan-500" />

                            <p className="font-semibold text-cyan-800">
                              {discount.name}
                            </p>
                          </div>

                          <p className="text-cyan-700 text-sm font-medium">
                            -
                            {discount.amountType === "percentage"
                              ? `${discount.amount}%`
                              : `$${Number(discount.amount || 0).toFixed(2)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                {order.discount.itemDiscounts &&
                  Object.keys(order.discount.itemDiscounts).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-cyan-200">
                      <p className="text-xs font-bold text-cyan-700 mb-2">
                        Item Discounts:
                      </p>

                      <div className="space-y-1">
                        {order.items?.map((item) => {
                          const itemDiscount =
                            order.discount.itemDiscounts[item.groupKey];
                          if (!itemDiscount || itemDiscount.discountAmount <= 0)
                            return null;

                          const appliedDiscountName =
                            order.discount?.appliedDiscounts?.[0]?.name || "Automatic Discount";
                          return (
                            <div
                              key={item.groupKey}
                              className="flex items-center justify-between text-xs text-cyan-700"
                            >
                              <span className="flex items-center gap-1">
                                <span
                                  className="font-medium cursor-help"
                                  title={`${appliedDiscountName}`}
                                >
                                  {item.name} ({item.quantity}x)
                                </span>
                              </span>

                              <span className="font-semibold">
                                -$
                                {(
                                  Number(itemDiscount.discountAmount || 0) *
                                  item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span className="font-medium">${order.tax?.toFixed(2)}</span>
              </div>
            )}

            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span className="font-medium">
                  ${order.deliveryFee?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="h-px bg-gray-300 my-4"></div>
            <div className="flex items-center justify-between text-2xl font-extrabold text-gray-900">
              <span>GRAND TOTAL</span>
              <span className="text-green-600">
                ${order.amount?.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
              <span>Payment Status</span>
              <span className="font-medium uppercase">
                {order.paymentStatus || "Paid"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Cancel Order</h3>
            <p className="text-sm text-slate-600 mb-4">
              This action cannot be undone. Please provide a reason for cancellation.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cancellation Reason *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="restaurant_too_busy">Restaurant Too Busy</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="duplicate_order">Duplicate Order</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Note (Optional)
                </label>
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Add any additional information for the customer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={updating}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
