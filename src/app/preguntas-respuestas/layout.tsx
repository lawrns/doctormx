import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas y Respuestas Medicas | Doctor.mx',
  description:
    'Haz preguntas de salud y recibe respuestas de doctores certificados. Consulta preguntas frecuentes sobre enfermedades, tratamientos y bienestar.',
  keywords:
    'preguntas medicas, consulta medica en linea, respuestas doctores, salud Mexico',
  alternates: { canonical: 'https://doctor.mx/preguntas-respuestas' },
  openGraph: {
    title: 'Preguntas y Respuestas Medicas | Doctor.mx',
    description:
      'Haz preguntas de salud y recibe respuestas de doctores certificados.',
    url: 'https://doctor.mx/preguntas-respuestas',
  },
}

export default function PreguntasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
