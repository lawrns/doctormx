import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fluid';
  padding?: boolean;
  center?: boolean;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  padding = true,
  center = true,
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    fluid: 'max-w-full',
  };

  const classes = [
    'w-full',
    sizeClasses[size],
    padding ? 'px-4 sm:px-6 md:px-8' : '',
    center ? 'mx-auto' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Container;