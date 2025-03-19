/**
 * PWA initialization and utilities for Doctor.mx
 */

import { registerServiceWorker } from './registerSW';
import './vite-pwa.d.ts'; // Import PWA type definitions
import { setupOfflineSync, setupCacheCleanup } from './utils/networkInterceptor';

export { PwaProvider, usePwa } from './PwaContext';
export { default as InstallBanner } from './components/InstallBanner';
export { default as OfflineIndicator } from './components/OfflineIndicator';

/**
 * Initialize PWA functionality
 */
export const initializePwa = async (): Promise<void> => {
  // Register service worker
  await registerServiceWorker();

  // Setup offline sync handlers
  setupOfflineSync();

  // Setup cache cleanup (run every 2 hours)
  setupCacheCleanup(2 * 60 * 60 * 1000);

  // Setup Notification permissions prompt (if needed later for PWA)
  if ('Notification' in window && Notification.permission === 'default') {
    // Wait for user interaction before requesting permission
    const requestNotificationPermission = () => {
      Notification.requestPermission()
        .then((result) => {
          console.log('[PWA] Notification permission:', result);
        })
        .catch((error) => {
          console.error('[PWA] Notification permission error:', error);
        });
      
      // Remove the event listeners once permission is requested
      document.removeEventListener('click', requestNotificationPermission);
      document.removeEventListener('touchstart', requestNotificationPermission);
    };

    // Wait for user interaction
    document.addEventListener('click', requestNotificationPermission, { once: true });
    document.addEventListener('touchstart', requestNotificationPermission, { once: true });
  }

  // Log PWA initialization complete
  console.log('[PWA] Initialization complete');
};

/**
 * Check if app is running as installed PWA
 */
export const isRunningAsPwa = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Check if the device is offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Manually trigger sync of pending requests
 */
export const syncPendingUploads = async (): Promise<{
  success: number;
  failed: number;
  remaining: number;
}> => {
  if (!navigator.onLine) {
    return { success: 0, failed: 0, remaining: 0 };
  }

  return await import('./utils/networkInterceptor').then(
    (module) => module.syncOfflineRequests()
  );
};
