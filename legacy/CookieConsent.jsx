import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Icon from './ui/Icon';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="information-circle" size="sm" className="text-primary-600" />
              <span className="font-semibold text-neutral-900">Uso de Cookies</span>
            </div>
            <p className="text-sm text-neutral-600">
              Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
              Al continuar navegando, aceptas nuestro uso de cookies conforme a la{' '}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                Política de Privacidad
              </a>{' '}
              y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="whitespace-nowrap"
            >
              Rechazar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAccept}
              className="whitespace-nowrap"
            >
              <Icon name="check-circle" size="xs" className="mr-1" />
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
