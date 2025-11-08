import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowUturnLeft, HiXCircle } from "react-icons/hi2";
export default function CheckoutCancelled() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiXCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-8 text-base">
          Your payment was cancelled or failed. Your cart items are safe and
          ready to be checked out again.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/shop/${restaurantId}`)}
            className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <HiOutlineArrowUturnLeft className="w-6 h-6" />
            Return to Menu
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-gray-800 px-6 py-4 rounded-xl font-bold text-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors shadow-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
