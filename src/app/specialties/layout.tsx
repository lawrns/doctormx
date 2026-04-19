import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Especialidades Medicas en Mexico | Doctor.mx',
  description:
    'Directorio completo de especialidades medicas. Cardiologia, neurologia, dermatologia, pediatria y mas. Encuentra doctores por especialidad en Doctor.mx.',
  keywords:
    'especialidades medicas, cardiologia, neurologia, dermatologia, pediatria, doctores Mexico',
  alternates: { canonical: 'https://doctor.mx/specialties' },
  openGraph: {
    title: 'Especialidades Medicas en Mexico | Doctor.mx',
    description:
      'Directorio completo de especialidades medicas. Encuentra doctores por especialidad.',
    url: 'https://doctor.mx/specialties',
  },
}

export default function SpecialtiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
