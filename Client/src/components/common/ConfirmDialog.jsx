import { Button } from '@/components/ui';

export default function ConfirmDialog({ open, title = 'Confirm', message = '', onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel} className="px-4 py-2">{cancelLabel}</Button>
          <Button variant="destructive" onClick={onConfirm} className="px-4 py-2">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
