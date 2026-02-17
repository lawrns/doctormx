import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¡Pago Exitoso! | Doctor.mx',
  description: 'Tu pago ha sido procesado exitosamente. Tu consulta médica ha sido confirmada.',
  keywords: ['pago exitoso', 'confirmación pago', 'consulta confirmada'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
