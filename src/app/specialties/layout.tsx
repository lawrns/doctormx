import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'

// I18N-007: Generate locale-aware metadata for specialties page
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSEOMetadata(
    {
      path: '/specialties',
      title: locale === 'en'
        ? "Medical Specialties | Verified Specialists | Doctor.mx"
        : "Especialidades Médicas | Especialistas Verificados | Doctor.mx",
      description: locale === 'en'
        ? "Find specialists in cardiology, dermatology, pediatrics, neurology and more. Verified doctors available 24/7 with immediate video consultations."
        : "Encuentra especialistas en cardiología, dermatología, pediatría, neurología y más. Médicos verificados disponibles 24/7 con videoconsultas inmediatas.",
      keywords: locale === 'en'
        ? "medical specialties, specialist doctors, cardiology, dermatology, pediatrics, neurology, gynecology, online medical consultation"
        : "especialidades médicas, doctores especialistas, cardiología, dermatología, pediatría, neurología, ginecología, telemedicina",
    },
    locale
  )
}

export default function SpecialtiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
