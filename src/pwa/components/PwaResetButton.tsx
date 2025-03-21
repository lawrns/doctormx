import React, { useState } from 'react';
import { resetPwa } from '../utils/debug';

interface PwaResetButtonProps {
  label?: string;
  className?: string;
}

/**
 * Button component to reset PWA state (clear caches and service workers)
 * Only shown in development mode
 */
const PwaResetButton: React.FC<PwaResetButtonProps> = ({
  label = 'Reset PWA',
  className = '',
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      await resetPwa();
      setResetComplete(true);
      
      // Reset state after 3 seconds
      setTimeout(() => {
        setResetComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to reset PWA:', error);
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className={`fixed bottom-4 left-4 z-50 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${className}`}
    >
      {isResetting ? 'Resetting...' : resetComplete ? 'Reset Complete!' : label}
    </button>
  );
};

export default PwaResetButton;