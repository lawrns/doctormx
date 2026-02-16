import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Precios y Planes | Doctor.mx para Médicos',
  description: 'Planes accesibles para médicos en Doctor.mx. Starter $499/mes, Pro $999/mes, Elite $1999/mes. Sin contratos, cancela cuando quieras. Incluye IA y videoconsultas.',
  keywords: ['precios telemedicina', 'planes médicos', 'suscripción doctor', 'telemedicina costo', 'software médico precio'],
  alternates: {
    canonical: 'https://doctor.mx/pricing',
  },
  openGraph: {
    title: 'Precios y Planes | Doctor.mx para Médicos',
    description: 'Planes accesibles para médicos. Starter $499/mes, Pro $999/mes, Elite $1999/mes. Sin contratos.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/pricing',
    siteName: 'Doctor.mx',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
