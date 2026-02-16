import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Videoconsulta | Doctor.mx',
  description: 'Videoconsulta médica segura en alta definición.',
  keywords: ['videoconsulta', 'videollamada médica', 'consulta online', 'telemedicina'],
  alternates: {
    canonical: 'https://doctor.mx/appointments',
  },
  openGraph: {
    title: 'Videoconsulta | Doctor.mx',
    description: 'Videoconsulta médica segura en alta definición.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/appointments',
    siteName: 'Doctor.mx',
  },
}

export default function VideoConsultationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
