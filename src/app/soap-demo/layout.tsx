import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo SOAP | Doctor.mx',
  description: 'Demostración de componentes UI para consulta SOAP multi-especialista.',
  keywords: ['SOAP', 'demo', 'interfaz médica', 'componentes UI', 'consulta médica'],
  alternates: {
    canonical: 'https://doctor.mx/soap-demo',
  },
  openGraph: {
    title: 'Demo SOAP | Doctor.mx',
    description: 'Demostración de componentes UI para consulta SOAP multi-especialista.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/soap-demo',
    siteName: 'Doctor.mx',
  },
}

export default function SOAPDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
