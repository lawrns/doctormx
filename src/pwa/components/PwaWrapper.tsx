import React, { useEffect, useState } from 'react';
import { PwaProvider } from '../PwaContext';
import OfflineIndicator from './OfflineIndicator';
import InstallBanner from './InstallBanner';
import UpdateNotification from './UpdateNotification';

interface PwaWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides PWA functionality
 * This should be placed near the root of your app
 */
const PwaWrapper: React.FC<PwaWrapperProps> = ({ children }) => {
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [installBannerDismissed, setInstallBannerDismissed] = useState<boolean>(
    localStorage.getItem('pwa-install-banner-dismissed') === 'true'
  );

  // Check if installation banner should be shown
  useEffect(() => {
    // Only show install banner if not already installed and not dismissed
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    if (!isStandalone && !installBannerDismissed) {
      // Wait a bit before showing the banner to avoid overwhelming the user
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 15000); // 15 seconds
      
      return () => clearTimeout(timer);
    }
  }, [installBannerDismissed]);

  const handleInstallBannerDismiss = () => {
    setShowInstallBanner(false);
    setInstallBannerDismissed(true);
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
    
    // Set a timeout to show the banner again after 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    localStorage.setItem('pwa-install-banner-dismissed-until', sevenDaysFromNow.toISOString());
  };

  return (
    <PwaProvider>
      {/* Main app content */}
      {children}
      
      {/* PWA UI components */}
      <OfflineIndicator />
      <UpdateNotification />
      
      {/* Conditionally show install banner */}
      {showInstallBanner && (
        <InstallBanner 
          onDismiss={handleInstallBannerDismiss}
        />
      )}
    </PwaProvider>
  );
};

export default PwaWrapper;