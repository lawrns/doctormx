import React, { forwardRef } from 'react';
import { ChevronDown } from '../icons/IconProvider';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    options, 
    label, 
    helperText, 
    error, 
    className = '', 
    fullWidth = false, 
    size = 'md',
    leftIcon,
    containerClassName = '',
    id,
    ...rest 
  }, ref) => {
    // Generate a unique ID if none is provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    // Size styles
    const sizeStyles = {
      sm: 'py-1 text-sm',
      md: 'py-2',
      lg: 'py-2.5 text-lg',
    };
    
    // Base select styles
    const selectStyles = `
      block
      px-4
      ${sizeStyles[size]}
      appearance-none
      bg-white
      border
      rounded-lg
      focus:outline-none
      focus:ring-2
      transition-colors
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
      ${leftIcon ? 'pl-10' : ''}
      ${fullWidth ? 'w-full' : 'w-auto'}
      pr-10
      ${className}
    `.trim();

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="block mb-1.5 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <select
            ref={ref}
            id={selectId}
            className={selectStyles}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...rest}
          >
            {options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <ChevronDown size={18} />
          </div>
        </div>
        
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-500">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;