'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Cookie, Shield, Info, Table, Settings, ExternalLink } from 'lucide-react'
import { WithdrawConsentButton } from '@/components/CookieConsent'
import { useCookieConsent } from '@/hooks/useCookieConsent'

interface CookieDetail {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  type: 'essential' | 'functional' | 'analytics' | 'marketing';
}

const cookieDetails: CookieDetail[] = [
  // Esenciales
  {
    name: 'sb-access-token',
    provider: 'Doctor.mx',
    purpose: 'Autenticación de usuario y mantenimiento de sesión segura',
    duration: 'Sesión',
    type: 'essential',
  },
  {
    name: 'sb-refresh-token',
    provider: 'Doctor.mx',
    purpose: 'Renovación de sesión para mantener la autenticación',
    duration: '7 días',
    type: 'essential',
  },
  {
    name: 'cookie-consent-preferences',
    provider: 'Doctor.mx',
    purpose: 'Almacenar preferencias de consentimiento de cookies',
    duration: '1 año',
    type: 'essential',
  },
  {
    name: 'next-locale',
    provider: 'Doctor.mx',
    purpose: 'Recordar preferencia de idioma del usuario',
    duration: '1 año',
    type: 'essential',
  },
  // Funcionales
  {
    name: 'user-preferences',
    provider: 'Doctor.mx',
    purpose: 'Recordar preferencias de interfaz del usuario',
    duration: '1 año',
    type: 'functional',
  },
  {
    name: 'appointment-draft',
    provider: 'Doctor.mx',
    purpose: 'Guardar borrador de citas en progreso',
    duration: '24 horas',
    type: 'functional',
  },
  // Analíticas
  {
    name: '_vercel_vitals',
    provider: 'Vercel',
    purpose: 'Métricas de rendimiento Web Vitals',
    duration: 'Sesión',
    type: 'analytics',
  },
  {
    name: '_ga',
    provider: 'Google Analytics',
    purpose: 'Distinguir usuarios únicos para estadísticas',
    duration: '2 años',
    type: 'analytics',
  },
  {
    name: '_gid',
    provider: 'Google Analytics',
    purpose: 'Distinguir usuarios para estadísticas diarias',
    duration: '24 horas',
    type: 'analytics',
  },
  {
    name: '_gat',
    provider: 'Google Analytics',
    purpose: 'Limitar frecuencia de solicitudes',
    duration: '1 minuto',
    type: 'analytics',
  },
  // Marketing
  {
    name: '_fbp',
    provider: 'Meta/Facebook',
    purpose: 'Entregar publicidad relevante y medir campañas',
    duration: '3 meses',
    type: 'marketing',
  },
  {
    name: '_gcl_au',
    provider: 'Google Ads',
    purpose: 'Medir conversiones de campañas publicitarias',
    duration: '3 meses',
    type: 'marketing',
  },
];

const categoryInfo = {
  essential: {
    title: 'Cookies Esenciales',
    description: 'Necesarias para el funcionamiento básico del sitio. No requieren consentimiento.',
    color: 'bg-blue-100 text-blue-800',
  },
  functional: {
    title: 'Cookies Funcionales',
    description: 'Mejoran la funcionalidad y personalización del sitio.',
    color: 'bg-green-100 text-green-800',
  },
  analytics: {
    title: 'Cookies Analíticas',
    description: 'Nos ayudan a entender cómo interactúas con el sitio.',
    color: 'bg-yellow-100 text-yellow-800',
  },
  marketing: {
    title: 'Cookies de Marketing',
    description: 'Utilizadas para mostrarte publicidad relevante.',
    color: 'bg-purple-100 text-purple-800',
  },
};

export default function CookiesPage() {
  const { hasConsent, getPreferences, isLoading } = useCookieConsent();
  const preferences = getPreferences();

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Política de Cookies
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Te explicamos qué son las cookies, cómo las usamos en Doctor.mx y cómo puedes gestionar tus preferencias.
            </p>
          </div>

          {/* Gestión de consentimiento */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Settings className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Gestiona tus preferencias</h2>
                  <p className="text-gray-600 text-sm">
                    {isLoading 
                      ? 'Cargando preferencias...' 
                      : hasConsent 
                        ? 'Has configurado tus preferencias de cookies. Puedes modificarlas o retirar tu consentimiento en cualquier momento.'
                        : 'Aún no has configurado tus preferencias. El banner de cookies aparecerá al navegar por el sitio.'}
                  </p>
                  {!isLoading && hasConsent && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Object.entries(preferences)
                        .filter(([key]) => key !== 'timestamp' && key !== 'version')
                        .map(([key, value]) => (
                          <span 
                            key={key}
                            className={`text-xs px-2 py-1 rounded-full ${
                              value 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {key === 'essential' && 'Esenciales'}
                            {key === 'functional' && 'Funcionales'}
                            {key === 'analytics' && 'Analíticas'}
                            {key === 'marketing' && 'Marketing'}
                            {value ? ' ✓' : ' ✗'}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <WithdrawConsentButton />
              </div>
            </div>
          </div>

          {/* ¿Qué son las cookies? */}
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              ¿Qué son las cookies?
            </h2>
            <p className="text-gray-600 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
              Sirven para recordar información sobre tu visita, como tu idioma preferido y otras configuraciones, 
              lo que puede facilitar tu próxima visita y hacer que el sitio te resulte más útil.
            </p>
            <p className="text-gray-600 mb-4">
              En Doctor.mx utilizamos cookies propias y de terceros para diferentes propósitos, siempre respetando 
              tu privacidad y cumpliendo con la legislación aplicable, incluyendo el Reglamento General de 
              Protección de Datos (GDPR) de la Unión Europea y la Ley Federal de Protección de Datos Personales 
              en Posesión de los Particulares (LFPDPPP) de México.
            </p>
          </div>

          {/* Tipos de cookies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Tipos de cookies que utilizamos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${info.color}`}>
                      {key === 'essential' ? 'Siempre activas' : 'Con consentimiento'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-sm text-gray-600">{info.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de cookies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Table className="w-6 h-6 text-blue-600" />
              Cookies específicas
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tl-lg">Cookie</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Categoría</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Proveedor</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Propósito</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tr-lg">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cookieDetails.map((cookie, index) => (
                    <tr key={`${cookie.name}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{cookie.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo[cookie.type].color}`}>
                          {categoryInfo[cookie.type].title.split(' ')[1]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{cookie.provider}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs">{cookie.purpose}</td>
                      <td className="px-4 py-3 text-gray-700">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cómo gestionar cookies */}
          <div className="bg-gray-50 rounded-xl p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cómo gestionar las cookies</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Además de configurar tus preferencias en nuestro sitio, también puedes gestionar las cookies 
                desde tu navegador:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                </li>
                <li>
                  <strong>Firefox:</strong> Configuración → Privacidad y seguridad → Cookies y datos del sitio
                </li>
                <li>
                  <strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web
                </li>
                <li>
                  <strong>Edge:</strong> Configuración → Cookies y permisos del sitio → Cookies y datos del sitio
                </li>
              </ul>
              <p className="text-sm">
                Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
              </p>
            </div>
          </div>

          {/* Terceros */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proveedores de terceros</h2>
            <p className="text-gray-600 mb-4">
              Trabajamos con proveedores de confianza que pueden establecer cookies en tu dispositivo. 
              A continuación te proporcionamos enlaces a sus políticas de privacidad:
            </p>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Google (Analytics, Ads) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/privacy/policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Meta/Facebook <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://vercel.com/legal/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Vercel <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Actualizaciones */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actualizaciones de esta política</h2>
            <p className="text-gray-600">
              Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en las cookies 
              que utilizamos o por otros motivos operativos, legales o regulatorios. Te recomendamos revisar 
              esta página periódicamente para mantenerte informado.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Última actualización: 20 de febrero de 2026
            </p>
          </div>

          {/* Documentos relacionados */}
          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">Documentos relacionados</span>
            </div>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-blue-600 hover:underline text-sm">Política de Privacidad</a>
              </li>
              <li>
                <a href="/terms" className="text-blue-600 hover:underline text-sm">Términos y Condiciones</a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
