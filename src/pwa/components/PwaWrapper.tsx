import React from 'react';
import { PwaProvider } from '../PwaContext';
import OfflineIndicator from './OfflineIndicator';
import InstallBanner from './InstallBanner/index';
import InstallButtonBar from './InstallButtonBar';
import UpdateNotification from './UpdateNotification';

interface PwaWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides PWA functionality
 * This should be placed near the root of your app
 */
const PwaWrapper: React.FC<PwaWrapperProps> = ({ children }) => {
  return (
    <PwaProvider>
      {/* Main app content */}
      {children}
      
      {/* PWA UI components */}
      <OfflineIndicator />
      <UpdateNotification />
      <InstallBanner />
      <InstallButtonBar />
    </PwaProvider>
  );
};

export default PwaWrapper;