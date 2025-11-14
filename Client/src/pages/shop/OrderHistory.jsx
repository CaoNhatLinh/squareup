import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGuestOrderHistory } from "@/api/guestUsers";
import { useGuestUser } from "@/context/GuestUserContext";
import { format } from "date-fns";

export default function OrderHistory() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { guestUuid, loading: guestLoading } = useGuestUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (guestLoading || !guestUuid) {
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching orders for guest:', guestUuid);
        const response = await getGuestOrderHistory(guestUuid);
        console.log('Orders response:', response);
        const restaurantOrders = response.orders.filter(
          order => order.restaurantId === restaurantId
        );
        setOrders(restaurantOrders);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
        setError("Unable to load order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [guestUuid, guestLoading, restaurantId]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      preparing: "bg-orange-100 text-orange-800",
      ready: "bg-purple-100 text-purple-800",
      completed: "bg-green-600 text-white",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
      case "accepted":
        return "✓";
      case "preparing":
        return "🍳";
      case "ready":
        return "✓";
      case "completed":
        return "✓✓";
      case "cancelled":
        return "✕";
      default:
        return "○";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/shop/${restaurantId}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your order history here</p>
            <button
              onClick={() => navigate(`/shop/${restaurantId}`)}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    {order.items && order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 mb-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {order.items && order.items.length > 2 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/track-order/${order.id}`)}
                      className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Track Order
                    </button>
                    {(order.status === "completed" ) && !order.review && (
                      <button
                        onClick={() => navigate(`/shop/${restaurantId}/review/${order.id}`)}
                        className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Write Review
                      </button>
                    )}
                    {order.review && (
                      <div className="flex-1 bg-green-50 border border-green-200 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700 font-semibold text-sm">Reviewed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
