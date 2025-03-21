import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isInStandaloneMode } from './registerSW';
import { syncOfflineRequests } from './utils/networkInterceptor';

interface PwaContextProps {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  deferredPrompt: any;
  showInstallPrompt: () => Promise<boolean>;
  offlineReady: boolean;
  hasPendingUploads: boolean;
  syncPendingUploads: () => Promise<{ success: number; failed: number; remaining: number }>;
  lastSyncResult: { success: number; failed: number; remaining: number } | null;
}

const PwaContext = createContext<PwaContextProps>({
  isOnline: true,
  isInstalled: false,
  isInstallable: false,
  deferredPrompt: null,
  showInstallPrompt: async () => false,
  offlineReady: false,
  hasPendingUploads: false,
  syncPendingUploads: async () => ({ success: 0, failed: 0, remaining: 0 }),
  lastSyncResult: null
});

interface PwaProviderProps {
  children: ReactNode;
}

export const PwaProvider: React.FC<PwaProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState<boolean>(isInStandaloneMode());
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  const [hasPendingUploads, setHasPendingUploads] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; failed: number; remaining: number } | null>(null);

  // Check if app is already installed and handle installation capability
  useEffect(() => {
    // Check if already installed
    setIsInstalled(isInStandaloneMode());

    // Listen for display mode changes (e.g., user installs PWA while using it)
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    
    if ('addEventListener' in mediaQueryList) {
      mediaQueryList.addEventListener('change', handleDisplayModeChange);
    } else {
      // Fallback for older browsers
      (mediaQueryList as any).addListener(handleDisplayModeChange);
    }

    // Check install capability
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      console.log('[PWA] App is installable');
    });

    // Track installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Track installation in analytics if available
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_installed');
      }
      
      console.log('[PWA] App was installed');
    });

    return () => {
      if ('removeEventListener' in mediaQueryList) {
        mediaQueryList.removeEventListener('change', handleDisplayModeChange);
      } else {
        // Fallback for older browsers
        (mediaQueryList as any).removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkPendingUploads();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor service worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          console.log('[PWA] Service worker ready');
          setOfflineReady(true);
          checkPendingUploads();
        })
        .catch(err => {
          console.error('[PWA] Service worker registration error:', err);
        });
      
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PENDING_UPLOADS_STATUS') {
          setHasPendingUploads(event.data.hasPending);
        }
      });
    }
  }, []);

  // Check for pending uploads
  const checkPendingUploads = async () => {
    try {
      // This will be replaced with a proper call once we have a complete implementation
      const pendingSubmissions = await import('./utils/offlineDb').then(
        module => module.formDataDb.getPendingSubmissions()
      ).catch(() => []);
      
      if (pendingSubmissions) {
        setHasPendingUploads(pendingSubmissions.length > 0);
      }
    } catch (error) {
      console.error('[PWA] Error checking pending uploads:', error);
    }
  };

  // Prompt the user to install the PWA
  const showInstallPrompt = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Clear the saved prompt
    setDeferredPrompt(null);
    setIsInstallable(false);

    return choiceResult.outcome === 'accepted';
  };

  // Sync pending uploads
  const syncPendingUploads = async () => {
    try {
      const result = await syncOfflineRequests();
      setLastSyncResult(result);
      setHasPendingUploads(result.remaining > 0);
      return result;
    } catch (error) {
      console.error('[PWA] Error syncing pending uploads:', error);
      return { success: 0, failed: 0, remaining: 0 };
    }
  };

  return (
    <PwaContext.Provider value={{
      isOnline,
      isInstalled,
      isInstallable,
      deferredPrompt,
      showInstallPrompt,
      offlineReady,
      hasPendingUploads,
      syncPendingUploads,
      lastSyncResult
    }}>
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => useContext(PwaContext);

export default PwaContext;
