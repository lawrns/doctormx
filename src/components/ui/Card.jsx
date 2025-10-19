import React from 'react';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  
  const variants = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border-2',
    filled: 'bg-gray-50',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  const variantClasses = variants[variant] || variants.default;
  const paddingClasses = paddings[padding] || paddings.md;
  const shadowClasses = shadows[shadow] || shadows.md;
  
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${shadowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card sub-components
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

// Export sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;

