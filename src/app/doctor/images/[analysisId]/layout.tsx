import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Análisis de Imágenes | Doctor.mx',
  description: 'Revisión de análisis de imágenes médicas con IA.',
  keywords: ['análisis imágenes', 'IA médica', 'radiología', 'diagnóstico por imagen'],
  alternates: {
    canonical: 'https://doctor.mx/doctor/images',
  },
  openGraph: {
    title: 'Análisis de Imágenes | Doctor.mx',
    description: 'Revisión de análisis de imágenes médicas con IA.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/doctor/images',
    siteName: 'Doctor.mx',
  },
}

export default function DoctorImageAnalysisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
