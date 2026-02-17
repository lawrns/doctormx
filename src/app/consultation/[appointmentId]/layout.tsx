import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sala de Consulta | Doctor.mx',
  description: 'Accede a tu consulta médica virtual. Videoconsulta en HD con doctores verificados de México.',
  keywords: ['videoconsulta', 'consulta online', 'sala consulta', 'videollamada médica'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
