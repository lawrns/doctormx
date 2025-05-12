import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderMode: () => void;
}

const defaultContext: AccessibilityContextType = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  toggleHighContrast: () => {},
  toggleLargeText: () => {},
  toggleReducedMotion: () => {},
  toggleScreenReaderMode: () => {},
};

const AccessibilityContext = createContext<AccessibilityContextType>(defaultContext);

export const useAccessibility = () => useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_highContrast');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [largeText, setLargeText] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_largeText');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_reducedMotion');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return saved ? JSON.parse(saved) : prefersReducedMotion;
  });
  
  const [screenReaderMode, setScreenReaderMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_screenReaderMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleLargeText = () => {
    setLargeText(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const toggleScreenReaderMode = () => {
    setScreenReaderMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('accessibility_highContrast', JSON.stringify(highContrast));
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('accessibility_largeText', JSON.stringify(largeText));
    document.documentElement.classList.toggle('large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('accessibility_reducedMotion', JSON.stringify(reducedMotion));
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('accessibility_screenReaderMode', JSON.stringify(screenReaderMode));
    document.documentElement.classList.toggle('screen-reader', screenReaderMode);
  }, [screenReaderMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('accessibility_reducedMotion')) {
        setReducedMotion(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    highContrast,
    largeText,
    reducedMotion,
    screenReaderMode,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReaderMode,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
