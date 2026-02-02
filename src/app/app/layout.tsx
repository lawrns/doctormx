import { PatientLayout } from '@/components/PatientLayout'
import { AppBreadcrumbs } from '@/components/AppBreadcrumbs'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PatientLayout>
      <AppBreadcrumbs />
      {children}
    </PatientLayout>
  )
}
