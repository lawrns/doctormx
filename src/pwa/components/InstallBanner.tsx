import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { usePwa } from '../PwaContext';

interface InstallBannerProps {
  className?: string;
  onDismiss?: () => void;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ className = '', onDismiss }) => {
  const { promptInstall, canInstall } = usePwa();
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed or previously dismissed
    const isDismissed = localStorage.getItem('pwa-install-banner-dismissed') === 'true';
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isDismissed || isStandalone) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install banner
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowBanner(false);
      localStorage.setItem('pwa-install-banner-dismissed', 'true');
      
      // Optional: Show a confirmation message
      console.log('App was installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      // Use the promptInstall method from context if available,
      // otherwise fall back to the old implementation
      if (promptInstall) {
        const installed = await promptInstall();
        setShowBanner(false);
        
        // If declined, remember for 7 days
        if (!installed) {
          handleDismiss();
        }
      } else if (deferredPrompt) {
        // Fallback to the old implementation
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        // Clear the saved prompt
        setDeferredPrompt(null);
        
        // Hide the banner regardless of outcome
        setShowBanner(false);
        
        // If declined, remember for 7 days
        if (outcome === 'dismissed') {
          handleDismiss();
        }
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    
    // Remember that user dismissed the banner
    const now = new Date();
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
    localStorage.setItem('pwa-install-banner-dismissed-date', now.toISOString());
    
    // Call the onDismiss callback if provided
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50 animate-slide-up ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Download size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Instala Doctor.mx</h3>
            <p className="text-sm text-gray-600">Accede más rápido y utiliza la app sin conexión</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Después
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;