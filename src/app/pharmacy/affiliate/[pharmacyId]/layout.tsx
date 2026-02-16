import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Farmacia Afiliada | Doctor.mx',
  description: 'Perfil de farmacia afiliada en Doctor.mx.',
  keywords: ['farmacia', 'afiliada', 'recetas', 'medicamentos', 'farmacia online'],
  alternates: {
    canonical: 'https://doctor.mx/pharmacy',
  },
  openGraph: {
    title: 'Farmacia Afiliada | Doctor.mx',
    description: 'Perfil de farmacia afiliada en Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/pharmacy',
    siteName: 'Doctor.mx',
  },
}

export default function PharmacyAffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
