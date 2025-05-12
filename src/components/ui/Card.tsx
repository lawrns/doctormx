import React, { HTMLAttributes, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'feature' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  animationDelay?: number;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  animated = false,
  animationDelay = 0,
  interactive = false,
  ...props
}) => {
  // Base classes with card-container for targeting
  const baseClasses = 'rounded-lg overflow-hidden card-container';
  
  // Variant classes with enhanced visual hierarchy
  const variantClasses: Record<string, string> = {
    default: 'bg-white shadow',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
    feature: 'bg-white shadow-md border border-gray-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300',
    interactive: 'bg-white shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer'
  };
  
  // Padding classes with responsive adjustments
  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 md:p-5',
    lg: 'p-4 sm:p-5 md:p-6',
  };
  
  const interactiveClasses = interactive 
    ? 'transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer' 
    : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${interactiveClasses}
    ${className}
  `;
  
  const cardAnimations = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: animationDelay,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };
  
  if (animated) {
    const { 
      onAnimationStart, onDragStart, onDragEnd, onDrag, 
      ...htmlProps 
    } = props;
    
    const motionProps: MotionProps = {
      initial: "hidden",
      animate: "visible",
      variants: cardAnimations
    };
    
    return (
      <motion.div 
        className={combinedClasses}
        {...motionProps}
        {...htmlProps}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
