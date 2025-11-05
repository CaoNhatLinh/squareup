import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { getOrderBySession } from "../../api/orders";
import { useShop } from "../../context/ShopContext";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { clearCart } = useShop();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    // Poll for order with retry logic
    const fetchOrder = async () => {
      try {
        const response = await getOrderBySession(sessionId);
        
        if (response.success && response.order) {
          setOrder(response.order);
          clearCart();
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        
        // If order not found yet and we haven't exceeded max retries
        if (err.response?.status === 404 && retryCount < 10) {
          // Retry after 2 seconds
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          setError(err.response?.data?.message || "Failed to retrieve order. Please contact support.");
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [searchParams, clearCart, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-semibold mb-2">Processing your payment...</p>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your order.
            {retryCount > 0 && ` (Attempt ${retryCount + 1}/10)`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/shop/${restaurantId}`)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono font-semibold text-sm">{order.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Restaurant:</span>
              <span className="font-semibold">{order.restaurantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-green-600">
                ${order.amount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/shop/${restaurantId}`)}
            className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-gray-900 px-6 py-4 rounded-xl font-bold text-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
