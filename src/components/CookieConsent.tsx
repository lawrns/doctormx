'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Shield } from 'lucide-react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShowBanner(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cookie className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tu privacidad importa</h3>
              <p className="text-sm text-gray-600 mt-1">
                Usamos cookies esenciales para el funcionamiento del sitio y opcionales para mejorar tu experiencia. 
                Consulta nuestra <a href="/privacy" className="text-blue-600 hover:underline">Política de Privacidad</a>.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Aceptar solo cookies esenciales"
            >
              Solo esenciales
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
              aria-label="Aceptar todas las cookies"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
