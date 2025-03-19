import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  as?: 'button' | 'link';
  to?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  as = 'button',
  to = '/',
  icon,
  iconPosition = 'left',
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    text: 'bg-transparent text-blue-600 hover:text-blue-800 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`;
  
  // Render icon with content
  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );
  
  // Render as button or link
  if (as === 'link') {
    return (
      <Link to={to} className={buttonClasses}>
        {renderContent()}
      </Link>
    );
  }
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
    >
      {renderContent()}
    </button>
  );
};

export default Button;