import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago Exitoso | Doctor.mx',
  description: 'Confirmación de pago exitoso en Doctor.mx.',
  keywords: ['pago exitoso', 'confirmación pago', 'transacción completada'],
  alternates: {
    canonical: 'https://doctor.mx/payment-success',
  },
  openGraph: {
    title: 'Pago Exitoso | Doctor.mx',
    description: 'Confirmación de pago exitoso en Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
    url: 'https://doctor.mx/payment-success',
    siteName: 'Doctor.mx',
  },
}

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
