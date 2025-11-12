import React from "react";

export default function RemoveItemModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Remove Item?
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove this item from your cart?
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors"
              >
                Keep Item
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors"
              >
                Remove
              </button> 
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
