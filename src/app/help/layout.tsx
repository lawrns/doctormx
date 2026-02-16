import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centro de Ayuda | Doctor.mx',
  description: 'Encuentra respuestas a tus preguntas sobre Doctor.mx. Guías de uso, preguntas frecuentes y soporte para pacientes y médicos.',
  keywords: ['ayuda Doctor.mx', 'preguntas frecuentes', 'FAQ telemedicina', 'soporte', 'guía de uso'],
  alternates: {
    canonical: 'https://doctor.mx/help',
  },
  openGraph: {
    title: 'Centro de Ayuda | Doctor.mx',
    description: 'Encuentra respuestas a tus preguntas sobre Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/help',
    siteName: 'Doctor.mx',
  },
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
