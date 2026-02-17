import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Doctor.mx',
  description: 'Regístrate en Doctor.mx como paciente o médico. Accede a consultas médicas en línea con doctores verificados en México.',
  keywords: ['registro Doctor.mx', 'crear cuenta', 'registro médico', 'registro paciente', 'unirse Doctor.mx'],
  alternates: {
    canonical: 'https://doctor.mx/auth/register',
  },
  openGraph: {
    title: 'Crear Cuenta | Doctor.mx',
    description: 'Únete a Doctor.mx. Regístrate como paciente para consultas médicas o como médico para ofrecer tus servicios.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/auth/register',
    siteName: 'Doctor.mx',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
