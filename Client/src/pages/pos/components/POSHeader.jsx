export default function POSHeader({ restaurantName, onRefresh }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            💳 Point of Sale
          </h1>
          <p className="text-sm text-gray-600 mt-1">{restaurantName}</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>
    </div>
  );
}
