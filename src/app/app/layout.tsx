import { PatientLayout } from '@/components/PatientLayout'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PatientLayout>{children}</PatientLayout>
}
