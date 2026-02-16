import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Para Médicos | Doctor.mx - Plataforma de Telemedicina',
  description: 'Únete a Doctor.mx y expande tu práctica médica. Agenda inteligente, videoconsultas HD, pagos seguros y análisis de IA. Más de 500 doctores activos.',
  keywords: ['trabajo para médicos', 'plataforma médica', 'telemedicina México', 'consulta online', 'software médico', 'agenda médica digital'],
  alternates: {
    canonical: 'https://doctor.mx/for-doctors',
  },
  openGraph: {
    title: 'Para Médicos | Doctor.mx - Plataforma de Telemedicina',
    description: 'Únete a Doctor.mx y expande tu práctica médica. Agenda inteligente, videoconsultas HD y pagos seguros.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/for-doctors',
    siteName: 'Doctor.mx',
  },
}

export default function ForDoctorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
