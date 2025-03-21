import React, { useId } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className = '',
}) => {
  const id = useId();
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'h-4 w-8',
      circle: 'h-3 w-3',
      translate: 'translate-x-4',
    },
    md: {
      container: 'h-6 w-11',
      circle: 'h-5 w-5',
      translate: 'translate-x-5',
    },
    lg: {
      container: 'h-7 w-14',
      circle: 'h-6 w-6',
      translate: 'translate-x-7',
    },
  };
  
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 ${sizeClasses[size].container} border-2 border-transparent rounded-full cursor-pointer
          transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleClick}
        id={id}
      >
        <span
          className={`
            ${checked ? sizeClasses[size].translate : 'translate-x-0'}
            pointer-events-none inline-block ${sizeClasses[size].circle} rounded-full bg-white shadow
            transform ring-0 transition ease-in-out duration-200
          `}
        />
      </button>
      
      {label && (
        <label htmlFor={id} className={`ml-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Switch;