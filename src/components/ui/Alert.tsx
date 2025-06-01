import React from 'react';
import { AlertCircle, Info, Check, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
  icon?: React.ReactNode;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  className = '',
  icon,
  onDismiss,
}) => {
  const variantStyles = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const defaultIcons = {
    default: <Info className="h-5 w-5 text-gray-400" />,
    success: <Check className="h-5 w-5 text-green-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const iconToRender = icon || defaultIcons[variant];

  return (
    <div className={`p-4 border rounded-md shadow-sm ${variantStyles[variant]} ${className} transition-all duration-300 animate-in fade-in-50`}>
      <div className="flex">
        <div className="flex-shrink-0">{iconToRender}</div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium">{children}</div>
        </div>
        {onDismiss && (
          <div>
            <button
              type="button"
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              onClick={onDismiss}
            >
              <span className="sr-only">Descartar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ children, className = '' }) => {
  return <h3 className={`text-sm font-medium ${className}`}>{children}</h3>;
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => {
  return <div className={`mt-2 text-sm ${className}`}>{children}</div>;
};