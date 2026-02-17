import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso No Autorizado | Doctor.mx',
  description: 'No tienes permiso para acceder a esta página.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
