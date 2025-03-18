import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface UpdateNotificationProps {
  className?: string;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ className = '' }) => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Listen for service worker update events
    if ('serviceWorker' in navigator) {
      // Get service worker registration
      navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration) return;
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (!newWorker) return;
          
          // Listen for state changes
          newWorker.addEventListener('statechange', () => {
            // If new service worker is installed and waiting
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
      
      // Listen for message events from the service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    // Force page reload to activate new service worker
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-blue-200 z-50 max-w-xs animate-fade-in ${className}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <RefreshCw size={16} className="text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Nueva actualización</h3>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Hay una nueva versión de Doctor.mx disponible. Actualiza para acceder a las últimas mejoras y funcionalidades.
        </p>
        
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Actualizar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;