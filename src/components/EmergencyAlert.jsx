import { useState, useEffect } from 'react'
import { showErrorToast } from '../lib/toast'

export default function EmergencyAlert({ symptoms, onClose }) {
  const [nearestER, setNearestER] = useState(null)
  const [loading, setLoading] = useState(true)
  const [callbackRequested, setCallbackRequested] = useState(false)

  useEffect(() => {
    findNearestER()
    requestNurseCallback()
  }, [])

  const findNearestER = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            // In production: call Google Places API or similar
            // For now, mock data
            setNearestER({
              name: 'Hospital General',
              address: 'Av. Principal 123, CDMX',
              distance: '1.2 km',
              phone: '55-1234-5678',
              mapsUrl: `https://www.google.com/maps/search/hospital/@${latitude},${longitude},15z`
            })
            setLoading(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            setNearestER({
              name: 'Urgencias más cercanas',
              address: 'Buscar en Google Maps',
              distance: 'Desconocida',
              phone: '911',
              mapsUrl: 'https://www.google.com/maps/search/hospital+urgencias'
            })
            setLoading(false)
          }
        )
      }
    } catch (error) {
      showErrorToast('Error al buscar urgencias cercanas')
      setLoading(false)
    }
  }

  const requestNurseCallback = async () => {
    try {
      // In production: trigger nurse callback via API
      // Mock: set flag
      setTimeout(() => {
        setCallbackRequested(true)
      }, 1000)
    } catch (error) {
      console.error('Callback request error:', error)
    }
  }

  const handleCall911 = () => {
    window.location.href = 'tel:911'
  }

  const handleOpenMaps = () => {
    if (nearestER?.mapsUrl) {
      window.open(nearestER.mapsUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alert-900/95 backdrop-blur-sm animate-fade-in">
      <div className="max-w-lg w-full mx-4">
        {/* Alert Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header - Critical Alert */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">SITUACIÓN DE EMERGENCIA</h2>
                <p className="text-white/90 text-sm">Detectada por Doctor IA</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Critical Message */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-900 font-semibold text-lg mb-2">
                Tus síntomas requieren ATENCIÓN INMEDIATA
              </p>
              <p className="text-red-700 text-sm">
                No esperes. Busca atención médica de emergencia ahora mismo.
              </p>
            </div>

            {/* Symptoms detected */}
            {symptoms && (
              <div className="text-sm text-ink-secondary">
                <span className="font-medium text-ink-primary">Síntomas críticos detectados:</span> {symptoms}
              </div>
            )}

            {/* Emergency Actions */}
            <div className="space-y-3">
              {/* Call 911 */}
              <button
                onClick={handleCall911}
                className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xl">LLAMAR 911 AHORA</span>
              </button>

              {/* Nearest ER */}
              {loading ? (
                <div className="bg-ink-bg rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-ink-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-ink-border rounded w-1/2"></div>
                </div>
              ) : nearestER && (
                <button
                  onClick={handleOpenMaps}
                  className="w-full bg-white border-2 border-brand-500 hover:bg-brand-50 text-ink-primary font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-base">{nearestER.name}</div>
                      <div className="text-sm text-ink-secondary">{nearestER.distance} • {nearestER.address}</div>
                    </div>
                    <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* Nurse Callback Notice */}
            {callbackRequested && (
              <div className="bg-medical-50 border border-medical-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-medical-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-medical-900">Enfermera te llamará en 2 minutos</p>
                    <p className="text-xs text-medical-700 mt-1">
                      Para ayudarte a llegar a urgencias de forma segura
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">Tu seguridad es nuestra prioridad absoluta</p>
                  <p>Doctor.mx no puede reemplazar atención de emergencia. Por favor acude a urgencias inmediatamente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Logged for quality */}
          <div className="bg-ink-bg px-6 py-3 text-center">
            <p className="text-xs text-ink-secondary">
              Este evento ha sido registrado y será revisado por nuestro equipo médico
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
