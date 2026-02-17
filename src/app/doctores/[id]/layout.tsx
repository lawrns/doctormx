import type { Metadata } from 'next'
import { getDoctorProfile } from '@/lib/discovery'
import { formatDoctorName } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const doctor = await getDoctorProfile(id)

  if (!doctor) {
    return {
      title: 'Doctor no encontrado | Doctor.mx',
      description: 'El perfil del doctor que buscas no existe o ha sido eliminado.',
    }
  }

  const doctorName = formatDoctorName(doctor.profile?.full_name)
  const specialties = doctor.specialties?.map(s => s.name).filter(Boolean).join(', ') || 'Especialista'
  const location = doctor.city ? `${doctor.city}, ${doctor.state}` : 'México'
  const price = doctor.price_cents 
    ? `$${(doctor.price_cents / 100).toLocaleString('es-MX')} MXN`
    : 'Consulta el precio'

  const title = `${doctorName} - ${specialties} | Doctor.mx`
  const description = `Agenda una consulta con ${doctorName}, ${specialties} en ${location}. ${price} por consulta. Videoconsulta disponible 24/7. Verificado por Doctor.mx.`

  return {
    title,
    description,
    keywords: [
      doctorName,
      specialties,
      `doctor ${location}`,
      'telemedicina',
      'consulta médica',
      'doctor verificado',
      ...(doctor.specialties?.map(s => s.name).filter((name): name is string => typeof name === 'string') || [])
    ],
    alternates: {
      canonical: `https://doctor.mx/doctores/${id}`,
    },
    openGraph: {
      title: `${doctorName} - ${specialties}`,
      description: `Agenda tu consulta con ${doctorName}. ${price} por consulta. Videoconsulta disponible.`,
      type: 'profile',
      locale: 'es_MX',
      url: `https://doctor.mx/doctores/${id}`,
      siteName: 'Doctor.mx',
      images: doctor.profile?.photo_url
        ? [
            {
              url: doctor.profile.photo_url,
              width: 400,
              height: 400,
              alt: `Foto de ${doctorName}`,
            },
          ]
        : undefined,
    },
  }
}

export default function DoctorProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
