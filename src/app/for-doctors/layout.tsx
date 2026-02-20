import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'

// I18N-007: Generate locale-aware metadata for for-doctors page
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSEOMetadata(
    {
      path: '/for-doctors',
      title: locale === 'en'
        ? "For Doctors | Doctor.mx - Telemedicine Platform"
        : "Para Médicos | Doctor.mx - Plataforma de Telemedicina",
      description: locale === 'en'
        ? "Join Doctor.mx and expand your medical practice. Smart scheduling, HD video consultations, secure payments and AI analysis. Over 500 active doctors."
        : "Únete a Doctor.mx y expande tu práctica médica. Agenda inteligente, videoconsultas HD, pagos seguros y análisis de IA. Más de 500 doctores activos.",
      keywords: locale === 'en'
        ? "doctor jobs, medical platform, telemedicine, online consultation, medical software, digital medical agenda"
        : "trabajo para médicos, plataforma médica, telemedicina México, consulta online, software médico, agenda médica digital",
    },
    locale
  )
}

export default function ForDoctorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
