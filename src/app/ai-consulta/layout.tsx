import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'

// I18N-007: Generate locale-aware metadata for AI consultation page
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSEOMetadata(
    {
      path: '/ai-consulta',
      title: locale === 'en'
        ? "AI Medical Consultation | Dr. Simeon - Doctor.mx"
        : "Consulta Médica con IA | Dr. Simeon - Doctor.mx",
      description: locale === 'en'
        ? "Consult for free with Dr. Simeon, our AI medical assistant. Get guidance on your symptoms and specialist recommendations in minutes."
        : "Consulta gratis con Dr. Simeon, nuestro asistente médico con IA. Obtén orientación sobre tus síntomas y recomendaciones de especialistas en minutos.",
      keywords: locale === 'en'
        ? "AI medical consultation, intelligent medical assistant, AI symptoms, medical guidance, Dr Simeon, free consultation"
        : "consulta médica IA, asistente médico inteligente, síntomas IA, orientación médica, Dr Simeon, consulta gratuita",
    },
    locale
  )
}

export default function AIConsultaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
