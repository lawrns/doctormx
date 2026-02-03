import React from 'react';
import Icon from './Icon';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-teal-100 text-teal-800',
    medical: 'bg-blue-50 text-blue-700 border border-blue-200',
    verified: 'bg-green-50 text-green-700 border border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
  };
  
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const iconSizes = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  };
  
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || 'sm';
  
  const iconElement = icon ? <Icon name={icon} size={iconSize} /> : null;
  
  return (
    <span
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={children ? 'mr-1' : ''}>
          {iconElement}
        </span>
      )}
      
      {children && <span>{children}</span>}
      
      {iconElement && iconPosition === 'right' && (
        <span className={children ? 'ml-1' : ''}>
          {iconElement}
        </span>
      )}
    </span>
  );
};

// Convenience components for common badge variants
export const PrimaryBadge = (props) => <Badge variant="primary" {...props} />;
export const SuccessBadge = (props) => <Badge variant="success" {...props} />;
export const WarningBadge = (props) => <Badge variant="warning" {...props} />;
export const ErrorBadge = (props) => <Badge variant="error" {...props} />;
export const InfoBadge = (props) => <Badge variant="info" {...props} />;
export const MedicalBadge = (props) => <Badge variant="medical" {...props} />;
export const VerifiedBadge = (props) => <Badge variant="verified" icon="check-circle" {...props} />;
export const PendingBadge = (props) => <Badge variant="pending" icon="clock" {...props} />;
export const RejectedBadge = (props) => <Badge variant="rejected" icon="x-circle" {...props} />;

export default Badge;

