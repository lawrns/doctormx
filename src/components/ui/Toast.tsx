import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  open,
  setOpen,
  title,
  description,
  variant = 'default',
  duration = 5000,
  position = 'top-right',
  onClose,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Handle auto-closing
  useEffect(() => {
    if (open && duration !== Infinity) {
      const timer = setTimeout(() => {
        setOpen(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, setOpen, onClose]);

  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  // Variant styles
  const variantStyles: Record<ToastVariant, string> = {
    default: 'bg-white border-gray-200',
    success: 'bg-white border-green-500',
    error: 'bg-white border-red-500',
    warning: 'bg-white border-yellow-500',
    info: 'bg-white border-blue-500',
  };

  // Icon by variant
  const iconByVariant = {
    default: null,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  // Position styles
  const positionStyles: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  // Animation styles based on position
  const getAnimationStyle = (pos: ToastPosition) => {
    if (pos.includes('right')) return open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';
    if (pos.includes('left')) return open ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0';
    if (pos.includes('top')) return open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0';
    return open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0';
  };

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed ${positionStyles[position]} z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`
          ${variantStyles[variant]} 
          border-l-4 rounded-md shadow-lg
          transform transition-all duration-300 ease-in-out
          ${getAnimationStyle(position)}
          max-w-sm w-full flex items-start p-4
          backdrop-blur-sm bg-white/95
        `}
      >
        {iconByVariant[variant] && <div className="flex-shrink-0 mr-3">{iconByVariant[variant]}</div>}
        <div className="flex-1 min-w-0 mr-2">
          {title && <h4 className="text-sm font-medium text-gray-900">{title}</h4>}
          {description && <div className="mt-1 text-sm text-gray-500">{description}</div>}
        </div>
        <button
          type="button"
          className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          onClick={handleClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;