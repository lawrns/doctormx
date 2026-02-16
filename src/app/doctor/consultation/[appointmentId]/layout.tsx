import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consulta Médica | Doctor.mx',
  description: 'Panel de consulta médica para doctores en Doctor.mx.',
  keywords: ['consulta médica', 'telemedicina', 'doctor online', 'videoconsulta'],
  alternates: {
    canonical: 'https://doctor.mx/doctor',
  },
  openGraph: {
    title: 'Consulta Médica | Doctor.mx',
    description: 'Panel de consulta médica para doctores.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/doctor',
    siteName: 'Doctor.mx',
  },
}

export default function DoctorConsultationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
