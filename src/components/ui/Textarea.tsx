import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  error,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Base classes
  const baseClasses = 'block w-full rounded-md shadow-sm transition duration-150 ease-in-out';
  
  // State classes
  const stateClasses = {
    normal: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900',
    disabled: 'bg-gray-100 cursor-not-allowed text-gray-500',
  };
  
  const combinedClasses = `
    ${baseClasses}
    ${error ? stateClasses.error : stateClasses.normal}
    ${disabled ? stateClasses.disabled : ''}
    ${className}
  `;
  
  return (
    <div>
      <textarea 
        className={combinedClasses}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;