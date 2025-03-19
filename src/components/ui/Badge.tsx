import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
  rounded?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Badge component for displaying status indicators
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  rounded = true,
  className = '',
  icon,
}) => {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-sky-100 text-sky-800',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 text-xs font-medium
        ${variantClasses[variant]} 
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;