import { useState } from "react";

export default function PaymentModal({ total, onClose, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const change = receivedAmount ? parseFloat(receivedAmount) - total : 0;

  const handleComplete = async () => {
    if (paymentMethod === "cash" && (!receivedAmount || change < 0)) {
      return;
    }

    setIsProcessing(true);
    try {
      await onComplete(paymentMethod);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [20, 50, 100, 200];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">Tổng tiền</div>
          <div className="text-3xl font-bold text-red-600">
            ${total.toFixed(2)}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Phương thức thanh toán
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "cash"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">💵</div>
              <div className="font-medium text-gray-900">Tiền mặt</div>
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "card"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="font-medium text-gray-900">Thẻ</div>
            </button>
          </div>
        </div>

        {/* Cash Payment Details */}
        {paymentMethod === "cash" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiền khách đưa
            </label>
            <input
              type="number"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-red-500 focus:border-transparent"
              step="0.01"
            />

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setReceivedAmount(amount.toString())}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Change */}
            {receivedAmount && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiền thừa:</span>
                  <span
                    className={`text-lg font-bold ${
                      change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleComplete}
            disabled={
              isProcessing ||
              (paymentMethod === "cash" && (!receivedAmount || change < 0))
            }
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Đang xử lý..." : "Hoàn tất"}
          </button>
        </div>
      </div>
    </div>
  );
}
