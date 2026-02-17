import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Completar Perfil | Doctor.mx',
  description: 'Completa tu perfil en Doctor.mx para comenzar a usar nuestra plataforma de telemedicina.',
  keywords: ['completar perfil', 'perfil médico', 'perfil paciente', 'configurar cuenta'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
