import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Farmacias Afiliadas | Doctor.mx',
  description: 'Encuentra farmacias afiliadas a Doctor.mx. Localiza medicamentos y servicios farmacéuticos cerca de ti.',
  keywords: ['farmacias afiliadas', 'medicamentos', 'farmacia online', 'recetas médicas'],
  alternates: {
    canonical: 'https://doctor.mx/pharmacy/affiliate',
  },
  openGraph: {
    title: 'Farmacias Afiliadas | Doctor.mx',
    description: 'Encuentra farmacias afiliadas a Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/pharmacy/affiliate',
    siteName: 'Doctor.mx',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function PharmacyAffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
