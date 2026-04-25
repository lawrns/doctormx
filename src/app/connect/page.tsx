'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  AIProfileBuilderPreview,
  ConnectFinalCta,
  ConnectHero,
  ConnectOnboardingPreview,
  ConnectReferralBanner,
  DoctorTrustComplianceBlock,
  ProgressiveCompletionGrid,
  SuggestedProfileReview,
} from '@/components/connect'

function ConnectPageContent() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref') || ''

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <Header />
      <ConnectReferralBanner referralCode={referralCode} />
      <ConnectHero />
      <AIProfileBuilderPreview />
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
        <main className="min-h-screen bg-[#f4f7fb]">
          <Header />
          <div className="editorial-shell py-24">
            <div className="mx-auto max-w-md text-center">
              <div className="h-4 w-3/5 animate-pulse rounded bg-[#dce9ff] mx-auto" />
              <div className="mt-4 h-3 w-4/5 animate-pulse rounded bg-[#eef5ff] mx-auto" />
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <ConnectPageContent />
    </Suspense>
  )
}
