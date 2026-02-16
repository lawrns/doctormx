'use client'

import { PatientLayout } from '@/components/PatientLayout'
import { useUser } from '@/hooks/useUser'

export function DoctorsClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useUser()
  
  if (isLoading) {
    return <div className="min-h-screen bg-neutral-50" />
  }
  
  if (user) {
    return <PatientLayout>{children}</PatientLayout>
  }
  
  return <>{children}</>
}
