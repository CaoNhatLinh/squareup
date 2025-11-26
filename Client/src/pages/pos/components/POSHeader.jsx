import { HiCash, HiRefresh } from "react-icons/hi";

export default function POSHeader({ restaurantName, onRefresh, onSearch, onQueryChange }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="inline-flex items-center gap-2"><HiCash /> Point of Sale</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">{restaurantName}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            onChange={(e) => {
              const handler = onSearch || onQueryChange;
              handler && handler(e.target.value);
            }}
            placeholder="Search items..."
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <button
            onClick={onRefresh}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="inline-flex items-center gap-2"><HiRefresh /> Refresh</span>
        </button>
        </div>
      </div>
    </div>
  );
}
