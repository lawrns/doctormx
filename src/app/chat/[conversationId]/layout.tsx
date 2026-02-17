import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat | Doctor.mx',
  description: 'Comunícate con tu doctor o paciente de forma segura a través de nuestro chat encriptado.',
  keywords: ['chat médico', 'mensajería segura', 'comunicación doctor paciente'],
  robots: {
    index: false,
    follow: false,
  },
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
