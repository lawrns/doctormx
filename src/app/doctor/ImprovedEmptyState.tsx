'use client'

import Link from 'next/link'
import { Calendar, Plus, Check } from 'lucide-react'
import { useState } from 'react'

export default function ImprovedEmptyState({ doctorId, doctor }: { doctorId: string; doctor: any }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://doctor.mx/doctors/${doctorId}`)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 3000)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 3000)
    }
  }

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 relative border border-primary/10">
        <Calendar className="w-10 h-10 text-primary/40" aria-hidden="true" />
        <Plus className="w-6 h-6 text-primary/30 absolute -bottom-1 -right-1" aria-hidden="true" />
      </div>
      <h4 className="text-lg font-semibold text-text-primary mb-2">No tienes consultas programadas</h4>
      <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
        Completa tu perfil y comparte tu enlace para que los pacientes te encuentren
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/doctor/profile"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]"
        >
          Completar mi perfil →
        </Link>
        <button
          onClick={handleCopyProfileLink}
          disabled={copyState !== 'idle'}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-live="polite"
          aria-label={copyState === 'copied' ? 'Enlace copiado al portapapeles' : 'Copiar enlace de perfil'}
        >
          {copyState === 'copied' ? (
            <>
              <Check className="w-4 h-4 text-success" aria-hidden="true" />
              <span>¡Copiado!</span>
            </>
          ) : copyState === 'error' ? (
            <>
              <span>Error al copiar</span>
            </>
          ) : (
            <>Copiar enlace de mi perfil</>
          )}
        </button>
      </div>
      <p className="text-xs text-text-muted mt-6 bg-accent/30 inline-block px-3 py-1.5 rounded-full">
        💡 Consejo: Comparte tu enlace en WhatsApp y redes sociales para recibir tus primeros pacientes
      </p>
    </div>
  )
}
