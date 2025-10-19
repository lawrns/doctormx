import React from 'react';
import Icon from './Icon';

const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'check-circle',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'x-circle',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'exclamation-triangle',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'information-circle',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
  };

  const variantStyles = variants[variant] || variants.info;
  const iconName = icon || variantStyles.icon;

  return (
    <div
      className={`rounded-lg border p-4 ${variantStyles.bg} ${variantStyles.border} ${className}`}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon name={iconName} size="md" color={variantStyles.iconColor} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${variantStyles.titleColor}`}>
              {title}
            </h3>
          )}
          <div className={`mt-1 text-sm ${variantStyles.textColor}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${variantStyles.iconColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                onClick={onDismiss}
              >
                <Icon name="x-mark" size="sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Convenience components for common alert types
export const SuccessAlert = (props) => <Alert variant="success" {...props} />;
export const ErrorAlert = (props) => <Alert variant="error" {...props} />;
export const WarningAlert = (props) => <Alert variant="warning" {...props} />;
export const InfoAlert = (props) => <Alert variant="info" {...props} />;

export default Alert;

