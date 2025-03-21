import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3 className={`text-lg font-medium leading-6 text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export default CardTitle;