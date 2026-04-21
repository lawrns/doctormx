'use client'

import { PatientLayout } from '@/components/PatientLayout'
import { useUser } from '@/hooks/useUser'

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <div className="min-h-screen bg-background" />
  }

  if (user) {
    return <PatientLayout>{children}</PatientLayout>
  }

  return <>{children}</>
}
