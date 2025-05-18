import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    
    // Listen for the pwaInstallable event
    const handleInstallable = () => {
      setIsInstallable(true);
    };
    
    document.addEventListener('pwaInstallable', handleInstallable);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('pwaInstallable', handleInstallable);
    };
  }, []);

  const handleInstallClick = () => {
    if (isIOS) {
      setShowInstructions(true);
    } else if (typeof window.showInstallPrompt === 'function') {
      window.showInstallPrompt();
    }
  };

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-jade-600 text-white hover:bg-brand-jade-700 transition-colors"
      >
        <Download size={18} />
        <span>{isIOS ? 'Instalar app' : 'Instalar aplicación'}</span>
      </button>
      
      {isIOS && showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Instalar Doctor.mx en tu iPhone/iPad</h3>
            
            <ol className="space-y-4 text-gray-600 mb-6">
              <li className="flex items-start">
                <span className="bg-brand-jade-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
                <span>Toca el botón <strong>Compartir</strong> en la barra del navegador (ícono con una flecha hacia arriba)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-brand-jade-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
                <span>Desplázate hacia abajo y toca <strong>Agregar a la pantalla de inicio</strong></span>
              </li>
              <li className="flex items-start">
                <span className="bg-brand-jade-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
                <span>Toca <strong>Agregar</strong> en la esquina superior derecha</span>
              </li>
              <li className="flex items-start">
                <span className="bg-brand-jade-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">4</span>
                <span>¡Doctor.mx ahora está instalado en tu dispositivo!</span>
              </li>
            </ol>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 bg-brand-jade-600 text-white rounded-lg hover:bg-brand-jade-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;

// Add this to the window object type for TypeScript
declare global {
  interface Window {
    showInstallPrompt: () => void;
  }
}
