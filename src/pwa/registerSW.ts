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
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers are not supported in this browser');
    return;
  }
  
  try {
    // Check if the service worker file exists
    try {
      const response = await fetch('/sw.js');
      if (!response.ok) {
        console.warn('[PWA] Service worker file not found, PWA functionality will be limited.');
        return;
      }
    } catch (error) {
      console.warn('[PWA] Could not verify service worker file:', error);
      // Continue anyway, the registration will fail if the file really doesn't exist
    }
    
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('[PWA] Service worker registration successful with scope:', registration.scope);
    
    // Check the current state
    if (registration.installing) {
      console.log('[PWA] Service Worker installing');
    } else if (registration.waiting) {
      console.log('[PWA] Service Worker installed - waiting to activate');
      
      // If there's a waiting worker, it means there's an update available
      if (navigator.serviceWorker.controller) {
        showUpdateNotification(() => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          window.location.reload();
        });
      }
    } else if (registration.active) {
      console.log('[PWA] Service Worker active');
    }
    
    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, show update notification
            showUpdateNotification(() => {
              if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              window.location.reload();
            });
          }
        });
      }
    });
    
    // Store registration for later use
    window.__SW_REGISTRATION = registration;
    
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
  }
};



  // Show update notification
  const showUpdateNotification = (updateFn?: () => void): void => {
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
    
    // Store references to remove them later
    const updateButton = document.getElementById('pwa-update-button');
    const dismissButton = document.getElementById('pwa-update-dismiss');
    
    // Add event listeners
    if (updateButton) {
      updateButton.addEventListener('click', () => {
        // First, remove the notification to prevent UI issues during reload
        notification.remove();
        style.remove();
        
        // Optionally, show a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'pwa-loading-indicator';
        loadingIndicator.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Actualizando...</p>
        `;
        
        const loadingStyle = document.createElement('style');
        loadingStyle.textContent = `
          .pwa-loading-indicator {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .pwa-loading-indicator p {
            margin-top: 16px;
            font-size: 16px;
            color: #333;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        
        document.head.appendChild(loadingStyle);
        document.body.appendChild(loadingIndicator);
        
        // Small delay before processing the update to ensure UI updates first
        setTimeout(() => {
          // If an update function was provided, use it
          if (updateFn) {
            updateFn();
          } else {
            // Fallback to the old approach
            if (window.__SW_REGISTRATION?.waiting) {
              // Send message to the waiting service worker to skip waiting
              window.__SW_REGISTRATION.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Force a clean reload after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }, 100);
      });
    }
    
    if (dismissButton) {
      dismissButton.addEventListener('click', () => {
        // Remove the notification
        notification.remove();
        style.remove();
      });
    }
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
