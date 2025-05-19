import React, { useState, useEffect } from 'react';
import App from '../App';

/**
 * Wrapper component that ensures safe hydration by:
 * 1. Suppressing hydration warnings in development
 * 2. Ensuring client-side rendering matches server-side rendering
 */
function HydrationSafeApp() {
  const [isHydrated, setIsHydrated] = useState(false);

  // After hydration, we can render the full app
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      {/* This div ensures consistent structure between server and client */}
      <div suppressHydrationWarning={true}>
        {isHydrated ? (
          // After hydration, render the full app
          <App />
        ) : (
          // During hydration, render a minimal version that matches server rendering
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HydrationSafeApp;
