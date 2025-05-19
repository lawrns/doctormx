/**
 * Utility functions for safely handling client-side operations
 * to prevent hydration mismatches
 */

import { useEffect, useState } from 'react';

/**
 * Safely access window object only on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Hook to safely use client-side features after component mount
 * @returns {boolean} Whether the component has mounted
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}

/**
 * Safely access localStorage with fallbacks
 */
export function safeLocalStorage() {
  if (!isClient) {
    // Return dummy implementation for SSR
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined
    };
  }
  
  try {
    // Test localStorage access
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return localStorage;
  } catch (e) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, using in-memory storage');
    const storage: Record<string, string> = {};
    return {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; }
    };
  }
}

/**
 * Safely get window dimensions with SSR support
 */
export function useWindowSize() {
  // Default size for SSR
  const defaultSize = { width: 1200, height: 800 };
  
  const [windowSize, setWindowSize] = useState(defaultSize);
  const hasMounted = useHasMounted();
  
  useEffect(() => {
    if (!isClient) return;
    
    function updateSize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Return default size until mounted to prevent hydration mismatch
  return hasMounted ? windowSize : defaultSize;
}

/**
 * Safely detect if device is mobile with SSR support
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const hasMounted = useHasMounted();
  
  useEffect(() => {
    if (!isClient) return;
    
    const checkMobile = () => {
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isMobileWidth = window.innerWidth < 768;
      setIsMobile(isMobileUserAgent || isMobileWidth);
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Always return false for SSR to prevent hydration mismatch
  return hasMounted ? isMobile : false;
}
