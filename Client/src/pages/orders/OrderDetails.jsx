import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../api/orders";
import {
  HiArrowCircleLeft,
  HiCheck,
  HiX,
  HiTag,
  HiClock,
  HiCurrencyDollar,
} from "react-icons/hi";
import { useOrderNotification } from "../../hooks/useOrderNotification";
import { useRestaurant } from "../../hooks/useRestaurant";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { markOrderAsViewed } = useOrderNotification();
  const { restaurant } = useRestaurant();

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
    if (!restaurant?.id) {
      console.error("Restaurant ID not available");
      return;
    }

    if (
      newStatus === "cancelled" &&
      !window.confirm(
        "Are you sure you want to CANCEL this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(restaurant.id, orderId, newStatus); 
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      paid: "accepted",
      pending: "accepted",
      accepted: "preparing",
      preparing: "ready",
      ready: "completed",
    };
    return statusFlow[currentStatus];
  };

  const getStatusButtonText = (currentStatus) => {
    const textMap = {
      paid: "Accept Order",
      pending: "Accept Order",
      accepted: "Start Preparing",
      preparing: "Mark as Ready",
      ready: "Complete Order",
    };
    return textMap[currentStatus] || "Update Status";
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatusBadge = ({ status }) => {
    let classes = "";
    if (status === "paid" || status === "pending") {
      classes = "bg-red-100 text-red-800 border border-red-300 font-bold";
    } else if (status === "accepted") {
      classes =
        "bg-teal-100 text-teal-800 border border-teal-300 font-semibold";
    } else if (status === "preparing") {
      classes =
        "bg-purple-100 text-purple-800 border border-purple-300 font-semibold";
    } else if (status === "ready") {
      classes =
        "bg-green-100 text-green-800 border border-green-300 font-semibold";
    } else if (status === "completed") {
      classes = "bg-gray-200 text-gray-700 border border-gray-300";
    } else if (status === "cancelled") {
      classes = "bg-gray-100 text-gray-500 border border-gray-300";
    } else {
      classes = "bg-gray-100 text-gray-800";
    }
    return (
      <span
        className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full uppercase ${classes}`}
      >
        {status}
      </span>
    );
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
            onClick={() => navigate("/orders")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Back to Orders
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
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
          >
            <HiArrowCircleLeft className="w-6 h-6" />
            Back to Orders List
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
        {/* ORDER DETAILS & CUSTOMER */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột 1: Thông tin Đơn hàng */}
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
                <HiClock className="w-4 h-4 text-gray-500" /> Fulfillment:
                {order.fulfillmentType || "Pickup"}
              </p>
              <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <HiCurrencyDollar className="w-4 h-4 text-gray-500" /> Payment:
                {order.paymentMethod || "Card"}
              </p>
            </div>
          </div>
          {/* Cột 2: Thông tin Khách hàng */}
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
          {/* Cột 3: Địa chỉ/Giao hàng */}
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
        {/* Order Items */}
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
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">{item.quantity}x</span> @
                      ${item.price.toFixed(2)}
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
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="space-y-1">
                      {item.selectedOptions.map((opt, idx) => (
                        <p
                          key={idx}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {opt.name}
                          {opt.price > 0 && (
                            <span className="text-green-600 font-medium">
                              +${opt.price.toFixed(2)}
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
              <span>Subtotal ({order.items?.length || 0} items)</span>

              <span className="font-medium">${order.subtotal?.toFixed(2)}</span>
            </div>

            {order.tax > 0 && (
              <div className="flex items-center justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium">${order.tax?.toFixed(2)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium">
                  ${order.deliveryFee?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-4"></div>
            <div className="flex items-center justify-between text-2xl font-extrabold text-gray-900">
              <span>GRAND TOTAL</span>
              <span className="text-red-600">${order.amount?.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
              <span>Payment Status</span>
              <span className="font-medium uppercase">
                {order.paymentStatus || "Paid"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
