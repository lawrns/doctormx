import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'

// I18N-007: Generate locale-aware metadata for pricing page
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSEOMetadata(
    {
      path: '/pricing',
      title: locale === 'en'
        ? "Pricing and Plans | Doctor.mx for Doctors"
        : "Precios y Planes | Doctor.mx para Médicos",
      description: locale === 'en'
        ? "Affordable plans for doctors on Doctor.mx. Starter $499/mo, Pro $999/mo, Elite $1999/mo. No contracts, cancel anytime. Includes AI and video consultations."
        : "Planes accesibles para médicos en Doctor.mx. Starter $499/mes, Pro $999/mes, Elite $1999/mes. Sin contratos, cancela cuando quieras. Incluye IA y videoconsultas.",
      keywords: locale === 'en'
        ? "telemedicine pricing, medical plans, doctor subscription, telemedicine cost, medical software pricing, healthcare technology"
        : "precios telemedicina, planes médicos, suscripción doctor, telemedicina costo, software médico precio, tecnología médica",
    },
    locale
  )
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
