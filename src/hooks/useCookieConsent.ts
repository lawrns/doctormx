'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Categorías de cookies según GDPR/LFPDPPP
 */
export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

/**
 * Preferencias de consentimiento de cookies
 */
export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

/**
 * Estado del consentimiento
 */
export interface ConsentState {
  hasConsent: boolean;
  preferences: CookiePreferences | null;
}

// Versión del consentimiento para invalidar consentimientos antiguos
const CONSENT_VERSION = '1.0';
const STORAGE_KEY = 'cookie-consent-preferences';

// Preferencias por defecto (solo esenciales activas)
const defaultPreferences: CookiePreferences = {
  essential: true, // Siempre true, no se puede desactivar
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: '',
  version: CONSENT_VERSION,
};

/**
 * Hook para manejar el consentimiento de cookies
 * Cumple con GDPR (Europa) y LFPDPPP (México)
 */
export function useCookieConsent() {
  const [state, setState] = useState<ConsentState>({
    hasConsent: false,
    preferences: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencias desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CookiePreferences = JSON.parse(stored);
        
        // Verificar versión del consentimiento
        if (parsed.version === CONSENT_VERSION) {
          setState({
            hasConsent: true,
            preferences: parsed,
          });
        } else {
          // Versión antigua, solicitar nuevo consentimiento
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Guardar preferencias
   */
  const savePreferences = useCallback((prefs: Partial<CookiePreferences>) => {
    const newPreferences: CookiePreferences = {
      ...defaultPreferences,
      ...prefs,
      essential: true, // Siempre activo
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setState({
        hasConsent: true,
        preferences: newPreferences,
      });
      return true;
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      return false;
    }
  }, []);

  /**
   * Aceptar todas las categorías
   */
  const acceptAll = useCallback(() => {
    return savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [savePreferences]);

  /**
   * Rechazar todo (solo esenciales)
   */
  const rejectAll = useCallback(() => {
    return savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }, [savePreferences]);

  /**
   * Actualizar preferencia específica
   */
  const updatePreference = useCallback((category: Exclude<CookieCategory, 'essential'>, value: boolean) => {
    if (!state.preferences) return false;
    
    const newPreferences = {
      ...state.preferences,
      [category]: value,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setState({
        hasConsent: true,
        preferences: newPreferences,
      });
      return true;
    } catch (error) {
      console.error('Error updating cookie preference:', error);
      return false;
    }
  }, [state.preferences]);

  /**
   * Retirar consentimiento (borrar todas las preferencias)
   */
  const withdrawConsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        hasConsent: false,
        preferences: null,
      });
      return true;
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      return false;
    }
  }, []);

  /**
   * Verificar si una categoría está permitida
   */
  const isAllowed = useCallback((category: CookieCategory): boolean => {
    if (category === 'essential') return true;
    return state.preferences?.[category] ?? false;
  }, [state.preferences]);

  /**
   * Obtener preferencias actuales
   */
  const getPreferences = useCallback((): CookiePreferences => {
    return state.preferences ?? defaultPreferences;
  }, [state.preferences]);

  return useMemo(() => ({
    ...state,
    isLoading,
    savePreferences,
    acceptAll,
    rejectAll,
    updatePreference,
    withdrawConsent,
    isAllowed,
    getPreferences,
    defaultPreferences,
  }), [
    state,
    isLoading,
    savePreferences,
    acceptAll,
    rejectAll,
    updatePreference,
    withdrawConsent,
    isAllowed,
    getPreferences,
  ]);
}

export default useCookieConsent;
