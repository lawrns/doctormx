import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | Doctor.mx',
  description: 'Recupera el acceso a tu cuenta de Doctor.mx. Te enviaremos instrucciones para restablecer tu contraseña.',
  keywords: ['recuperar contraseña', 'olvidé contraseña', 'reset password', 'acceso cuenta'],
  alternates: {
    canonical: 'https://doctor.mx/auth/forgot-password',
  },
  openGraph: {
    title: 'Recuperar Contraseña | Doctor.mx',
    description: 'Recupera el acceso a tu cuenta de Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/auth/forgot-password',
    siteName: 'Doctor.mx',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
