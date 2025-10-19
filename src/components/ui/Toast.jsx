import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'check-circle',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'x-circle',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'exclamation-triangle',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'information-circle',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
    },
  };

  const variant = variants[type] || variants.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`max-w-sm w-full ${variant.bg} ${variant.border} border rounded-lg shadow-lg p-4 ${className}`}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon name={variant.icon} size="md" color={variant.iconColor} />
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={`text-sm font-medium ${variant.titleColor}`}>
              {title}
            </p>
          )}
          {message && (
            <p className={`mt-1 text-sm ${variant.messageColor}`}>
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`${variant.iconColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md`}
            onClick={handleClose}
          >
            <Icon name="x-mark" size="sm" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      duration: 5000,
      ...toast,
    };
    
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title, message) => addToast({ type: 'success', title, message });
  const error = (title, message) => addToast({ type: 'error', title, message });
  const warning = (title, message) => addToast({ type: 'warning', title, message });
  const info = (title, message) => addToast({ type: 'info', title, message });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

export default Toast;

