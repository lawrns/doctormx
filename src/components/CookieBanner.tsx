import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
  className?: string;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const configureCookies = () => {
    // This would typically open a modal with more detailed cookie settings
    // For now, we'll just accept all cookies
    acceptCookies();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-3 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-gray-600 mr-4 mb-2 sm:mb-0">
          Usamos cookies para mejorar tu experiencia.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={acceptCookies}
            className="bg-brand-jade-600 text-white py-1 px-4 rounded-md text-sm hover:bg-brand-jade-700 transition-colors"
          >
            Aceptar
          </button>
          <button
            onClick={configureCookies}
            className="border border-gray-300 text-gray-700 py-1 px-4 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Configurar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;