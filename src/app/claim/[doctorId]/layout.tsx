import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reclamar Perfil Médico | Doctor.mx',
  description: 'Verifica y reclama tu perfil médico en Doctor.mx. Gestiona tu presencia profesional y recibe pacientes en línea.',
  keywords: ['reclamar perfil médico', 'verificar doctor', 'perfil médico', 'Doctor.mx médicos'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
