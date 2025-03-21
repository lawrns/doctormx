import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastContextProps {
  showToast: (props: ShowToastProps) => void;
  hideToast: () => void;
}

interface ShowToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [toastProps, setToastProps] = useState<ShowToastProps>({
    title: '',
    description: '',
    variant: 'default',
    duration: 5000,
    position: 'top-right',
  });

  const showToast = useCallback((props: ShowToastProps) => {
    setToastProps(props);
    setOpen(true);
  }, []);

  const hideToast = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        open={open}
        setOpen={setOpen}
        title={toastProps.title}
        description={toastProps.description}
        variant={toastProps.variant}
        duration={toastProps.duration}
        position={toastProps.position}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;