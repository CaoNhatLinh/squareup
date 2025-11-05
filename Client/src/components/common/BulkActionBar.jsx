import React from 'react';

export default function BulkActionBar({ 
  selectedCount, 
  onDelete, 
  onCancel,
  position = 'bottom' // 'top' or 'bottom'
}) {
  if (selectedCount === 0) return null;

  return (
    <div className={`${position === 'bottom' ? 'fixed bottom-0 left-0 md:left-64 right-0' : 'mb-4'} bg-blue-600 text-white shadow-lg z-50`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-medium">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-3">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium bg-white text-red-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            Delete selected
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
