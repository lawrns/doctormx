import React, { forwardRef } from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  label?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  as?: 'input' | 'textarea';
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      id,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      error,
      label,
      fullWidth = false,
      disabled = false,
      required = false,
      autoComplete,
      className = '',
      icon,
      iconPosition = 'left',
      as = 'input',
      rows = 3,
      maxLength,
      min,
      max,
      ...rest
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      'block border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Error classes
    const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
    
    // Disabled classes
    const disabledClasses = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
    
    // Icon padding classes
    const iconPaddingClasses = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';
    
    // Combine all classes
    const inputClasses = `${baseClasses} ${widthClasses} ${errorClasses} ${disabledClasses} ${iconPaddingClasses} ${className}`;
    
    // Input ID
    const inputId = id || name;
    
    const renderInput = () => {
      const commonProps = {
        id: inputId,
        name,
        placeholder,
        value,
        disabled,
        required,
        autoComplete,
        onChange,
        onBlur,
        onFocus,
        className: inputClasses,
        maxLength,
        ...rest,
      };
      
      if (as === 'textarea') {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            {...commonProps}
          />
        );
      }
      
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          min={min}
          max={max}
          {...commonProps}
        />
      );
    };
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          
          {renderInput()}
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;