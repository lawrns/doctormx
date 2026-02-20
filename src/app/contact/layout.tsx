import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'

// I18N-007: Generate locale-aware metadata for contact page
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSEOMetadata(
    {
      path: '/contact',
      title: locale === 'en'
        ? "Contact | Doctor.mx"
        : "Contacto | Doctor.mx",
      description: locale === 'en'
        ? "Have questions? Contact us at Doctor.mx. We're here to help with technical support, billing or general information."
        : "¿Tienes preguntas? Contáctanos en Doctor.mx. Estamos aquí para ayudarte con soporte técnico, facturación o información general.",
      keywords: locale === 'en'
        ? "contact Doctor.mx, medical support, telemedicine help, customer service"
        : "contacto Doctor.mx, soporte médico, ayuda telemedicina, atención al cliente",
    },
    locale
  )
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
