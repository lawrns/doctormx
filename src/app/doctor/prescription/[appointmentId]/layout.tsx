import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Receta Digital | Doctor.mx',
  description: 'Creación y gestión de recetas digitales para pacientes.',
  keywords: ['receta digital', 'prescripción', 'receta electrónica', 'medicamentos'],
  alternates: {
    canonical: 'https://doctor.mx/doctor/prescription',
  },
  openGraph: {
    title: 'Receta Digital | Doctor.mx',
    description: 'Creación y gestión de recetas digitales para pacientes.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/doctor/prescription',
    siteName: 'Doctor.mx',
  },
}

export default function DoctorPrescriptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
