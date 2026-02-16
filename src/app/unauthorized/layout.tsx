import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'No Autorizado | Doctor.mx',
  description: 'No tienes permiso para acceder a esta página.',
  keywords: [],
  alternates: {
    canonical: 'https://doctor.mx',
  },
  openGraph: {
    title: 'No Autorizado | Doctor.mx',
    description: 'No tienes permiso para acceder a esta página.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx',
    siteName: 'Doctor.mx',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
