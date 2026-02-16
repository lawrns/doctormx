import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Asistente de Búsqueda | Doctor.mx',
  description: 'Encuentra al doctor perfecto para ti con nuestro asistente inteligente de búsqueda.',
  keywords: ['asistente búsqueda', 'encontrar doctor', 'buscador médicos', 'IA médica'],
  alternates: {
    canonical: 'https://doctor.mx/assistant',
  },
  openGraph: {
    title: 'Asistente de Búsqueda | Doctor.mx',
    description: 'Encuentra al doctor perfecto para ti con nuestro asistente inteligente.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/assistant',
    siteName: 'Doctor.mx',
  },
}

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
