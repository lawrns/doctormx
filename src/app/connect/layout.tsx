import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reclama tu perfil médico con IA | Doctor.mx',
  description:
    'Busca tu práctica médica, revisa un perfil preparado con IA y publica tu perfil Doctor.mx con verificación profesional.',
}

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
