import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  as?: React.ElementType;
}

/**
 * Container component for consistent layout widths
 */
const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  padding = true,
  as: Component = 'div',
}) => {
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const containerClasses = `
    mx-auto
    w-full
    ${maxWidthClasses[maxWidth]}
    ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
    ${className}
  `;

  return <Component className={containerClasses}>{children}</Component>;
};

export default Container;