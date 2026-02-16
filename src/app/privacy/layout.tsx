import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Doctor.mx',
  description: 'Conoce cómo Doctor.mx protege tu información personal y médica. Cumplimos con la LFPDPPP y utilizamos encriptación de extremo a extremo.',
  keywords: ['política de privacidad', 'protección de datos médicos', 'LFPDPPP', 'seguridad telemedicina', 'privacidad salud'],
  alternates: {
    canonical: 'https://doctor.mx/privacy',
  },
  openGraph: {
    title: 'Política de Privacidad | Doctor.mx',
    description: 'Conoce cómo protegemos tu información personal y médica.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/privacy',
    siteName: 'Doctor.mx',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
