'use client'

import { ErrorPage } from '@/components/ui/error/ErrorPage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      title="Error en el panel de administración"
      error={error}
      reset={reset}
      variant="admin"
      context="Admin"
    />
  )
}
