import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Administración | Doctor.mx',
  description: 'Panel de administración para gestionar doctores, usuarios y contenido de la plataforma.',
  keywords: ['administración', 'panel admin', 'gestión doctores', 'admin Doctor.mx'],
  alternates: {
    canonical: 'https://doctor.mx/admin',
  },
  openGraph: {
    title: 'Panel de Administración | Doctor.mx',
    description: 'Panel de administración para gestionar doctores, usuarios y contenido.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/admin',
    siteName: 'Doctor.mx',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
