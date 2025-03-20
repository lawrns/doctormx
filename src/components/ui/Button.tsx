import React from 'react';
import { Link } from 'react-router-dom';

// Define the types of buttons
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Define the common props for all button types
interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  rounded?: boolean;
}

// Props for button element
interface ButtonElementProps extends BaseButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  to?: never;
}

// Props for Link component
interface LinkButtonProps extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  as: 'link';
  to: string;
}

// Combined type for the Button component
type ButtonProps = ButtonElementProps | LinkButtonProps;

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  loading = false,
  rounded = false,
  as = 'button',
  ...props
}) => {
  // Style maps for different button variants
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
    text: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  // Style maps for different button sizes
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-lg px-6 py-3',
  };

  // Compute the final class name
  const buttonClassName = `
    inline-flex items-center justify-center
    ${fullWidth ? 'w-full' : ''}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  // Loading spinner element
  const loadingSpinner = (
    <svg 
      className={`animate-spin -ml-1 mr-2 h-4 w-4 ${variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-gray-700'}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  );

  // Content of the button
  const buttonContent = (
    <>
      {loading && loadingSpinner}
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {props.children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  // Render either a button or a Link component
  if (as === 'link') {
    const { to, children, ...linkProps } = props as LinkButtonProps;
    return (
      <Link
        to={to}
        className={buttonClassName}
        {...linkProps}
      >
        {buttonContent}
      </Link>
    );
  }

  const { children, ...buttonProps } = props as ButtonElementProps;
  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {buttonContent}
    </button>
  );
};

export default Button;