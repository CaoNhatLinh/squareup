import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import useAppStore from '@/store/useAppStore';
import { Button } from '@/components/ui';
import { getOrderBySession } from "@/api/orders";
import { useShop } from "@/context/ShopContext.jsx";
import { useToast } from "@/hooks/useToast";
import { HiCheckCircle, HiXCircle, HiOutlineDocumentDuplicate, HiOutlineShoppingBag, HiOutlineMagnifyingGlass } from "react-icons/hi2";
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();
  const restaurantId = useAppStore(s => s.restaurantId);
  const { clearCart, restaurant } = useShop();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const displayOrderId = order?.id || '---';

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await getOrderBySession(sessionId, restaurantId);
        if (response.order) {
          setOrder(response.order);
          clearCart();
          localStorage.setItem('lastOrderId', response.order.id);
          try {
            const lastShown = localStorage.getItem('checkoutSuccessToastOrderId');
            if (lastShown !== response.order.id) {
              localStorage.setItem('checkoutSuccessToastOrderId', response.order.id);
              success("Order confirmed! Payment processed successfully.");
            }
          } catch {
            success("Order confirmed! Payment processed successfully.");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching order:", err);

        if (err.response?.status === 404 && retryCount < 10) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          const errorMessage = err.response?.data?.message || "Failed to retrieve order. Please contact support.";
          setError(errorMessage);
          showError(errorMessage);
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [searchParams, clearCart, retryCount, restaurantId, success, showError]);
  const trackUrl = `/${slug || restaurant?.slug || ''}/order/track-order/${displayOrderId}`;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <div className="relative flex items-center justify-center mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
            <HiOutlineShoppingBag className="absolute text-red-500 w-8 h-8" />
          </div>
          <p className="text-xl text-gray-800 font-semibold mb-3">Processing your order...</p>
          <p className="text-sm text-gray-500">
            We're confirming your payment and preparing your order details.
            {retryCount > 0 && ` (Attempt ${retryCount + 1}/10)`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiXCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => navigate(`/${slug || restaurant?.slug || ''}/order`)} variant="primary" className="w-full px-6 py-3">Back to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiCheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8 text-base">
          Your payment has been processed successfully. Your order is now being prepared.
        </p>
        {order && (
          <div className="bg-gray-50 rounded-lg p-5 mb-8 text-left border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-3">
              <div>
                <span className="text-gray-600 font-semibold text-xs uppercase block mb-1">Order ID</span>
                <span className="font-mono text-xl font-bold text-gray-900 break-all">{order.id}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(order.id);
                    success("Order ID copied to clipboard");
                  } catch {
                    showError("Failed to copy Order ID");
                  }
                }}
                className="px-3 py-2 bg-white border border-gray-400 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-1"
              >
                <HiOutlineDocumentDuplicate className="w-4 h-4" /> Copy ID
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="font-extrabold text-2xl text-green-600">
                  ${order.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Ordered From:</span>
                <span className="font-semibold text-gray-800">{order.restaurantName}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2">
            <Button variant="primary" className="w-full px-6 py-3 flex items-center justify-center gap-2">
              <HiOutlineMagnifyingGlass className="w-6 h-6" />
              Track Your Order
            </Button>
          </a>
          <Button onClick={() => navigate(`/${slug || restaurant?.slug || ''}/order`)} variant="outline" className="w-full flex items-center justify-center gap-2">
            <HiOutlineShoppingBag className="inline-block w-6 h-6 mr-2 -mt-1" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}