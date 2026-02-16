import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Doctor.mx',
  description: 'Lee los términos y condiciones de uso de Doctor.mx. Información importante sobre nuestros servicios de telemedicina y consultas médicas en línea.',
  keywords: ['términos y condiciones', 'aviso legal', 'condiciones de uso', 'telemedicina legal México'],
  alternates: {
    canonical: 'https://doctor.mx/terms',
  },
  openGraph: {
    title: 'Términos y Condiciones | Doctor.mx',
    description: 'Lee los términos y condiciones de uso de Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/terms',
    siteName: 'Doctor.mx',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
