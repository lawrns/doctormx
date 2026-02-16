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
      title="Error al registrarse"
      error={error}
      reset={reset}
      variant="auth"
      context="Auth Register"
    />
  )
}
