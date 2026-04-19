import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog de Salud | Doctor.mx',
  description:
    'Articulos de salud y bienestar escritos por profesionales medicos. Prevencion, tratamientos, nutricion y mas. Tu fuente de informacion de salud en Mexico.',
  keywords: 'blog de salud, articulos medicos, bienestar, prevencion, Doctor.mx',
  alternates: { canonical: 'https://doctor.mx/blog' },
  openGraph: {
    title: 'Blog de Salud | Doctor.mx',
    description:
      'Articulos de salud y bienestar escritos por profesionales medicos.',
    url: 'https://doctor.mx/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
