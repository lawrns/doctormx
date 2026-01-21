'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ErrorState'
import { logger } from '@/lib/observability/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Root error boundary caught error', { 
      message: error.message, 
      digest: error.digest 
    })
  }, [error])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <ErrorState
        title="Algo salió mal"
        description="Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado."
        error={error}
        action={{
          label: 'Intentar de nuevo',
          onClick: () => reset(),
        }}
      />
    </div>
  )
}
