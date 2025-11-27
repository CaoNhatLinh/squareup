import Modal from '@/components/ui/Modal';

export default function ConfirmDialog({ open, title = 'Confirm', message = '', onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  return (
    <Modal.Confirm
      isOpen={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmLabel}
      cancelText={cancelLabel}
    />
  );
}
