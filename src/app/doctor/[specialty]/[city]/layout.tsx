import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doctores por Especialidad y Ciudad | Doctor.mx',
  description: 'Encuentra doctores verificados por especialidad y ciudad en México.',
  keywords: ['doctores por especialidad', 'médicos por ciudad', 'especialistas México', 'doctores verificados'],
  alternates: {
    canonical: 'https://doctor.mx/doctor',
  },
  openGraph: {
    title: 'Doctores por Especialidad y Ciudad | Doctor.mx',
    description: 'Encuentra doctores verificados por especialidad y ciudad en México.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/doctor',
    siteName: 'Doctor.mx',
  },
}

export default function DoctorSpecialtyCityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
