/**
 * Unified UI Components for DoctorMX
 * Standardized components following the unified design system
 */

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// Types
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

interface CardProps extends BaseProps {
  variant?: 'default' | 'medical' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Button Component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-sm hover:shadow-md',
      outline: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-500',
      ghost: 'text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-500',
      danger: 'bg-semantic-error text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-sm min-h-[44px]', // Accessibility touch target
      lg: 'px-6 py-4 text-base min-h-[48px]'
    };
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Input Component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const inputClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 font-sans min-h-[44px] 
      ${leftIcon ? 'pl-10' : ''} 
      ${rightIcon ? 'pr-10' : ''}
      ${error 
        ? 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error' 
        : 'border-border-light focus:border-border-focus focus:ring-border-focus'
      } 
      bg-background-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 
      placeholder:text-text-tertiary disabled:opacity-50 disabled:cursor-not-allowed`;
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputClasses} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-semantic-error">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-text-tertiary">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Select Component
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, className = '', ...props }, ref) => {
    const selectClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 font-sans min-h-[44px]
      ${error 
        ? 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error' 
        : 'border-border-light focus:border-border-focus focus:ring-border-focus'
      } 
      bg-background-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 
      disabled:opacity-50 disabled:cursor-not-allowed`;
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`${selectClasses} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-semantic-error">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-text-tertiary">{helper}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Textarea Component
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className = '', ...props }, ref) => {
    const textareaClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 font-sans resize-vertical
      ${error 
        ? 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error' 
        : 'border-border-light focus:border-border-focus focus:ring-border-focus'
      } 
      bg-background-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 
      placeholder:text-text-tertiary disabled:opacity-50 disabled:cursor-not-allowed`;
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${textareaClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-semantic-error">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-text-tertiary">{helper}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Card Component
export const Card = ({ 
  variant = 'default', 
  padding = 'md', 
  children, 
  className = '', 
  ...props 
}: CardProps) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-background-primary shadow-card hover:shadow-cardHover',
    medical: 'bg-background-primary shadow-card border-l-4 border-primary-500 hover:shadow-cardHover',
    elevated: 'bg-background-primary shadow-lg hover:shadow-xl'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge Component
interface BadgeProps extends BaseProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'medical';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = ({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    medical: 'bg-primary-50 text-primary-700'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Loading Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]} ${className}`} />
  );
};

// Alert Component
interface AlertProps extends BaseProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export const Alert = ({ 
  variant = 'info', 
  title, 
  children, 
  onClose, 
  className = '', 
  ...props 
}: AlertProps) => {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-current hover:opacity-70 transition-opacity"
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Badge,
  Spinner,
  Alert
};