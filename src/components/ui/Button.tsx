import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes with improved focus states and transitions
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-all duration-300 ease-in-out relative overflow-hidden';
  
  // Size classes with improved spacing and typography
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Variant classes with enhanced visual states and animations
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow transform hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 shadow-sm hover:shadow transform hover:-translate-y-0.5 active:translate-y-0',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:border-primary-500 hover:text-primary-600',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-primary-600',
    link: 'bg-transparent text-primary-500 hover:text-primary-600 hover:underline hover:bg-transparent p-0 h-auto focus:ring-0',
    danger: 'bg-feedback-error hover:bg-red-600 active:bg-red-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm hover:shadow transform hover:-translate-y-0.5 active:translate-y-0',
  };
  
  // Disabled classes with improved visual feedback
  const disabledClasses = 'opacity-60 cursor-not-allowed transform-none shadow-none';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled || loading ? disabledClasses : ''}
    ${widthClasses}
    ${className}
  `;
  
  return (
    <button 
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        iconPosition === 'left' && icon && <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && iconPosition === 'right' && icon && <span className="ml-2">{icon}</span>}
      
      {/* Add subtle ripple effect on click */}
      <span className="absolute inset-0 pointer-events-none bg-white opacity-0 group-active:opacity-20 rounded-md transform scale-0 group-active:scale-100 transition-all duration-300"></span>
    </button>
  );
};

export default Button;
