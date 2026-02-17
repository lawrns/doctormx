import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Doctor.mx',
  description: 'Inicia sesión en Doctor.mx para acceder a tus consultas médicas, citas y historial. Plataforma segura de telemedicina en México.',
  keywords: ['login Doctor.mx', 'iniciar sesión', 'acceso pacientes', 'acceso doctores', 'telemedicina login'],
  alternates: {
    canonical: 'https://doctor.mx/auth/login',
  },
  openGraph: {
    title: 'Iniciar Sesión | Doctor.mx',
    description: 'Accede a tu cuenta de Doctor.mx. Consultas médicas en línea con doctores verificados.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/auth/login',
    siteName: 'Doctor.mx',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
