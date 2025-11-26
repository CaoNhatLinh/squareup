import { createContext, useCallback, useState } from "react";
import Toast from "@/components/Toast";


export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  const addToast = useCallback((message, type = "info", duration = 3000, onClick = null) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration, onClick };
    
    setToasts((prev) => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message, duration, onClick) => addToast(message, "success", duration, onClick), [addToast]);
  const error = useCallback((message, duration, onClick) => addToast(message, "error", duration, onClick), [addToast]);
  const warning = useCallback((message, duration, onClick) => addToast(message, "warning", duration, onClick), [addToast]);
  const info = useCallback((message, duration, onClick) => addToast(message, "info", duration, onClick), [addToast]);
  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClick={toast.onClick}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
