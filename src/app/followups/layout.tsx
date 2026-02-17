import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis Seguimientos Médicos | Doctor.mx',
  description: 'Revisa el estado de tus seguimientos médicos post-consulta. Monitorea tu recuperación y mantente en contacto con tu doctor.',
  keywords: ['seguimiento médico', 'post-consulta', 'monitoreo recuperación', 'salud continua'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function FollowupsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
