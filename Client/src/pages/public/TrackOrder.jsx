import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackOrderStatus } from "@/api/orders";
import {
  HiCheckCircle,
  HiClock,
  HiTruck,
  HiShoppingBag,
  HiArrowPath,
} from "react-icons/hi2";

const RestaurantLogo = ({ className = "h-8" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 210 60"
    className={className}
  >
    <path
      d="m59.813 0-.465.93a13.8 13.8 0 0 1-4.102 4.914q-.473.353-.976.672a13.84 13.84 0 0 1-6.762 2.058H25.637a12.8 12.8 0 0 0-4.274.73 12.88 12.88 0 0 0-7.816 7.837 12.9 12.9 0 0 0-.73 4.289c0 1.504.253 2.941.73 4.285a12.5 12.5 0 0 0 1.605 3.11 12.86 12.86 0 0 0 6.211 4.73q.445.153.895.277c1.078.297 2.207.45 3.375.45h8.543a4.28 4.28 0 0 1 4.273 4.288 4.277 4.277 0 0 1-4.273 4.285h-8.54a21 21 0 0 1-3.648-.312q-.315-.05-.625-.113a21.2 21.2 0 0 1-8.547-3.86 21.5 21.5 0 0 1-4.273-4.285 21.3 21.3 0 0 1-3.844-8.57 21.8 21.8 0 0 1 0-8.574 21.3 21.3 0 0 1 3.844-8.57 21.6 21.6 0 0 1 4.273-4.286A21.15 21.15 0 0 1 21.363.43 21.4 21.4 0 0 1 25.637 0Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "currentColor",
        fillOpacity: 1,
      }}
    ></path>
    <path
      d="M55.543 38.57c0 1.465-.148 2.899-.43 4.285a21.25 21.25 0 0 1-3.843 8.57 21.5 21.5 0 0 1-4.274 4.29 21.2 21.2 0 0 1-8.543 3.855 21.7 21.7 0 0 1-4.273.426H12.816V60H0l.465-.93a13.76 13.76 0 0 1 4.101-4.91c.317-.238.641-.465.977-.672a13.7 13.7 0 0 1 7.008-2.066h21.633c1.5 0 2.933-.258 4.273-.727a12.89 12.89 0 0 0 7.816-7.843 13 13 0 0 0 0-8.574 12.84 12.84 0 0 0-8.715-8.113 12.7 12.7 0 0 0-3.37-.454h-8.551a4.277 4.277 0 0 1-4.274-4.285 4.28 4.28 0 0 1 4.274-4.29h8.543c1.246 0 2.465.11 3.648.317q.316.053.621.113a21.1 21.1 0 0 1 8.543 3.856 21.4 21.4 0 0 1 8.55 17.148Zm23.129-1.96q1.178.674 3.27 1.253c1.41.375 2.796.563 4.167.563s2.368-.188 2.993-.563q.932-.579.933-1.855 0-.88-.543-1.52-.54-.638-1.605-1.218-1.066-.598-3.625-1.817-3.087-1.465-4.88-3.562-1.794-2.103-1.796-5.29 0-2.53 1.254-4.292 1.271-1.765 3.55-2.645 2.3-.881 5.348-.883c1.89 0 3.532.176 4.914.528q2.075.506 3.102 1.105l-1.102 5.363q-.915-.713-2.726-1.257a11.9 11.9 0 0 0-3.57-.563q-1.966.002-2.958.637-.967.64-.968 1.765-.001.845.484 1.5.505.655 1.531 1.274 1.031.599 2.899 1.46 2.671 1.202 4.336 2.384c1.12.789 1.984 1.707 2.582 2.757.597 1.036.894 2.282.894 3.73q0 2.57-1.215 4.481-1.194 1.892-3.53 2.946-2.339 1.03-5.626 1.03-1.909 0-3.777-.28a24 24 0 0 1-3.235-.696c-.921-.273-1.582-.539-1.98-.789Zm48.039 7.011h-7.98q-.17-.262-.637-1.164l-.578-1.086q-2.674-5.044-5.29-8.945l-2.597 3.094v8.101h-7.086V15.082h7.086v12.02l8.879-12.02h7.719l-9.329 12.3q1.214 1.706 3.067 4.782a717 717 0 0 1 4.523 7.648l1.008 1.727Zm11.629-28.539v28.54h-7.176v-28.54Zm10.418 0q1.25 0 3.828-.148c1.797-.102 3.184-.153 4.172-.153q5.378.002 8.168 2.364 2.8 2.344 2.8 7.707-.001 3.376-1.343 5.738-1.347 2.363-3.965 3.582c-1.742.812-3.875 1.219-6.39 1.219-1.133 0-2.102-.016-2.9-.04v8.27h-7.14V15.082Zm7.27 15.188q2.167 0 3.437-1.313c.86-.875 1.293-2.254 1.293-4.145q-.001-2.343-1.18-3.69-1.158-1.353-3.476-1.352c-1.172 0-2.16.07-2.973.207V30.12q1.57.148 2.898.149Zm24.171-15.188v23.156h9.383v5.383h-16.617V15.082Zm22.098 0v28.54h-7.18v-28.54Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "currentColor",
        fillOpacity: 1,
      }}
    ></path>
  </svg>
);

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [inputId, setInputId] = useState(
    () => orderId || localStorage.getItem("lastOrderId") || ""
  );

  const fetchOrderStatus = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const response = await trackOrderStatus(orderId);
        setOrder(response.order);
        setError(null);
      } catch (err) {
        console.error("Error tracking order:", err);
        setError(
          err.response?.data?.error ||
            "Unable to find order. Please check your order ID."
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId, fetchOrderStatus]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!inputId) return;
    localStorage.setItem("lastOrderId", inputId);
    navigate(`/track-order/${inputId}`);
  };

  useEffect(() => {
    if (
      !autoRefresh ||
      !order ||
      order.status === "completed" ||
      order.status === "cancelled"
    ) {
      return;
    }

    const interval = setInterval(() => {
      fetchOrderStatus(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, order, fetchOrderStatus]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: "Order Received",
        color: "yellow",
        icon: HiClock,
        description:
          "Your order has been received and is waiting for confirmation",
      },
      paid: {
        label: "Payment Confirmed",
        color: "yellow",
        icon: HiClock,
        description: "Payment confirmed, waiting for restaurant to accept",
      },
      accepted: {
        label: "Order Accepted",
        color: "blue",
        icon: HiCheckCircle,
        description: "Restaurant has accepted your order",
      },
      preparing: {
        label: "Preparing",
        color: "purple",
        icon: HiShoppingBag,
        description: "Your food is being prepared",
      },
      ready: {
        label: "Ready for Pickup/Delivery",
        color: "green",
        icon: HiTruck,
        description:
          "Your order is ready! It is now out for delivery or ready for pickup.",
      },
      completed: {
        label: "Completed",
        color: "gray",
        icon: HiCheckCircle,
        description: "Order has been completed. Enjoy your meal!",
      },
      cancelled: {
        label: "Cancelled",
        color: "red",
        icon: HiCheckCircle,
        description: "This order has been cancelled",
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  const getProgressPercentage = (status) => {
    const statusOrder = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(status);
    if (currentIndex === -1) return 0;
    if (status === "completed" || status === "cancelled") return 100; // Hoàn thành hoặc Hủy thì coi như 100% về mặt tiến độ (cho trạng thái cuối)
    return ((currentIndex + 1) / (statusOrder.length - 1)) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RestaurantLogo className="h-10 mx-auto mb-4 text-red-600 animate-pulse" />
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            Tracking order status...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <RestaurantLogo className="h-10 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Track Your Order
          </h1>

          <p className="text-gray-600 mb-4">
            Please enter your Order ID to see the status.
          </p>
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="flex gap-3">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-red-100 focus:ring-2 transition-all"
              placeholder="Paste your 12-digit Order ID"
            />

            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Track
            </button>
          </form>
          <div className="mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const progress = getProgressPercentage(order.status);
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <RestaurantLogo className="h-10 mx-auto text-red-600" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Tracking order status
          </h1>

          <p className="text-lg text-gray-600">
            Order ID:
            <span className="font-mono font-bold text-red-600">
              #{order.id?.toUpperCase()}
            </span>
          </p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-t-4 border-red-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full bg-${statusInfo.color}-100 flex items-center justify-center`}
              >
                <StatusIcon
                  className={`w-8 h-8 text-${statusInfo.color}-600`}
                />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  {statusInfo.label}
                </h2>

                <p className="text-gray-600 mt-1">{statusInfo.description}</p>
              </div>
            </div>
            <button
              onClick={() => fetchOrderStatus()}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Refresh"
            >
              <HiArrowPath className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Progress: {progress.toFixed(0)}%
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`bg-${statusInfo.color}-600 h-4 rounded-full transition-all duration-700 shadow-md`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Processing Stages
            </h3>
            {["pending", "accepted", "preparing", "ready", "completed"].map(
              (status) => {
                const stepInfo = getStatusInfo(status);
                const isDone = order.statusHistory?.[status];
                const StepIcon = stepInfo.icon;
                return (
                  <div key={status} className="flex items-start gap-4 relative">
                    {status !== "completed" && (
                      <div
                        className={`absolute left-5 top-10 h-full w-0.5 ${
                          isDone ? `bg-${stepInfo.color}-300` : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isDone
                          ? `bg-${stepInfo.color}-600 shadow-lg`
                          : "bg-gray-200"
                      }`}
                    >
                      <StepIcon
                        className={`w-5 h-5 ${
                          isDone ? `text-white` : "text-gray-500"
                        }`}
                      />
                    </div>

                    <div className="flex-1 pb-4">
                      <p
                        className={`font-bold ${
                          isDone ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {stepInfo.label}
                      </p>

                      {isDone && order.statusHistory[status] ? (
                        <p className="text-sm text-gray-600">
                          Completed at
                          {formatDate(order.statusHistory[status])}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Awaiting previous stage completion.
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <span className="text-sm font-semibold text-red-900">
                Live Auto-refresh (Every 10s)
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? "bg-red-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Order Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Restaurant
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {order.restaurantName}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Order Total
              </h3>

              <p className="text-2xl font-extrabold text-green-600">
                ${order.amount?.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.quantity}x {item.name}
                    </p>

                    {item.specialInstruction && (
                      <p className="text-sm text-red-500 italic">
                        Note: {item.specialInstruction}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${item.totalPrice?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {order.status === 'cancelled' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Order Cancelled
                </h3>
                
                {order.cancelReason && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-900 mb-1">Reason:</p>
                    <p className="text-sm text-red-700 capitalize">
                      {order.cancelReason.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                
                {order.cancelNote && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-900 mb-1">Additional Note:</p>
                    <p className="text-sm text-red-700 italic">
                      "{order.cancelNote}"
                    </p>
                  </div>
                )}
                
                {order.refunded && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="font-semibold">Payment Refunded</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Your payment has been refunded and will appear in your account within 5-10 business days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
