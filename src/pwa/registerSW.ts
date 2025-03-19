/**
 * Service Worker Registration for Doctor.mx PWA
 * Direct implementation that doesn't rely on virtual modules
 */

// Define the window interface extension
interface Window {
  __SW_REGISTRATION?: ServiceWorkerRegistration;
}

// Service worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker directly
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      if (registration.installing) {
        console.log('[ServiceWorker] Installing');
      } else if (registration.waiting) {
        console.log('[ServiceWorker] Installed - waiting to activate');
      } else if (registration.active) {
        console.log('[ServiceWorker] Active');
      }
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, show update notification to user
              showUpdateNotification();
            }
          });
        }
      });
      
      // Check for updates on page load
      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateNotification();
      }
      
      // Store registration for later use
      window.__SW_REGISTRATION = registration;
      
    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error);
    }
  } else {
    console.log('[ServiceWorker] Service workers are not supported in this browser');
  }
};

/**
 * Shows a notification to the user that a new version is available
 */
const showUpdateNotification = (): void => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
    <div class="pwa-update-content">
      <p>¡Nueva versión disponible!</p>
      <button id="pwa-update-button">Actualizar</button>
      <button id="pwa-update-dismiss">Después</button>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .pwa-update-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #3b82f6;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    }
    
    .pwa-update-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .pwa-update-content p {
      margin: 0;
    }
    
    #pwa-update-button {
      background-color: white;
      color: #3b82f6;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    #pwa-update-dismiss {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      padding: 8px;
    }
    
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Add event listeners
  document.getElementById('pwa-update-button')?.addEventListener('click', () => {
    // Force refresh to get new service worker
    if (window.__SW_REGISTRATION?.waiting) {
      // Send message to the waiting service worker to skip waiting
      window.__SW_REGISTRATION.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  });
  
  document.getElementById('pwa-update-dismiss')?.addEventListener('click', () => {
    // Remove the notification
    notification.remove();
    style.remove();
  });
};

/**
 * Check if the app is being used in standalone mode (installed)
 */
export const isInStandaloneMode = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Manages custom installation prompt
 */
export class InstallPrompt {
  private deferredPrompt: any = null;
  private hasBeenShown = false;
  
  constructor() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      this.deferredPrompt = e;
      
      // Optionally, notify listeners that the app is installable
      window.dispatchEvent(new CustomEvent('appinstallable'));
    });
    
    // Check if the app was installed
    window.addEventListener('appinstalled', () => {
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      this.hasBeenShown = true;
      
      // Log the installation event
      console.log('PWA was installed');
      
      // Optionally, send analytics event
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_installed');
      }
    });
  }
  
  /**
   * Shows the installation prompt to the user
   * @returns Promise that resolves with the user's choice
   */
  public async showPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }
    
    this.hasBeenShown = true;
    
    // Show the prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await this.deferredPrompt.userChoice;
    
    // Clear the deferredPrompt
    this.deferredPrompt = null;
    
    return choiceResult.outcome === 'accepted';
  }
  
  /**
   * Checks if the installation prompt is available
   */
  public isPromptAvailable(): boolean {
    return !!this.deferredPrompt && !this.hasBeenShown;
  }
}
