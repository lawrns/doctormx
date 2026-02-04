import { toast as toastify } from 'react-toastify';

// Configuración simplificada para los toasts
const toastConfig = {
  className: 'custom-toast',
  bodyClassName: 'custom-toast-body',
  progressClassName: 'custom-toast-progress'
};

// Toast de éxito
const success = (message) => {
  toastify.success(message, {
    ...toastConfig,
    style: {
      background: '#10B981',
      color: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.04)'
    }
  });
};

// Toast de error
const error = (message) => {
  toastify.error(message, {
    ...toastConfig,
    style: {
      background: '#EF4444',
      color: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25), 0 10px 10px -5px rgba(239, 68, 68, 0.04)'
    }
  });
};

// Toast de advertencia
const warning = (message) => {
  toastify.warning(message, {
    ...toastConfig,
    style: {
      background: '#F59E0B',
      color: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
      boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 10px 10px -5px rgba(245, 158, 11, 0.04)'
    }
  });
};

// Toast de información
const info = (message) => {
  toastify.info(message, {
    ...toastConfig,
    style: {
      background: '#3B82F6',
      color: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.04)'
    }
  });
};

// Export as toast object with methods
export const toast = {
  success,
  error,
  warning,
  info
};

// Also export individual functions for backward compatibility
export const showSuccessToast = success;
export const showErrorToast = error;
export const showWarningToast = warning;
export const showInfoToast = info;

// Default export
export default toast;