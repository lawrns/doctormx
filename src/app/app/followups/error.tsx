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
      title="Error en seguimientos"
      error={error}
      reset={reset}
      variant="patient"
      context="Patient Followups"
    />
  )
}
