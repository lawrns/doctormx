import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  onClick?: () => void;
}

/**
 * Card component for content containers
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  bordered = false,
  shadow = 'sm',
  as: Component = 'div',
  onClick,
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  const cardClasses = `
    bg-white
    rounded-lg
    overflow-hidden
    ${bordered ? 'border border-gray-200' : ''}
    ${shadowClasses[shadow]}
    ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <Component className={cardClasses} onClick={onClick}>
      {children}
    </Component>
  );
};

// Card subcomponents
const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Title = CardTitle;

export { CardHeader, CardContent, CardFooter, CardTitle };
export default Card;