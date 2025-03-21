import React from 'react';
import { usePwa } from '../../PwaContext';

interface InstallButtonProps {
  text?: string;
  className?: string;
}

const InstallButton: React.FC<InstallButtonProps> = ({
  text = 'Instalar App',
  className = '',
}) => {
  const { isInstalled, isInstallable, showInstallPrompt } = usePwa();

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={() => showInstallPrompt()}
      className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {text}
    </button>
  );
};

export default InstallButton;
