/**
 * Service Worker Registration and Management
 * 
 * Provides offline support, push notifications, and background sync
 * for the DoctorMX application.
 * 
 * @module lib/service-worker
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

import { logger } from '@/lib/observability/logger'

/**
 * Service worker configuration
 */
export interface ServiceWorkerConfig {
  /** Path to the service worker script */
  scope: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Update interval in hours */
  updateInterval?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ServiceWorkerConfig = {
  scope: '/',
  debug: process.env.NODE_ENV === 'development',
  updateInterval: 24,
};

/**
 * Service worker registration state
 */
interface RegistrationState {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  isRegistered: boolean;
}

const state: RegistrationState = {
  registration: null,
  isSupported: false,
  isRegistered: false,
};

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(
  config: Partial<ServiceWorkerConfig> = {}
): Promise<ServiceWorkerRegistration | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!isServiceWorkerSupported()) {
    if (finalConfig.debug) {
      logger.warn('[SW] Service workers not supported');
    }
    return null;
  }

  state.isSupported = true;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: finalConfig.scope,
    });

    state.registration = registration;
    state.isRegistered = true;

    if (finalConfig.debug) {
      logger.info('[SW] Registered successfully', { scope: registration.scope });
    }

    // Handle updates
    handleUpdates(registration, finalConfig);

    return registration;
  } catch (error) {
    logger.error('[SW] Registration failed', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Handle service worker updates
 */
function handleUpdates(
  registration: ServiceWorkerRegistration,
  config: ServiceWorkerConfig
): void {
  // Check for updates periodically
  if (config.updateInterval && config.updateInterval > 0) {
    setInterval(
      () => {
        registration.update().catch((err) => {
          logger.error('[SW] Update failed', { error: err instanceof Error ? err.message : String(err) });
        });
      },
      config.updateInterval * 60 * 60 * 1000
    );
  }

  // Listen for new service workers
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;

    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available
        if (config.debug) {
          logger.info('[SW] New version available');
        }

        // Dispatch custom event
        window.dispatchEvent(
          new CustomEvent('swUpdateAvailable', {
            detail: { registration },
          })
        );
      }
    });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (config.debug) {
      logger.info('[SW] Message received', { data: event.data });
    }

    handleServiceWorkerMessage(event.data);
  });
}

/**
 * Handle messages from service worker
 */
function handleServiceWorkerMessage(data: unknown): void {
  if (typeof data !== 'object' || data === null) return;

  const message = data as Record<string, unknown>;

  switch (message.type) {
    case 'CACHE_UPDATED':
      window.dispatchEvent(
        new CustomEvent('swCacheUpdated', { detail: message })
      );
      break;

    case 'OFFLINE_READY':
      window.dispatchEvent(new Event('swOfflineReady'));
      break;

    case 'SYNC_COMPLETE':
      window.dispatchEvent(
        new CustomEvent('swSyncComplete', { detail: message })
      );
      break;
  }
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaiting(): Promise<void> {
  if (!state.registration?.waiting) return;

  // Send skip waiting message
  state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!state.registration) return false;

  try {
    const result = await state.registration.unregister();
    state.isRegistered = false;
    state.registration = null;
    return result;
  } catch (error) {
    logger.error('[SW] Unregister failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  applicationServerKey: string
): Promise<PushSubscription | null> {
  if (!state.registration) {
    logger.error('[SW] No service worker registered');
    return null;
  }

  try {
    const subscription = await state.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
    });

    return subscription;
  } catch (error) {
    logger.error('[SW] Push subscription failed', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!state.registration) return false;

  try {
    const subscription = await state.registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    logger.error('[SW] Push unsubscription failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * Register a background sync
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!state.registration) {
    logger.error('[SW] No service worker registered');
    return false;
  }

  // Check for sync support
  if (!('sync' in state.registration)) {
    logger.warn('[SW] Background sync not supported');
    return false;
  }

  try {
    await (state.registration as ServiceWorkerRegistration & {
      sync: { register: (tag: string) => Promise<void> };
    }).sync.register(tag);
    return true;
  } catch (error) {
    logger.error('[SW] Background sync registration failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Show a notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    logger.warn('[SW] Notification permission not granted');
    return;
  }

  if (state.registration) {
    await state.registration.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
}

/**
 * Convert base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Get service worker registration status
 */
export function getServiceWorkerStatus(): RegistrationState {
  return { ...state };
}

/**
 * Check if app is running in standalone mode (PWA installed)
 */
export function isStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Check if app can be installed (beforeinstallprompt available)
 */
export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Hook for install prompt
 * Usage: Listen for 'beforeinstallprompt' event and store it
 */
let deferredPrompt: Event | null = null;

export function captureInstallPrompt(event: Event): void {
  event.preventDefault();
  deferredPrompt = event;
}

export function getDeferredPrompt(): Event | null {
  return deferredPrompt;
}

export function clearDeferredPrompt(): void {
  deferredPrompt = null;
}
