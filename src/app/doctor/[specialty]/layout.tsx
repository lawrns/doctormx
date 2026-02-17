import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doctores por Especialidad | Doctor.mx',
  description: 'Encuentra doctores especialistas en México. Filtra por especialidad médica y agenda tu consulta presencial o por videollamada.',
  keywords: ['doctores especialistas', 'médicos por especialidad', 'especialistas México', 'buscar doctor', 'telemedicina'],
  alternates: {
    canonical: 'https://doctor.mx/doctor',
  },
  openGraph: {
    title: 'Doctores por Especialidad | Doctor.mx',
    description: 'Encuentra doctores especialistas en México. Filtra por especialidad médica.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/doctor',
    siteName: 'Doctor.mx',
  },
}

export default function DoctorSpecialtyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
