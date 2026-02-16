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
      title="Error al cargar página"
      error={error}
      reset={reset}
      variant="default"
      context="For Doctors"
    />
  )
}
