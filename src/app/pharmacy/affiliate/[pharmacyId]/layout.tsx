import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Detalle de Farmacia | Doctor.mx',
  description: 'Información de farmacia afiliada a Doctor.mx.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PharmacyDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
