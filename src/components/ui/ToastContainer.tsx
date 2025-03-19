import React, { useState, useCallback, createContext, useContext } from 'react';
import Toast, { ToastProps } from './Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
}

interface ToastItem extends ToastProps {
  id: string;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: options?.type || 'info',
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
        onClose: () => {
          setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        },
      },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastContext;