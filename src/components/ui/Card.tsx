import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  // Base classes with card-container for targeting
  const baseClasses = 'rounded-lg overflow-hidden card-container';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white shadow',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
  };
  
  // Padding classes with responsive adjustments
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 md:p-5',
    lg: 'p-4 sm:p-5 md:p-6',
  };
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${className}
  `;
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;