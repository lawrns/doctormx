'use client'

import { Link2, Check } from 'lucide-react'
import { useState } from 'react'

export default function ShareProfileButton({ doctorId }: { doctorId: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const handleShare = async () => {
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
    <button
      onClick={handleShare}
      disabled={copyState !== 'idle'}
      className="bg-white p-4 rounded-lg shadow-sm border border-border hover:shadow-md hover:border-primary-200 transition-all duration-150 flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[72px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:border-border"
      aria-live="polite"
      aria-label={copyState === 'copied' ? 'Enlace de perfil copiado' : 'Copiar enlace de perfil'}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150 ${
        copyState === 'copied'
          ? 'bg-success/10'
          : copyState === 'error'
          ? 'bg-destructive/10'
          : 'bg-primary/50 group-hover:bg-primary/100'
      }`}>
        {copyState === 'copied' ? (
          <Check className="w-5 h-5 text-success" aria-hidden="true" />
        ) : copyState === 'error' ? (
          <Link2 className="w-5 h-5 text-destructive" aria-hidden="true" />
        ) : (
          <Link2 className="w-5 h-5 text-primary" aria-hidden="true" />
        )}
      </div>
      <span className="text-sm font-medium text-text-primary">
        {copyState === 'copied' ? '¡Copiado!' : copyState === 'error' ? 'Error' : 'Compartir perfil'}
      </span>
    </button>
  )
}
