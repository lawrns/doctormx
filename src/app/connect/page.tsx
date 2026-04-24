import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  AIProfileBuilderPreview,
  ConnectFinalCta,
  ConnectHero,
  DoctorTrustComplianceBlock,
  ProgressiveCompletionGrid,
  SuggestedProfileReview,
} from '@/components/connect'

export const metadata: Metadata = {
  title: 'Reclama tu perfil médico con IA | Doctor.mx',
  description: 'Busca tu práctica médica, revisa un perfil preparado con IA y publica tu perfil Doctor.mx con verificación profesional.',
}

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <Header />
      <ConnectHero />
      <AIProfileBuilderPreview />
      <SuggestedProfileReview />
      <DoctorTrustComplianceBlock />
      <ProgressiveCompletionGrid />
      <ConnectFinalCta />
      <Footer />
    </main>
  )
}
