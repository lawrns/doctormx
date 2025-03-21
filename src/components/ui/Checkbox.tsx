import React, { forwardRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    helperText, 
    error, 
    className = '', 
    containerClassName = '',
    labelClassName = '',
    id,
    ...rest 
  }, ref) => {
    // Generate a unique ID if none is provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={`${containerClassName}`}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={`
                h-4 w-4 
                text-blue-600 
                border-gray-300 
                rounded 
                focus:ring-blue-500
                focus:ring-offset-0
                appearance-auto
                ${error ? 'border-red-500' : ''}
                ${className}
              `}
              style={{
                // Ensure consistent appearance
                WebkitAppearance: 'checkbox',
                MozAppearance: 'checkbox',
                appearance: 'checkbox'
              }}
              aria-invalid={!!error}
              aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
              {...rest}
            />
          </div>
          {label && (
            <div className="ml-2 text-sm">
              <label 
                htmlFor={checkboxId} 
                className={`font-medium text-gray-700 ${labelClassName}`}
              >
                {label}
              </label>
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-500 ml-6">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="mt-1 text-sm text-gray-500 ml-6">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;