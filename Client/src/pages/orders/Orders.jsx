import { useState, useEffect, useCallback } from "react";
import { getRestaurantOrders, updateOrderStatus } from "../../api/orders";
import { useNavigate, useLoaderData, useParams } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { HiCheck } from "react-icons/hi2";
import { HiRefresh } from "react-icons/hi";
import { useOrderNotification } from "../../hooks/useOrderNotification";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../firebase";

const getStatusClasses = (status) => {
  if (status === "paid" || status === "pending")
    return "bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold";
  if (status === "accepted")
    return "bg-blue-100 text-blue-800 border border-blue-300 font-semibold";
  if (status === "preparing")
    return "bg-purple-100 text-purple-800 border border-purple-300 font-semibold";
  if (status === "ready")
    return "bg-green-100 text-green-800 border border-green-300 font-semibold";
  if (status === "completed")
    return "bg-gray-200 text-gray-700 border border-gray-300";
  if (status === "cancelled")
    return "bg-red-100 text-red-800 border border-red-300";
  return "bg-gray-100 text-gray-800";
};

export default function Orders() {
  useLoaderData();
  const { restaurantId } = useParams();
  const { isNewOrder, newOrderIds, markAllAsRead } = useOrderNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) {
      setError("Restaurant not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getRestaurantOrders(restaurantId);
      setOrders(response.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
    }
  }, [restaurantId, fetchOrders]);

  useEffect(() => {
    if (!restaurantId) return;

    const ordersRef = ref(rtdb, `restaurants/${restaurantId}/orders`);

    const handleOrdersUpdate = (snapshot) => {
      if (!snapshot.exists()) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersData = snapshot.val();
      const ordersArray = Object.entries(ordersData).map(([id, data]) => ({
        id,
        ...data,
      }));
      const sortedOrders = ordersArray.sort(
        (a, b) => b.createdAt - a.createdAt
      );
      setOrders(sortedOrders);
      setLoading(false);
    };

    const unsubscribe = onValue(ordersRef, handleOrdersUpdate, (error) => {
      console.error("❌ Firebase orders listener error:", error);
      setError("Failed to load orders in real-time: " + error.message);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [restaurantId]);

  const openOrderDetails = (orderId) => {
    navigate(`/${restaurantId}/orders/${orderId}`);
  };

  const handleAcceptOrder = async (orderId, e) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(restaurantId, orderId, "accepted");
    } catch (err) {
      console.error("Error accepting order:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return order.status === "paid" || order.status === "pending";
    return order.status === filter;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.status === "ready")
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Order Management
            </h1>

            {newOrderIds.length > 0 && (
              <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full animate-pulse">
                {newOrderIds.length} New Orders
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>

          <p className="text-gray-600 mt-2">
            Track, filter, and manage all paid orders in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-red-600">
          <div className="text-sm font-semibold text-red-600 mb-1">
            Total Orders
          </div>

          <div className="text-4xl font-extrabold text-gray-900">
            {orders.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-600">
          <div className="text-sm font-semibold text-green-600 mb-1">
            Total Revenue
          </div>

          <div className="text-4xl font-extrabold text-gray-900">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
        <div
          className={`bg-white rounded-xl shadow-md p-5 border-t-4 ${
            newOrderIds.length > 0 ? "border-yellow-600" : "border-gray-400"
          }`}
        >
          <div className="text-sm font-semibold text-yellow-600 mb-1">
            Pending Orders
          </div>

          <div className="text-4xl font-extrabold text-gray-900">
            {
              orders.filter(
                (o) => o.status === "paid" || o.status === "pending"
              ).length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-semibold text-purple-600 mb-1">
            Completed Today
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            {orders.filter((o) => o.status === "completed").length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm font-semibold text-gray-700 mr-1">
              Filter by:
            </span>

            {[
              "pending",
              "accepted",
              "preparing",
              "ready",
              "completed",
              "all",
            ].map((status) => {
              const isActive = filter === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm
           ${
             isActive
               ? "bg-red-600 text-white shadow-md"
               : "bg-gray-100 text-gray-700 hover:bg-gray-200"
           }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              disabled={newOrderIds.length === 0}
              className={` px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm
       ${
         newOrderIds.length > 0
           ? "bg-red-600 text-white hover:bg-red-700"
           : "bg-gray-300 text-gray-500 cursor-not-allowed"
       }`}
            >
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Mark all as read
            </button>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiRefresh
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500 min-h-[400px] flex items-center justify-center">
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>

              <p className="text-lg font-medium text-gray-900 mb-1">
                No orders found
              </p>

              <p className="text-sm text-gray-500">
                Orders will appear here when customers make purchases
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrderDetails(order.id)}
                    className={`transition-colors cursor-pointer ${
                      isNewOrder(order.id)
                        ? "bg-red-50/70 border-l-4 border-red-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-bold text-gray-900">
                          {order.id?.substring(0, 8)}
                          ...
                        </div>

                        {isNewOrder(order.id) && (
                          <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName || "Guest"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {order.customerEmail || order.customerPhone || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-extrabold text-green-600">
                        ${order.amount?.toFixed(2) || "0.00"}
                      </div>

                      <div className="text-xs text-gray-500 uppercase">
                        {order.currency || "USD"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusClasses(
                          order.status
                        )}`}
                      >
                        {order.status || "unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(order.status === "paid" ||
                          order.status === "pending") && (
                          <button
                            onClick={(e) => handleAcceptOrder(order.id, e)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            aria-label={`Accept order ${order.id?.substring(
                              0,
                              8
                            )}`}
                          >
                            <HiCheck size={16} className="mr-1" />
                            <span>Accept</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order.id);
                          }}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
                          aria-label={`View details for order ${order.id?.substring(
                            0,
                            8
                          )}`}
                        >
                          <BsEye size={16} className="mr-1" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
