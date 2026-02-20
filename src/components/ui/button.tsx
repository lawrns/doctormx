import React, { type ReactNode, type ButtonHTMLAttributes, forwardRef, type ComponentPropsWithoutRef } from 'react';
import Icon from './Icon';
import { Slot } from '@radix-ui/react-slot';

export type ButtonVariant = 
  | 'default'
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'destructive'
  | 'outline' 
  | 'ghost' 
  | 'link';

export type ButtonSize = 'default' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
export type IconPosition = 'left' | 'right';

interface ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'size'> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: IconPosition;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  asChild?: boolean;
  /** Accessibility label for the button. Required when button has no visible text (icon-only buttons) */
  'aria-label'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  asChild,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  
  // Determine if this is an icon-only button
  const isIconOnly = size === 'icon' || (!children && (icon || leftIcon || rightIcon));
  
  // Warn in development if icon-only button lacks aria-label
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    if (isIconOnly && !ariaLabel && !props['aria-labelledby']) {
      console.warn(
        `Button: Icon-only buttons must have an accessible label. ` +
        `Please provide "aria-label" or "aria-labelledby" prop.`
      );
    }
  }
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500 shadow-sm',
    error: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus-visible:ring-blue-500',
  };
  
  const sizes: Record<ButtonSize, string> = {
    default: 'px-4 py-2 text-sm min-h-[44px]',
    xs: 'px-3 py-1.5 text-xs min-h-[44px]', // WCAG: minimum 44px touch target
    sm: 'px-3 py-1.5 text-sm min-h-[44px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]',
    icon: 'h-11 w-11 min-h-[44px] min-w-[44px]', // WCAG: 44px minimum for icon buttons
  };
  
  const iconSizes: Record<ButtonSize, 'sm' | 'md' | 'lg'> = {
    default: 'sm',
    xs: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    icon: 'md',
  };
  
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const iconSize = iconSizes[size] || 'sm';
  
  const renderIcon = (): React.ReactElement | null => {
    if (loading) {
      return <Icon name="clock" size={iconSize} className="animate-spin" />;
    }
    
    if (icon) {
      return <Icon name={icon} size={iconSize} />;
    }
    
    return null;
  };
  
  const iconElement = renderIcon();
  
  // Get data-size attribute value
  const dataSize = size === 'icon' || size === 'xs' || size === 'sm' || size === 'lg' || size === 'xl' 
    ? size 
    : 'default';
  
  // When asChild is true and no icons/loading, render only the single child
  if (asChild && children && !iconElement && !leftIcon && !rightIcon && !loading) {
    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={dataSize}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Comp>
    );
  }
  
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={dataSize}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...props}
    >
      {!loading && leftIcon && (
        <span className={children ? 'mr-2' : ''}>
          {leftIcon}
        </span>
      )}
      
      {iconElement && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>
          {iconElement}
        </span>
      )}
      
      {children && <span>{children}</span>}
      
      {iconElement && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>
          {iconElement}
        </span>
      )}
      
      {!loading && rightIcon && (
        <span className={children ? 'ml-2' : ''}>
          {rightIcon}
        </span>
      )}
    </Comp>
  );
});
Button.displayName = 'Button';

// Variant helper function
export const buttonVariants = (options?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }): string => {
  const variant = options?.variant || 'default';
  const size = options?.size || 'md';
  const extraClasses = options?.className || '';
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500 shadow-sm',
    error: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus-visible:ring-blue-500',
  };
  
  const sizes: Record<ButtonSize, string> = {
    default: 'px-4 py-2 text-sm min-h-[44px]',
    xs: 'px-3 py-1.5 text-xs min-h-[44px]',
    sm: 'px-3 py-1.5 text-sm min-h-[44px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]',
    icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
  };
  
  return `${baseClasses} ${variants[variant]} ${sizes[size]} ${extraClasses}`.trim();
};

// Convenience components for common button variants
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="secondary" {...props} />;
export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="success" {...props} />;
export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="warning" {...props} />;
export const ErrorButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="error" {...props} />;
export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="outline" {...props} />;
export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="ghost" {...props} />;
export const LinkButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="link" {...props} />;

export { Button };
export default Button;
