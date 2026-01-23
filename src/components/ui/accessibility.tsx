/**
 * Accessibility Enhancement Components for DoctorMX
 * WCAG 2.1 AA compliant components and utilities
 */

import React, { useEffect, useRef } from 'react';

// Skip to Content Link
export const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 font-medium"
  >
    Saltar al contenido principal
  </a>
);

// Screen Reader Only Text
interface SrOnlyProps {
  children: React.ReactNode;
}

export const SrOnly = ({ children }: SrOnlyProps) => (
  <span className="sr-only">{children}</span>
);

// Focus Trap for Modals
interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
}

export const FocusTrap = ({ children, isActive }: FocusTrapProps) => {
  const trapRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const trapElement = trapRef.current;
    if (!trapElement) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements
    const focusableElements = trapElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [isActive]);

  return <div ref={trapRef}>{children}</div>;
};

// Accessible Image with Error Handling
interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string; // Make alt required
  fallbackSrc?: string;
  errorText?: string;
}

export const AccessibleImage = ({ 
  alt, 
  fallbackSrc, 
  errorText = 'Imagen no disponible', 
  onError,
  ...props 
}: AccessibleImageProps) => {
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(props.src);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    onError?.(e);
  };

  if (hasError) {
    return (
      <div 
        className="flex items-center justify-center bg-neutral-100 text-neutral-500 rounded text-sm p-4"
        role="img"
        aria-label={alt}
      >
        {errorText}
      </div>
    );
  }

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
      loading={props.loading || 'lazy'}
    />
  );
};

// Live Region for Announcements
interface LiveRegionProps {
  children: React.ReactNode;
  level?: 'polite' | 'assertive';
  className?: string;
}

export const LiveRegion = ({ children, level = 'polite', className = '' }: LiveRegionProps) => (
  <div
    aria-live={level}
    aria-atomic="true"
    className={`sr-only ${className}`}
  >
    {children}
  </div>
);

// Accessible Progress Bar
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  className = '' 
}: ProgressBarProps) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm font-medium text-text-secondary">
          <span>{label}</span>
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progreso: ${percentage}%`}
        />
      </div>
    </div>
  );
};

// High Contrast Color Variants
export const HighContrastColors = {
  text: {
    primary: '#000000',
    secondary: '#2d3748',
    inverse: '#ffffff'
  },
  background: {
    primary: '#ffffff',
    secondary: '#f7fafc',
    dark: '#000000'
  },
  border: {
    default: '#2d3748',
    focus: '#3182ce'
  }
};

// Accessibility Utilities
export const a11yUtils = {
  // Generate unique IDs for form elements
  generateId: (prefix: string = 'element') => 
    `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if reduced motion is preferred
  prefersReducedMotion: () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  // Check if high contrast is preferred
  prefersHighContrast: () =>
    window.matchMedia('(prefers-contrast: high)').matches,
  
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (
  keys: string[], 
  handler: (key: string, event: KeyboardEvent) => void,
  dependencies: any[] = []
) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        handler(event.key, event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};

// Medical Context Announcements (Spanish)
export const medicalAnnouncements = {
  consultationStarted: 'Consulta médica iniciada',
  consultationEnded: 'Consulta médica finalizada',
  prescriptionAdded: 'Receta médica agregada',
  appointmentScheduled: 'Cita médica programada',
  emergencyAlert: 'Alerta de emergencia médica',
  diagnosticComplete: 'Diagnóstico completado',
  treatmentRecommended: 'Tratamiento recomendado',
  medicationReminder: 'Recordatorio de medicamento'
};

export default {
  SkipToContent,
  SrOnly,
  FocusTrap,
  AccessibleImage,
  LiveRegion,
  ProgressBar,
  HighContrastColors,
  a11yUtils,
  useKeyboardNavigation,
  medicalAnnouncements
};