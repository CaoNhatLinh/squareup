import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../api/orders";
import { HiArrowCircleLeft } from "react-icons/hi";

export default function OrderDetails() {
    const navigate = useNavigate();
  const { orderId } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

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
    if (status === "paid") {
      classes = "bg-green-100 text-green-800";
    } else if (status === "processing") {
      classes = "bg-blue-100 text-blue-800"; // Đã thống nhất dùng màu xanh dương
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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.id?.substring(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600">{formatDate(order.createdAt)}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
              <p className="text-lg font-semibold text-gray-900">{order.customerName || "Guest"}</p>
              <p className="text-gray-600">{order.customerEmail || "No email"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Restaurant</h3>
              <p className="text-lg font-semibold text-gray-900">{order.restaurantName}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                {/* Item Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity */}
                  <p className="text-sm text-gray-600 mb-2">
                    Quantity: <span className="font-medium">{item.quantity}</span> × ${item.price.toFixed(2)}
                  </p>

                  {/* Selected Options */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                      <ul className="space-y-1">
                        {item.selectedOptions.map((opt, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {opt.name}
                            {opt.price > 0 && (
                              <span className="text-green-600 font-medium">+${opt.price.toFixed(2)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {item.specialInstruction && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Special Instructions:</p>
                      <p className="text-sm text-yellow-800">{item.specialInstruction}</p>
                    </div>
                  )}

                  {/* Discount */}
                  {item.discount > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      Discount: -{item.discount}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">${order.subtotal?.toFixed(2)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex items-center justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium">${order.tax?.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-4"></div>
            <div className="flex items-center justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span className="text-green-600">${order.total?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
              <span>Payment Method</span>
              <span className="font-medium">Card (Stripe)</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Currency</span>
              <span className="font-medium uppercase">{order.currency}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">Transaction ID</p>
              <p className="text-xs text-blue-700 font-mono break-all">{order.sessionId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
