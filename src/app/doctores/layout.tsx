import type { Metadata } from 'next'
import { DoctorsClientLayout } from './DoctorsClientLayout'

export const metadata: Metadata = {
  title: 'Doctores Verificados | Doctor.mx',
  description: 'Encuentra doctores verificados con cédula profesional en México. Filtra por especialidad, consulta disponibilidad y agenda videoconsultas o citas presenciales.',
  keywords: ['doctores verificados', 'médicos certificados', 'directorio médico México', 'buscar doctor', 'especialistas médicos', 'telemedicina'],
  alternates: {
    canonical: 'https://doctor.mx/doctores',
  },
  openGraph: {
    title: 'Doctores Verificados | Doctor.mx',
    description: 'Encuentra doctores verificados con cédula profesional en México. Filtra por especialidad y agenda tu consulta.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/doctores',
    siteName: 'Doctor.mx',
  },
}

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DoctorsClientLayout>{children}</DoctorsClientLayout>
}
