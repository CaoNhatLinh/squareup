import { useState, useEffect } from "react";
import { getAllOrders } from "../../api/orders";
import { useNavigate } from "react-router-dom";
import { BsEye } from "react-icons/bs";

// Hàm chuyển đổi màu sắc trạng thái (Tái sử dụng)
const getStatusClasses = (status) => {
  if (status === "paid") return "bg-green-100 text-green-800";
  if (status === "processing") return "bg-blue-100 text-blue-800"; // Blue cho Processing (tương tự New/Active)
  return "bg-gray-100 text-gray-800";
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, paid, processing
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // ... (Giữ nguyên logic fetchOrders)
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (order.amount || 0),
    0
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Management
        </h1>
        <p className="text-gray-600">
          Track, filter, and manage all paid orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-semibold text-blue-600 mb-1">
            Total Orders
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            {filteredOrders.length}
          </div>
        </div>
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-semibold text-green-600 mb-1">
            Total Revenue
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-semibold text-yellow-600 mb-1">
            Average Order
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            $
            {filteredOrders.length > 0
              ? (totalRevenue / filteredOrders.length).toFixed(2)
              : "0.00"}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-semibold text-purple-600 mb-1">
            Paid Orders
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            {orders.filter((o) => o.status === "paid").length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "paid"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter("processing")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "processing"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Processing
            </button>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Tải lại
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      <div className="text-sm font-mono font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {order.id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.restaurantName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customerName || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customerEmail || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ${order.amount?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {order.currency || "USD"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${getStatusClasses(
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
                      <button
                        onClick={() => {
                          openOrderDetails(order.id);
                        }}
                       className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                        aria-label={`View details for order ${order.id?.substring(0, 8)}`}>
                        <BsEye size={16} className="mr-1" />
                        <span>View</span>
                      </button>
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
