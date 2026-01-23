/**
 * Responsive Design Components and Utilities for DoctorMX
 * Mobile-first responsive system with enhanced touch targets and Mexican healthcare context
 */

import React, { useState, useEffect } from 'react';

// Breakpoint utilities
export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Hook for responsive design
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isXs: windowSize.width < breakpoints.sm,
    isSm: windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.md,
    isMd: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isLg: windowSize.width >= breakpoints.lg && windowSize.width < breakpoints.xl,
    isXl: windowSize.width >= breakpoints.xl,
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg
  };
};

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-Optimized Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const getGridCols = (cols: number) => {
    const colClasses: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6'
    };
    return colClasses[cols] || 'grid-cols-1';
  };

  const gridClasses = [
    'grid',
    gapClasses[gap],
    columns.xs && getGridCols(columns.xs),
    columns.sm && `sm:${getGridCols(columns.sm)}`,
    columns.md && `md:${getGridCols(columns.md)}`,
    columns.lg && `lg:${getGridCols(columns.lg)}`,
    columns.xl && `xl:${getGridCols(columns.xl)}`
  ].filter(Boolean).join(' ');

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  );
};

// Touch-Optimized Button for Mobile
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const TouchButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}: TouchButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Enhanced touch targets for mobile
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px] min-w-[44px]', // WCAG touch target
    md: 'px-6 py-4 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[52px] min-w-[52px]'
  };
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm active:bg-primary-700',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-sm active:bg-secondary-700',
    outline: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile Navigation Component
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileNav = ({ isOpen, onClose, children }: MobileNavProps) => {
  useEffect(() => {
    // Prevent body scroll when mobile nav is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </nav>
    </>
  );
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'medical' | 'brand';
  responsive?: boolean;
  className?: string;
}

export const ResponsiveText = ({ 
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  responsive = true,
  className = ''
}: ResponsiveTextProps) => {
  const sizeClasses = responsive ? {
    xs: 'text-xs sm:text-xs',
    sm: 'text-sm sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl md:text-3xl',
    '4xl': 'text-3xl sm:text-4xl md:text-4xl lg:text-5xl'
  } : {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    medical: 'text-text-medical',
    brand: 'text-primary-600'
  };

  return (
    <Component className={`${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`}>
      {children}
    </Component>
  );
};

// Responsive Image Component with Mexican Healthcare Context
interface ResponsiveMedicalImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2';
  sizes?: string;
  priority?: boolean;
  className?: string;
  medicalContext?: string; // For screen readers
}

export const ResponsiveMedicalImage = ({ 
  src, 
  alt, 
  aspectRatio = '16/9',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className = '',
  medicalContext
}: ResponsiveMedicalImageProps) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]'
  };

  const fullAlt = medicalContext ? `${alt} - ${medicalContext}` : alt;

  return (
    <div className={`relative overflow-hidden rounded-lg ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <img
        src={src}
        alt={fullAlt}
        className="absolute inset-0 w-full h-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
      />
    </div>
  );
};

// Mexican Healthcare Card Component
interface MedicalCardProps {
  children: React.ReactNode;
  type?: 'consultation' | 'prescription' | 'appointment' | 'emergency';
  responsive?: boolean;
  className?: string;
}

export const MedicalCard = ({ 
  children, 
  type = 'consultation',
  responsive = true,
  className = ''
}: MedicalCardProps) => {
  const typeClasses = {
    consultation: 'border-l-4 border-primary-500 bg-primary-50',
    prescription: 'border-l-4 border-semantic-prescription bg-purple-50',
    appointment: 'border-l-4 border-semantic-appointment bg-green-50',
    emergency: 'border-l-4 border-semantic-emergency bg-red-50'
  };

  const responsiveClasses = responsive 
    ? 'p-4 sm:p-6 rounded-lg sm:rounded-xl' 
    : 'p-6 rounded-xl';

  return (
    <div className={`${typeClasses[type]} ${responsiveClasses} shadow-card transition-all duration-300 hover:shadow-cardHover ${className}`}>
      {children}
    </div>
  );
};

// Utility functions
export const responsiveUtils = {
  // Check if device is mobile
  isMobile: () => typeof window !== 'undefined' && window.innerWidth < breakpoints.md,
  
  // Check if device supports touch
  isTouchDevice: () => typeof window !== 'undefined' && 'ontouchstart' in window,
  
  // Get current breakpoint
  getCurrentBreakpoint: () => {
    if (typeof window === 'undefined') return 'lg';
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    return 'xl';
  },
  
  // Get optimal image sizes for Mexican healthcare context
  getMedicalImageSizes: (context: 'profile' | 'diagnostic' | 'hero' | 'thumbnail') => {
    const sizeMap = {
      profile: '(max-width: 768px) 150px, 200px',
      diagnostic: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw',
      hero: '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px',
      thumbnail: '(max-width: 768px) 80px, 120px'
    };
    return sizeMap[context];
  }
};

export default {
  useResponsive,
  ResponsiveContainer,
  ResponsiveGrid,
  TouchButton,
  MobileNav,
  ResponsiveText,
  ResponsiveMedicalImage,
  MedicalCard,
  responsiveUtils
};