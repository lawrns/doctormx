import React, { useState, useEffect } from 'react';
import { usePwa } from '../../PwaContext';

interface InstallBannerProps {
  installButtonText?: string;
  installPromptText?: string;
  className?: string;
}

const InstallBanner: React.FC<InstallBannerProps> = ({
  installButtonText = 'Instalar',
  installPromptText = 'Instala Doctor.mx para acceso rápido y offline',
  className = '',
}) => {
  const { isInstalled, isInstallable, showInstallPrompt } = usePwa();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user has previously dismissed the banner
    const dismissedTimestamp = localStorage.getItem('pwa-install-banner-dismissed');
    
    if (dismissedTimestamp) {
      const now = new Date().getTime();
      const dismissedTime = parseInt(dismissedTimestamp, 10);
      
      // Show again after 7 days
      if (now - dismissedTime > 7 * 24 * 60 * 60 * 1000) {
        setDismissed(false);
        localStorage.removeItem('pwa-install-banner-dismissed');
      } else {
        setDismissed(true);
      }
    }
  }, []);

  useEffect(() => {
    // Only show the banner if:
    // 1. The app is not already installed
    // 2. The browser supports installation
    // 3. The user hasn't dismissed the banner recently
    // 4. The user has interacted with the site (delay showing banner)
    if (!isInstalled && isInstallable && !dismissed) {
      // Delay showing the banner to avoid annoying users immediately
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 30000); // Show after 30 seconds
      
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [isInstalled, isInstallable, dismissed]);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (!installed) {
      console.log('User declined installation');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('pwa-install-banner-dismissed', new Date().getTime().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-blue-600 text-white shadow-lg ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        <p className="flex-1 mr-4">{installPromptText}</p>
        <div className="flex items-center">
          <button
            className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium mr-2"
            onClick={handleInstall}
          >
            {installButtonText}
          </button>
          <button
            className="p-2 text-white"
            onClick={handleDismiss}
            aria-label="Descartar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
