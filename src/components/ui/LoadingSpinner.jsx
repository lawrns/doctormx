import React from 'react';
import Icon from './Icon';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };
  
  const sizeClasses = sizes[size] || sizes.md;
  const colorClasses = colors[color] || colors.primary;
  
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <Icon 
        name="clock" 
        size={size} 
        className={`animate-spin ${colorClasses}`} 
      />
      {text && (
        <span className={`ml-2 text-sm ${colorClasses}`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Convenience components for common loading states
export const PageLoader = ({ text = 'Cargando...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  </div>
);

export const ButtonLoader = ({ text }) => (
  <LoadingSpinner size="sm" text={text} />
);

export const InlineLoader = ({ text }) => (
  <LoadingSpinner size="sm" text={text} />
);

export default LoadingSpinner;

