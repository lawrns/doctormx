import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Completar Pago | Doctor.mx',
  description: 'Completa el pago de tu consulta médica de forma segura. Aceptamos tarjetas de crédito, débito y otros métodos de pago.',
  keywords: ['pago consulta médica', 'pago seguro', 'checkout Doctor.mx', 'pagar consulta'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
