/**
 * Service Worker Registration for Doctor.mx PWA
 */

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
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
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.log('Service workers are not supported in this browser');
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
    // Reload the page to get the new version
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

/**
 * Initialize the PWA functionality
 */
export const initPWA = (): void => {
  // Register service worker
  registerServiceWorker();
  
  // Initialize install prompt handler
  const installPrompt = new InstallPrompt();
  
  // Expose to window for debugging
  (window as any).pwaInstall = installPrompt;
  
  // Check if we should show custom install UI after a delay
  setTimeout(() => {
    if (
      installPrompt.isPromptAvailable() && 
      !isInStandaloneMode() &&
      localStorage.getItem('pwa-install-prompted') !== 'true'
    ) {
      // Show custom install UI after user has engaged with the site
      showCustomInstallUI(installPrompt);
      
      // Mark that we've shown the prompt
      localStorage.setItem('pwa-install-prompted', 'true');
    }
  }, 30000); // 30 seconds delay
};

/**
 * Shows a custom installation UI
 */
const showCustomInstallUI = (installPrompt: InstallPrompt): void => {
  // Create custom install UI
  const installUI = document.createElement('div');
  installUI.className = 'pwa-install-prompt';
  installUI.innerHTML = `
    <div class="pwa-install-content">
      <div class="pwa-install-header">
        <img src="/icons/icon-192x192.png" alt="Doctor.mx" width="48" height="48" />
        <button id="pwa-install-close">&times;</button>
      </div>
      <h3>Instala Doctor.mx</h3>
      <p>Instala nuestra aplicación para un acceso más rápido y funcionalidades offline.</p>
      <div class="pwa-install-buttons">
        <button id="pwa-install-confirm">Instalar</button>
        <button id="pwa-install-later">Más tarde</button>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .pwa-install-prompt {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      width: 90%;
      max-width: 360px;
      animation: slideUp 0.3s ease-out;
    }
    
    .pwa-install-content {
      padding: 20px;
    }
    
    .pwa-install-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .pwa-install-header img {
      border-radius: 8px;
    }
    
    #pwa-install-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
    }
    
    .pwa-install-prompt h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #111827;
    }
    
    .pwa-install-prompt p {
      margin: 0 0 20px 0;
      color: #4b5563;
    }
    
    .pwa-install-buttons {
      display: flex;
      gap: 12px;
    }
    
    #pwa-install-confirm {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-weight: 500;
      flex-grow: 1;
      cursor: pointer;
    }
    
    #pwa-install-later {
      background-color: #f3f4f6;
      color: #4b5563;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    
    @keyframes slideUp {
      from { transform: translate(-50%, 100px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @media (display-mode: standalone) {
      .pwa-install-prompt {
        display: none;
      }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(installUI);
  
  // Add event listeners
  document.getElementById('pwa-install-confirm')?.addEventListener('click', async () => {
    const installed = await installPrompt.showPrompt();
    installUI.remove();
    
    if (installed) {
      // Show installation success message
      const successMessage = document.createElement('div');
      successMessage.className = 'pwa-install-success';
      successMessage.innerHTML = `
        <div class="pwa-success-content">
          <p>¡Gracias por instalar Doctor.mx!</p>
        </div>
      `;
      
      const successStyle = document.createElement('style');
      successStyle.textContent = `
        .pwa-install-success {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #10b981;
          color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }
        
        .pwa-success-content {
          text-align: center;
        }
        
        .pwa-success-content p {
          margin: 0;
          font-weight: 500;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      
      document.head.appendChild(successStyle);
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
        successStyle.remove();
      }, 3000);
    }
  });
  
  document.getElementById('pwa-install-later')?.addEventListener('click', () => {
    installUI.remove();
    style.remove();
    
    // Postpone for one week
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    localStorage.setItem('pwa-install-prompted', 'true');
    localStorage.setItem('pwa-install-postponed-until', oneWeekLater.toISOString());
  });
  
  document.getElementById('pwa-install-close')?.addEventListener('click', () => {
    installUI.remove();
    style.remove();
  });
};