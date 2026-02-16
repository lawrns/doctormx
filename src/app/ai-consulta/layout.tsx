import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consulta Médica con IA | Dr. Simeon - Doctor.mx',
  description: 'Consulta gratis con Dr. Simeon, nuestro asistente médico con IA. Obtén orientación sobre tus síntomas y recomendaciones de especialistas en minutos.',
  keywords: ['consulta médica IA', 'asistente médico inteligente', 'síntomas IA', 'orientación médica', 'Dr Simeon', 'consulta gratuita'],
  alternates: {
    canonical: 'https://doctor.mx/ai-consulta',
  },
  openGraph: {
    title: 'Consulta Médica con IA | Dr. Simeon - Doctor.mx',
    description: 'Consulta gratis con Dr. Simeon. Obtén orientación sobre tus síntomas y recomendaciones de especialistas.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/ai-consulta',
    siteName: 'Doctor.mx',
  },
}

export default function AIConsultaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
