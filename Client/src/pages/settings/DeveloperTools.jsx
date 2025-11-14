import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { rtdb } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import {
  HiFire,
  HiCheckCircle,
  HiExclamationCircle,
  HiLightBulb,
} from "react-icons/hi2"; 
import { useParams } from "react-router-dom";

export default function DeveloperTools() {
  const { user } = useAuth();
  const { restaurant } = useRestaurant();
  const { restaurantId } = useParams();
  const [loading, setLoading] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [error, setError] = useState(null);

  const createTestOrder = async () => {
    if (!restaurantId) {
      setError("Restaurant not found. Please set up your restaurant first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const orderId = `test_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;
      const testOrder = {
        id: orderId,
        orderId: orderId,
        restaurantId: restaurantId,
        restaurantName: restaurant.name || "Test Restaurant",
        customerName: "Test Customer (Dev Tool)",
        customerEmail: user?.email || "test@example.com",
        sessionId: `test_session_${Date.now()}`,
        status: "paid",
        paymentStatus: "paid",
        amount: 25.5,
        totalAmount: 25.5,
        currency: "USD",
        guestUuid: null, // For testing guest orders
        items: [
          {
            itemId: "test-item-001",
            groupKey: "test-item-001",
            name: "Developer Test Meal",
            image: "https://via.placeholder.com/150",
            price: 20.0,
            quantity: 1,
            totalPrice: 20.0,
            discount: 0,
            selectedOptions: [{ name: "Extra Sauce", price: 1.0 }],
            specialInstruction: "Please ignore this order. Development Test.",
          },
        ],
        discount: {
          totalDiscount: 0,
          appliedDiscounts: [],
          discountBreakdown: [],
          itemDiscounts: {}
        },
        subtotal: 21.0,
        tax: 4.5,
        total: 25.5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        statusHistory: {
          paid: Date.now()
        }
      };

      const ordersRef = ref(rtdb, `restaurants/${restaurantId}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, testOrder);

      setLastOrderId(testOrder.id);
    } catch (error) {
      setError("Failed to create test order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900">
          Developer Tools
        </h1>

        <p className="text-gray-600 mb-8 border-b pb-4">
          Test and debug real-time order processing features in development
          mode.
        </p>
        <div className="bg-white rounded-xl border shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <HiFire className="w-8 h-8 text-red-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Create Full Test Order
              </h2>

              <p className="text-sm text-gray-600">
                Inserts a fully paid test order into your database.
              </p>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <HiExclamationCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
          {lastOrderId && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />

              <p className="text-green-800 font-semibold text-sm">
                Test order created successfully! ID:
                <code className="bg-green-100 px-2 py-1 rounded font-mono text-xs">
                  {lastOrderId}
                </code>
              </p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <HiLightBulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="font-semibold text-blue-900">
                Expected behavior on Orders page:
              </p>
            </div>

            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 ml-2">
              <li>🔔 Notification sound and toast alert appear</li>
              <li>🔴 "NEW" badge and item appear instantly in the list</li>
              <li>🔢 Orders sidebar badge count increases</li>
            </ul>
          </div>

          <button
            onClick={createTestOrder}
            disabled={loading || !restaurantId}
            className={`w-full px-6 py-3 rounded-xl font-bold text-white transition-colors shadow-lg ${
              loading || !restaurantId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 shadow-red-300" 
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Test Order...
              </span>
            ) : !restaurantId ? (
              "⚠️ Restaurant Not Set Up"
            ) : (
              "🔥 Create Full Test Order"
            )}
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <HiExclamationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">
                Development Warning
              </p>
              <p className="text-sm text-yellow-800">
                This tool should be removed or strictly protected in production
                environments. Test data is saved directly to your live database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
