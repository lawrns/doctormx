'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useCookieConsent, type CookieCategory } from '@/hooks/useCookieConsent';

interface ScriptConfig {
  id: string;
  src: string;
  category: Exclude<CookieCategory, 'essential'>;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  attributes?: Record<string, string>;
}

// Configuración de scripts que requieren consentimiento
const scriptsConfig: ScriptConfig[] = [
  // Analytics
  {
    id: 'google-analytics',
    src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
    category: 'analytics',
    strategy: 'lazyOnload',
  },
  {
    id: 'hotjar',
    src: 'https://static.hotjar.com/c/hotjar-XXXXXXX.js?sv=6',
    category: 'analytics',
    strategy: 'lazyOnload',
  },
  // Marketing
  {
    id: 'facebook-pixel',
    src: 'https://connect.facebook.net/en_US/fbevents.js',
    category: 'marketing',
    strategy: 'lazyOnload',
  },
  {
    id: 'google-ads',
    src: 'https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID',
    category: 'marketing',
    strategy: 'lazyOnload',
  },
];

/**
 * Componente que carga scripts de terceros solo cuando el usuario ha dado consentimiento
 * para la categoría correspondiente.
 */
export function ConsentAwareScripts() {
  const { isLoading, hasConsent, isAllowed } = useCookieConsent();
  const [loadedScripts, setLoadedScripts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading) return;

    // Determinar qué scripts pueden cargarse
    const allowedScripts = new Set<string>();
    
    scriptsConfig.forEach((script) => {
      if (isAllowed(script.category)) {
        allowedScripts.add(script.id);
      }
    });

    setLoadedScripts(allowedScripts);
  }, [isLoading, hasConsent, isAllowed]);

  if (isLoading) return null;

  return (
    <>
      {/* Google Analytics - solo si se permite analytics */}
      {loadedScripts.has('google-analytics') && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
            strategy="lazyOnload"
            id="ga-script"
          />
          <Script id="ga-config" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel - solo si se permite marketing */}
      {loadedScripts.has('facebook-pixel') && (
        <Script id="fb-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'FB_PIXEL_ID');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

/**
 * Hook para cargar scripts dinámicamente según el consentimiento
 */
export function useConsentScript(category: Exclude<CookieCategory, 'essential'>) {
  const { isAllowed } = useCookieConsent();
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    setCanLoad(isAllowed(category));
  }, [isAllowed, category]);

  return canLoad;
}

/**
 * Componente para renderizar contenido embebido condicional
 * (iframes, widgets, etc.) según el consentimiento
 */
interface ConsentGateProps {
  category: Exclude<CookieCategory, 'essential'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConsentGate({ category, children, fallback }: ConsentGateProps) {
  const { isAllowed } = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isAllowed(category)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <p className="text-gray-600 text-sm">
        Este contenido requiere cookies {category === 'marketing' ? 'de marketing' : category === 'analytics' ? 'analíticas' : 'funcionales'}.
      </p>
      <a 
        href="/cookies" 
        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
      >
        Gestionar preferencias de cookies
      </a>
    </div>
  );
}

export default ConsentAwareScripts;
