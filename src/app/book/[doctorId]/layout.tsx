import type { Metadata } from 'next'
import { getDoctorProfile } from '@/lib/discovery'
import { formatDoctorName } from '@/lib/utils'

interface Props {
  params: Promise<{ doctorId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doctorId } = await params
  const doctor = await getDoctorProfile(doctorId)

  if (!doctor) {
    return {
      title: 'Agendar Cita | Doctor.mx',
      description: 'Agenda tu consulta médica en línea con doctores verificados en Doctor.mx.',
    }
  }

  const doctorName = formatDoctorName(doctor.profile?.full_name)
  const specialties = doctor.specialties?.map(s => s.name).join(', ') ?? 'Especialista'

  return {
    title: `Agendar con ${doctorName} | Doctor.mx`,
    description: `Agenda tu consulta con ${doctorName}, ${specialties}. Selecciona fecha, hora y tipo de consulta. Videoconsulta o presencial.`,
    keywords: [
      'agendar cita',
      `consulta ${doctorName}`,
      'reservar consulta',
      'cita médica online',
      'videoconsulta',
    ],
    alternates: {
      canonical: `https://doctor.mx/book/${doctorId}`,
    },
    openGraph: {
      title: `Agendar con ${doctorName} | Doctor.mx`,
      description: `Reserva tu consulta con ${doctorName}, ${specialties}.`,
      type: 'website',
      locale: 'es_MX',
      url: `https://doctor.mx/book/${doctorId}`,
      siteName: 'Doctor.mx',
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
