import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  error,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}, ref) => {
  // Base classes
  const baseClasses = 'w-full rounded-md shadow-sm transition duration-150 ease-in-out';
  
  // State classes
  const stateClasses = {
    normal: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900',
    disabled: 'bg-gray-100 cursor-not-allowed text-gray-500',
  };
  
  // Icon padding
  const iconPaddingClasses = {
    left: 'pl-10',
    right: 'pr-10',
  };
  
  const combinedClasses = `
    ${baseClasses}
    ${error ? stateClasses.error : stateClasses.normal}
    ${disabled ? stateClasses.disabled : ''}
    ${icon ? iconPaddingClasses[iconPosition] : ''}
    ${className}
  `;
  
  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      
      <input 
        className={combinedClasses}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      
      {icon && iconPosition === 'right' && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;