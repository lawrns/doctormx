'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  ConnectFinalCta,
  ConnectOnboardingPreview,
  ConnectReferralBanner,
  DoctorTrustComplianceBlock,
  ProgressiveCompletionGrid,
  SuggestedProfileReview,
} from '@/components/connect'
import { PracticeSearchPanel } from '@/components/connect/PracticeSearchPanel'

function ConnectPageContent() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref') || ''

  return (
    <main className="min-h-screen bg-muted/30">
      <Header />
      <ConnectReferralBanner referralCode={referralCode} />

      {/* Integrated Hero + AI Builder */}
      <section className="relative overflow-hidden border-b border-[#d8e3f6] bg-[#eef5ff]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-18rem] top-[-20rem] h-[34rem] w-[34rem] rounded-full bg-[#0d72d6]/8 blur-3xl" />
          <div className="absolute right-[-12rem] top-[-18rem] h-[30rem] w-[30rem] rounded-full bg-white/70 blur-3xl" />
        </div>

        <div className="editorial-shell relative pb-8 pt-24 md:pb-10 md:pt-28 lg:pb-12">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,520px)] lg:items-center lg:gap-8">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-[6px] border border-[hsl(var(--interactive)/0.3)] bg-white/84 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--interactive))] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <Sparkles className="h-3.5 w-3.5" />
                Doctor Connect
              </div>

              <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.15rem,3.8vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-[hsl(var(--ink))]">
                Encuentra tu perfil médico existente y publícalo en Doctor.mx en 2 minutos.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[hsl(var(--ink-soft))] md:text-base">
                La IA busca tu práctica, prepara un borrador editable y tú confirmas antes de publicar. Sin llenar formularios desde cero.
              </p>
            </div>

            <div id="connect-search" className="min-w-0 scroll-mt-28 lg:justify-self-end">
              <PracticeSearchPanel className="w-full lg:max-w-[520px]" />
            </div>
          </div>
        </div>
      </section>

      <SuggestedProfileReview />
      <ConnectOnboardingPreview />
      <DoctorTrustComplianceBlock />
      <ProgressiveCompletionGrid />
      <ConnectFinalCta />
      <Footer />
    </main>
  )
}

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-muted/30">
          <Header />
          <div className="editorial-shell py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--interactive))] mx-auto" />
            <p className="mt-3 text-sm text-[hsl(var(--ink-soft))]">Buscando perfiles médicos...</p>
          </div>
          <Footer />
        </main>
      }
    >
      <ConnectPageContent />
    </Suspense>
  )
}
