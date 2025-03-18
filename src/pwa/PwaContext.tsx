import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InstallPrompt, isInStandaloneMode } from './registerSW';
import { syncOfflineRequests } from './utils/networkInterceptor';

interface PwaContextProps {
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installPrompt: InstallPrompt | null;
  promptInstall: () => Promise<boolean>;
  offlineReady: boolean;
  hasPendingUploads: boolean;
  syncPendingUploads: () => Promise<{ success: number; failed: number; remaining: number }>;
  lastSyncResult: { success: number; failed: number; remaining: number } | null;
}

const PwaContext = createContext<PwaContextProps | undefined>(undefined);

interface PwaProviderProps {
  children: ReactNode;
}

export const PwaProvider: React.FC<PwaProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState<boolean>(isInStandaloneMode());
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  const [hasPendingUploads, setHasPendingUploads] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; failed: number; remaining: number } | null>(null);

  // Initialize install prompt handler
  useEffect(() => {
    const prompt = new InstallPrompt();
    setInstallPrompt(prompt);

    // Check if PWA is already installed
    setIsStandalone(isInStandaloneMode());
    
    // Match media query for standalone mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
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
      );
      setHasPendingUploads(pendingSubmissions.length > 0);
    } catch (error) {
      console.error('[PWA] Error checking pending uploads:', error);
    }
  };

  // Prompt the user to install the PWA
  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt || !installPrompt.isPromptAvailable()) {
      return false;
    }
    
    const accepted = await installPrompt.showPrompt();
    return accepted;
  };

  // Sync pending uploads
  const syncPendingUploads = async () => {
    const result = await syncOfflineRequests();
    setLastSyncResult(result);
    setHasPendingUploads(result.remaining > 0);
    return result;
  };

  // Context value
  const contextValue: PwaContextProps = {
    isOnline,
    isStandalone,
    canInstall: installPrompt?.isPromptAvailable() || false,
    installPrompt,
    promptInstall,
    offlineReady,
    hasPendingUploads,
    syncPendingUploads,
    lastSyncResult
  };

  return (
    <PwaContext.Provider value={contextValue}>
      {children}
    </PwaContext.Provider>
  );
};

// Custom hook to use the PWA context
export const usePwa = (): PwaContextProps => {
  const context = useContext(PwaContext);
  
  if (context === undefined) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  
  return context;
};
