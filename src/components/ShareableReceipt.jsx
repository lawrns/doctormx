import { useState } from 'react'
import { showSuccessToast } from '../lib/toast'

export default function ShareableReceipt({ consultation, onClose }) {
  const [isSharing, setIsSharing] = useState(false)

  const savings = {
    vs_presencial: 420,
    vs_er: 2580
  }

  const handleWhatsAppShare = () => {
    setIsSharing(true)
    const message = encodeURIComponent(
      `¡Resolví mi consulta médica en ${consultation.duration} minutos por WhatsApp!\n\n` +
      `Ahorré $${savings.vs_presencial} MXN vs consulta presencial\n` +
      `Receta válida en cualquier farmacia\n\n` +
      `Prueba doctor.mx: https://doctor.mx`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
    setTimeout(() => {
      setIsSharing(false)
      showSuccessToast('¡Gracias por compartir!')
    }, 1000)
  }

  const handleDownload = () => {
    // In production: generate PDF and download
    showSuccessToast('CFDI descargado')
  }

  const handleCopyLink = () => {
    const caseUrl = `https://doctor.mx/caso/${consultation.id}`
    navigator.clipboard.writeText(caseUrl)
    showSuccessToast('Enlace copiado al portapapeles')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header - Success State */}
        <div className="bg-gradient-to-br from-medical-500 to-medical-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Consulta Completada!</h2>
            <p className="text-white/90">Tu receta está lista y es válida</p>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="p-6 space-y-4">
          {/* Consultation Summary */}
          <div className="bg-ink-bg rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-ink-secondary">Folio</span>
              <span className="font-mono text-sm font-semibold text-ink-primary">{consultation.id}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-ink-secondary">Tipo</span>
              <span className="text-sm font-medium text-ink-primary">{consultation.type}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-ink-secondary">Duración</span>
              <span className="text-sm font-medium text-ink-primary">{consultation.duration}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-ink-secondary">Método de pago</span>
              <span className="text-sm font-medium text-ink-primary">{consultation.payment_method}</span>
            </div>
            <div className="border-t border-ink-border pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-ink-primary">Total</span>
                <span className="text-2xl font-bold text-medical-600">${consultation.amount} MXN</span>
              </div>
            </div>
          </div>

          {/* Savings Callout - VIRAL ELEMENT - Enhanced for maximum impact */}
          <div className="relative overflow-hidden bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl p-6 shadow-medical">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative">
              {/* Main savings amount - hero treatment */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center gap-2 mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm font-medium mb-1">
                  ¡Ahorraste!
                </p>
                <p className="text-white text-4xl font-bold tracking-tight mb-1">
                  ${savings.vs_presencial}
                </p>
                <p className="text-white/80 text-xs font-medium">
                  vs. consulta presencial tradicional
                </p>
              </div>

              {/* Comparison bars - visual impact */}
              <div className="space-y-2">
                {/* Emergency room comparison */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/90 text-xs font-medium">vs. Urgencias</span>
                    <span className="text-white font-bold text-sm">${savings.vs_er} MXN</span>
                  </div>
                  <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full animate-pulse" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-white text-xl font-bold">{consultation.duration}</p>
                  <p className="text-white/80 text-[10px] font-medium">Tiempo total</p>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <p className="text-white text-xl font-bold">100%</p>
                  <p className="text-white/80 text-[10px] font-medium">En línea</p>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <p className="text-white text-xl font-bold">24/7</p>
                  <p className="text-white/80 text-[10px] font-medium">Disponible</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-medical-100 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-medical-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-medium text-ink-secondary">NOM-004</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-medium text-ink-secondary">COFEPRIS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-medical-100 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-medical-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-ink-secondary">CFDI 4.0</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary CTA - Share */}
            <button
              onClick={handleWhatsAppShare}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 bg-medical-500 hover:bg-medical-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {isSharing ? 'Compartiendo...' : 'Compartir mi experiencia'}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-white border border-ink-border hover:bg-ink-bg text-ink-primary font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar CFDI
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 bg-white border border-ink-border hover:bg-ink-bg text-ink-primary font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar enlace
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-ink-secondary hover:text-ink-primary transition-colors py-2"
          >
            Cerrar
          </button>
        </div>

        {/* QR Code Section (for pharmacy validation) */}
        <div className="bg-ink-bg border-t border-ink-border p-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-white rounded-lg border-2 border-ink-border flex items-center justify-center">
              {/* In production: actual QR code */}
              <svg className="w-12 h-12 text-ink-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm11-2h3v3h-3v-3zm0 5h3v3h-3v-3zm5-5h3v3h-3v-3zm0 5h3v3h-3v-3z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-ink-primary">Válida en farmacias</p>
              <p className="text-[10px] text-ink-secondary">Muestra este código en mostrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
