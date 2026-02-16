import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Especialidades Médicas | Doctor.mx',
  description: 'Encuentra especialistas en cardiología, dermatología, pediatría, neurología y más. Médicos verificados disponibles 24/7 con videoconsultas inmediatas.',
  keywords: ['especialidades médicas', 'doctores especialistas', 'telemedicina', 'médicos online', 'cardiología', 'dermatología', 'pediatría', 'neurología', 'ginecología'],
  alternates: {
    canonical: 'https://doctor.mx/specialties',
  },
  openGraph: {
    title: 'Especialidades Médicas | Doctor.mx',
    description: 'Encuentra especialistas en cardiología, dermatología, pediatría y más. Médicos verificados disponibles 24/7.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/specialties',
    siteName: 'Doctor.mx',
  },
}

export default function SpecialtiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
