import React, { type ReactNode, forwardRef, type ComponentPropsWithoutRef } from 'react';
import Icon from './Icon';
import { Slot } from '@radix-ui/react-slot';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary'
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'destructive'
  | 'info' 
  | 'medical' 
  | 'verified' 
  | 'pending' 
  | 'rejected'
  | 'outline';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';

interface BadgeProps extends Omit<ComponentPropsWithoutRef<'span'>, 'size'> {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  iconPosition?: IconPosition;
  className?: string;
  asChild?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  asChild,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'span';
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    destructive: 'bg-red-100 text-red-800',
    info: 'bg-teal-100 text-teal-800',
    medical: 'bg-blue-50 text-blue-700 border border-blue-200',
    verified: 'bg-green-50 text-green-700 border border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    outline: 'border border-gray-300 bg-white text-gray-700',
  };
  
  const sizes: Record<BadgeSize, string> = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const iconSizes: Record<BadgeSize, 'xs' | 'sm' | 'md'> = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  };
  
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || 'sm';
  
  const iconElement = icon ? <Icon name={icon} size={iconSize} /> : null;
  
  // When asChild is true, render only the single child without wrappers
  if (asChild && children && !iconElement) {
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </Comp>
    );
  }
  
  return (
    <Comp
      ref={ref}
      data-slot="badge"
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={children ? 'mr-1' : ''}>
          {iconElement}
        </span>
      )}
      
      {children && <span>{children}</span>}
      
      {iconElement && iconPosition === 'right' && (
        <span className={children ? 'ml-1' : ''}>
          {iconElement}
        </span>
      )}
    </Comp>
  );
});
Badge.displayName = 'Badge';

// Variant helper function
export const badgeVariants = (options?: { variant?: BadgeVariant; className?: string }): string => {
  const variant = options?.variant || 'default';
  const extraClasses = options?.className || '';
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    destructive: 'bg-red-100 text-red-800',
    info: 'bg-teal-100 text-teal-800',
    medical: 'bg-blue-50 text-blue-700 border border-blue-200',
    verified: 'bg-green-50 text-green-700 border border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    outline: 'border border-gray-300 bg-white text-gray-700',
  };
  
  return `${baseClasses} ${variants[variant]} ${extraClasses}`.trim();
};

// Convenience components for common badge variants
export const PrimaryBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="primary" {...props} />;
export const SuccessBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="success" {...props} />;
export const WarningBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="warning" {...props} />;
export const ErrorBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="error" {...props} />;
export const InfoBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="info" {...props} />;
export const MedicalBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="medical" {...props} />;
export const VerifiedBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="verified" icon="check-circle" {...props} />;
export const PendingBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="pending" icon="clock" {...props} />;
export const RejectedBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => <Badge variant="rejected" icon="x-circle" {...props} />;

export { Badge };
export default Badge;
