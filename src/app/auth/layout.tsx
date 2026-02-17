import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación | Doctor.mx',
  description: 'Inicia sesión o regístrate en Doctor.mx. Accede a consultas médicas en línea con doctores verificados en México.',
  keywords: ['login Doctor.mx', 'registro médico', 'acceso pacientes', 'autenticación', 'iniciar sesión'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
