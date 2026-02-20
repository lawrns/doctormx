/**
 * Service Worker Provider
 * 
 * React provider for service worker registration and management.
 * 
 * @module components/performance/ServiceWorkerProvider
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  getServiceWorkerStatus,
  isStandaloneMode,
} from '@/lib/service-worker';

/**
 * Service worker context value
 */
interface ServiceWorkerContextValue {
  /** Whether service worker is registered */
  isRegistered: boolean;
  /** Whether service worker is supported */
  isSupported: boolean;
  /** Whether app is running in PWA standalone mode */
  isStandalone: boolean;
  /** Whether an update is available */
  updateAvailable: boolean;
  /** Function to apply pending update */
  applyUpdate: () => void;
  /** Function to unregister service worker */
  unregister: () => Promise<boolean>;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextValue>({
  isRegistered: false,
  isSupported: false,
  isStandalone: false,
  updateAvailable: false,
  applyUpdate: () => {},
  unregister: async () => false,
});

/**
 * Hook to access service worker context
 */
export function useServiceWorker(): ServiceWorkerContextValue {
  return useContext(ServiceWorkerContext);
}

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

/**
 * Service Worker Provider Component
 */
export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps): JSX.Element {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check standalone mode
    setIsStandalone(isStandaloneMode());

    // Register service worker
    const initServiceWorker = async () => {
      const status = getServiceWorkerStatus();
      setIsSupported(status.isSupported);

      const reg = await registerServiceWorker({
        debug: process.env.NODE_ENV === 'development',
      });

      if (reg) {
        setIsRegistered(true);
        setRegistration(reg);
      }
    };

    initServiceWorker();

    // Listen for update available event
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('swUpdateAvailable', handleUpdateAvailable);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleUpdateAvailable);
    };
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      // Send message to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload to activate new service worker
      window.location.reload();
    }
  };

  const unregister = async () => {
    const result = await unregisterServiceWorker();
    if (result) {
      setIsRegistered(false);
      setRegistration(null);
    }
    return result;
  };

  const value: ServiceWorkerContextValue = {
    isRegistered,
    isSupported,
    isStandalone,
    updateAvailable,
    applyUpdate,
    unregister,
  };

  return (
    <ServiceWorkerContext.Provider value={value}>
      {children}
    </ServiceWorkerContext.Provider>
  );
}
