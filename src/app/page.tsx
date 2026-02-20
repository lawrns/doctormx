import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LandingPageClient } from '@/components/landing'
import { getLocale } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'
import { Metadata } from 'next'

// I18N-007: Generate locale-aware metadata for homepage
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSEOMetadata(
    {
      path: '/',
      title: locale === 'en' 
        ? "Doctor.mx | Telemedicine & Verified Doctors in Mexico | 24/7"
        : "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
      description: locale === 'en'
        ? "Online medical consultation with verified doctors in Mexico. Secure telemedicine, HD video consultations, and Dr. Simeon - your AI health assistant. Over 500 specialists available 24/7."
        : "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA. Más de 500 especialistas disponibles 24/7.",
      keywords: locale === 'en'
        ? "telemedicine Mexico, online doctors, virtual medical consultation, verified doctors Mexico, medical video consultation, Dr Simeon, digital health Mexico, online medical appointment, certified specialists, second medical opinion"
        : "telemedicina México, doctores en línea, consulta médica virtual, doctores verificados México, videoconsulta médica, Dr Simeon, salud digital México, cita médica en línea, especialistas certificados, segunda opinión médica",
    },
    locale
  )
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'doctor') {
      redirect('/doctor')
    } else if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/app')
    }
  }

  return <LandingPageClient />
}
