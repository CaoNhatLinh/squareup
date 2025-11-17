export default function Cart({
  cart,
  onUpdateQuantity,
  onRemove,
  onClear,
  total,
  customerInfo,
  onCustomerInfoChange,
  onCheckout,
}) {
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Đơn hàng</h2>
          {cart.length > 0 && (
            <button
              onClick={onClear}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Tên khách hàng (tùy chọn)"
            value={customerInfo.name}
            onChange={(e) =>
              onCustomerInfoChange({ ...customerInfo, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder="Số điện thoại (tùy chọn)"
            value={customerInfo.phone}
            onChange={(e) =>
              onCustomerInfoChange({ ...customerInfo, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              className="w-16 h-16 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-sm">Chưa có món nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {item.name}
                    </h4>
                    {item.selectedOptions.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
                        {item.selectedOptions.map((opt, idx) => (
                          <div key={idx}>
                            + {opt.name} ${opt.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          $
                          {(
                            (item.price + item.modifierTotal) *
                            item.quantity
                          ).toFixed(2)}
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
            <span className="text-2xl font-bold text-red-600">
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </>
  );
}
