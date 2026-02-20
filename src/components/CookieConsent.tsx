'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Shield, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useCookieConsent, type CookieCategory } from '@/hooks/useCookieConsent';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CookieCategoryInfo {
  id: CookieCategory;
  title: string;
  description: string;
  required?: boolean;
}

const cookieCategories: CookieCategoryInfo[] = [
  {
    id: 'essential',
    title: 'Cookies Esenciales',
    description: 'Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.',
    required: true,
  },
  {
    id: 'functional',
    title: 'Cookies Funcionales',
    description: 'Permiten recordar tus preferencias y personalizar tu experiencia.',
  },
  {
    id: 'analytics',
    title: 'Cookies Analíticas',
    description: 'Nos ayudan a entender cómo usas el sitio para mejorarlo.',
  },
  {
    id: 'marketing',
    title: 'Cookies de Marketing',
    description: 'Utilizadas para mostrarte publicidad relevante.',
  },
];

export function CookieConsent() {
  const { hasConsent, isLoading, savePreferences, acceptAll, rejectAll, getPreferences } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<Record<CookieCategory, boolean>>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Mostrar banner si no hay consentimiento
  useEffect(() => {
    if (!isLoading && !hasConsent) {
      setShowBanner(true);
    }
  }, [hasConsent, isLoading]);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
  };

  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') return; // No se puede cambiar
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!showBanner || isLoading) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Cookie className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 id="cookie-consent-title" className="font-semibold text-gray-900">
              Tu privacidad importa
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Usamos cookies para mejorar tu experiencia. Selecciona las categorías que deseas permitir. 
              Puedes cambiar tus preferencias en cualquier momento desde nuestra{' '}
              <a href="/cookies" className="text-blue-600 hover:underline font-medium">
                Política de Cookies
              </a>.
            </p>
          </div>
          <button
            onClick={handleRejectAll}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            aria-label="Cerrar banner de cookies"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Categorías de cookies */}
        <div className={`space-y-3 ${showDetails ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cookieCategories.map((category) => (
              <div
                key={category.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  category.required 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <Checkbox
                  id={`cookie-${category.id}`}
                  checked={preferences[category.id]}
                  onCheckedChange={() => handleToggle(category.id)}
                  disabled={category.required}
                  aria-label={category.title}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`cookie-${category.id}`}
                    className="font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                  >
                    {category.title}
                    {category.required && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Requerido
                      </span>
                    )}
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle details en móvil */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="sm:hidden flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3 font-medium"
          aria-expanded={showDetails}
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar opciones
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Personalizar cookies
            </>
          )}
        </button>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2 flex-1">
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              aria-label="Rechazar cookies no esenciales"
            >
              Solo esenciales
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              aria-label="Guardar preferencias de cookies"
            >
              Guardar preferencias
            </button>
          </div>
          <button
            onClick={handleAcceptAll}
            className="px-6 py-2.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            aria-label="Aceptar todas las cookies"
          >
            <Shield className="w-4 h-4" aria-hidden="true" />
            Aceptar todas
          </button>
        </div>

        {/* Info legal */}
        <p className="text-xs text-gray-500 mt-3 text-center sm:text-left">
          Tu consentimiento se almacena localmente y puede ser modificado o retirado en cualquier momento. 
          Consulta nuestras{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">Política de Privacidad</a>.
        </p>
      </div>
    </div>
  );
}

/**
 * Botón para retirar consentimiento (para usar en páginas legales)
 */
export function WithdrawConsentButton() {
  const { hasConsent, withdrawConsent } = useCookieConsent();
  const [withdrawn, setWithdrawn] = useState(false);

  const handleWithdraw = () => {
    if (withdrawConsent()) {
      setWithdrawn(true);
      // Recargar para aplicar cambios
      window.location.reload();
    }
  };

  if (!hasConsent || withdrawn) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Info className="w-4 h-4" />
        <span>No tienes consentimiento activo. El banner de cookies aparecerá al recargar.</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleWithdraw}
      className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 font-medium"
      aria-label="Retirar consentimiento de cookies"
    >
      Retirar consentimiento
    </button>
  );
}

export default CookieConsent;
