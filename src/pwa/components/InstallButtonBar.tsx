import React from 'react';
import { usePwa } from '../PwaContext';
import InstallButton from './InstallButton';

interface InstallButtonBarProps {
  className?: string;
}

const InstallButtonBar: React.FC<InstallButtonBarProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled } = usePwa();

  // Only render when installable and not already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 bg-blue-50 py-2 px-4 border-b border-blue-100 ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-blue-800 text-sm">
          <span>Instala Doctor.mx para mejor experiencia</span>
        </div>
        <InstallButton className="ml-4" />
      </div>
    </div>
  );
};

export default InstallButtonBar;
