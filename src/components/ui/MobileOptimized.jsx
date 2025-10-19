import React from 'react';

// Mobile-optimized container with proper spacing and touch targets
const MobileContainer = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Mobile-optimized grid that stacks on small screens
const MobileGrid = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-4 sm:gap-6',
  className = '',
  ...props 
}) => {
  const gridClasses = `grid grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} ${gap} ${className}`;
  
  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

// Mobile-optimized button with proper touch target size
const MobileButton = ({ 
  children, 
  className = '',
  size = 'md',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'min-h-[44px] px-3 py-2 text-sm',
    md: 'min-h-[44px] px-4 py-3 text-base',
    lg: 'min-h-[48px] px-6 py-4 text-lg',
  };
  
  return (
    <button
      className={`touch-manipulation ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile-optimized input with proper touch target size
const MobileInput = ({ 
  className = '',
  ...props 
}) => {
  return (
    <input
      className={`min-h-[44px] px-4 py-3 text-base touch-manipulation ${className}`}
      {...props}
    />
  );
};

// Mobile-optimized card with proper spacing
const MobileCard = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Mobile-optimized text with responsive sizing
const MobileText = ({ 
  children, 
  variant = 'body',
  className = '',
  ...props 
}) => {
  const variants = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    h4: 'text-base sm:text-lg lg:text-xl font-medium',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
    caption: 'text-xs',
  };
  
  const Component = variant.startsWith('h') ? variant : 'p';
  
  return (
    <Component className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
};

// Mobile-optimized spacing utilities
const MobileSpacing = {
  Container: MobileContainer,
  Grid: MobileGrid,
  Button: MobileButton,
  Input: MobileInput,
  Card: MobileCard,
  Text: MobileText,
};

export default MobileSpacing;

