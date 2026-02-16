import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto | Doctor.mx',
  description: '¿Tienes preguntas? Contáctanos en Doctor.mx. Estamos aquí para ayudarte con soporte técnico, facturación o información general.',
  keywords: ['contacto Doctor.mx', 'soporte médico', 'ayuda telemedicina', 'atención al cliente'],
  alternates: {
    canonical: 'https://doctor.mx/contact',
  },
  openGraph: {
    title: 'Contacto | Doctor.mx',
    description: '¿Tienes preguntas? Contáctanos. Estamos aquí para ayudarte.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/contact',
    siteName: 'Doctor.mx',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
