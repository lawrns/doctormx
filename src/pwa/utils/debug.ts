/**
 * PWA Debug Helper
 * Provides utilities for debugging PWA features
 */

// Enable debug mode in development
const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Log a PWA-related debug message
 */
export const pwaDebug = (message: string, ...data: any[]): void => {
  if (DEBUG_MODE) {
    console.log(`[PWA Debug] ${message}`, ...data);
  }
};

/**
 * Clear all cached data (useful for debugging)
 */
export const clearAllCaches = async (): Promise<boolean> => {
  try {
    // Check if caches API is available
    if (!('caches' in window)) {
      return false;
    }
    
    // Get all cache names
    const cacheNames = await caches.keys();
    
    // Delete all caches
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    return true;
  } catch (error) {
    console.error('[PWA] Error clearing caches:', error);
    return false;
  }
};

/**
 * Clear all service workers (useful for debugging)
 */
export const clearServiceWorkers = async (): Promise<boolean> => {
  try {
    // Check if service worker API is available
    if (!('serviceWorker' in navigator)) {
      return false;
    }
    
    // Get all service worker registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    // Unregister all service workers
    await Promise.all(
      registrations.map(registration => registration.unregister())
    );
    
    return true;
  } catch (error) {
    console.error('[PWA] Error clearing service workers:', error);
    return false;
  }
};

/**
 * Full PWA reset (clears caches and unregisters service workers)
 */
export const resetPwa = async (): Promise<boolean> => {
  try {
    const cachesCleared = await clearAllCaches();
    const serviceWorkersCleared = await clearServiceWorkers();
    
    // Track the reset in console
    pwaDebug('PWA Reset performed', {
      cachesCleared,
      serviceWorkersCleared
    });
    
    return cachesCleared && serviceWorkersCleared;
  } catch (error) {
    console.error('[PWA] Error resetting PWA:', error);
    return false;
  }
};

/**
 * Get PWA status information for debugging
 */
export const getPwaStatus = async (): Promise<{
  isInstalled: boolean;
  hasServiceWorker: boolean;
  serviceWorkerState?: string;
  cacheNames: string[];
}> => {
  // Default values
  const status = {
    isInstalled: false,
    hasServiceWorker: false,
    serviceWorkerState: undefined,
    cacheNames: []
  };
  
  try {
    // Check if app is installed
    status.isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    // Check service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      status.hasServiceWorker = !!registration;
      
      if (registration) {
        if (registration.installing) {
          status.serviceWorkerState = 'installing';
        } else if (registration.waiting) {
          status.serviceWorkerState = 'waiting';
        } else if (registration.active) {
          status.serviceWorkerState = 'active';
        }
      }
    }
    
    // Check caches
    if ('caches' in window) {
      status.cacheNames = await caches.keys();
    }
    
    return status;
  } catch (error) {
    console.error('[PWA] Error getting PWA status:', error);
    return status;
  }
};

// Add a global debug function for console use
if (DEBUG_MODE) {
  (window as any).pwaDebug = {
    status: getPwaStatus,
    clearCaches: clearAllCaches,
    clearServiceWorkers: clearServiceWorkers,
    reset: resetPwa
  };
}
