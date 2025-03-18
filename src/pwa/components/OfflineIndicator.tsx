import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      
      // Show the online indicator briefly
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 p-2 transition-all duration-300 ${
        isOffline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      } ${className}`}
    >
      <div className="flex items-center justify-center text-sm">
        {isOffline ? (
          <>
            <WifiOff size={16} className="mr-2" />
            <span>Sin conexión a Internet. Algunas funciones no estarán disponibles.</span>
          </>
        ) : (
          <>
            <Wifi size={16} className="mr-2" />
            <span>Conexión a Internet restaurada</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;