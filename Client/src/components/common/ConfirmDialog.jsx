import React from 'react';

export default function ConfirmDialog({ open, title = 'Confirm', message = '', onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
