import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'feature';
  color?: 'default' | 'primary' | 'secondary';
  withHover?: boolean;
  animate?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  color = 'default',
  withHover = false,
  animate = false,
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-gray-200',
    outline: 'bg-white border-2',
    elevated: 'bg-white shadow-md',
    feature: 'bg-white shadow-card',
  };

  const colorStyles = {
    default: 'border-gray-200',
    primary: 'border-brand-jade-500',
    secondary: 'border-brand-sun-500',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  const hoverStyles = withHover
    ? 'hover:shadow-card-hover hover:-translate-y-1'
    : '';

  const cardStyles = `${baseStyles} ${variantStyles[variant]} ${
    variant === 'outline' ? colorStyles[color] : ''
  } ${paddingStyles[padding]} ${hoverStyles} ${className}`;

  return animate ? (
    <motion.div
      className={cardStyles}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={withHover ? { y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' } : {}}
      {...props}
    >
      {children}
    </motion.div>
  ) : (
    <div className={cardStyles} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-xl font-heading font-bold text-brand-charcoal ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`mt-4 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;