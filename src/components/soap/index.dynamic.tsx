/**
 * Dynamic imports for SOAP components
 * 
 * These components use framer-motion extensively and are heavy.
 * Use these dynamic versions for pages where initial load time is critical.
 */

import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'

// Loading placeholder
const SoapPlaceholder = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-50 animate-pulse rounded-lg ${className}`} />
)

// Dynamic imports for heavy SOAP components
export const DynamicSpecialistConsultation = dynamic(
  () => import('./SpecialistConsultation').then(mod => ({ default: mod.SpecialistConsultation })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-96" />
  }
)

export const DynamicConsensusMatrix = dynamic(
  () => import('./ConsensusMatrix').then(mod => ({ default: mod.ConsensusMatrix })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-64" />
  }
)

export const DynamicSOAPTimeline = dynamic(
  () => import('./SOAPTimeline').then(mod => ({ default: mod.SOAPTimeline })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-24" />
  }
)

export const DynamicConsultationProgress = dynamic(
  () => import('./ConsultationProgress').then(mod => ({ default: mod.ConsultationProgress })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-32" />
  }
)

export const DynamicSOAPDemo = dynamic(
  () => import('./SOAPDemo').then(mod => ({ default: mod.SOAPDemo })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[800px] bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando demo...</p>
        </div>
      </div>
    )
  }
)

export const DynamicRecommendedDoctors = dynamic(
  () => import('./RecommendedDoctors').then(mod => ({ default: mod.RecommendedDoctors })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-64" />
  }
)

export const DynamicSOAPNotesReview = dynamic(
  () => import('./SOAPNotesReview').then(mod => ({ default: mod.SOAPNotesReview })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-96" />
  }
)

export const DynamicTreatmentPlanDisplay = dynamic(
  () => import('./TreatmentPlanDisplay').then(mod => ({ default: mod.TreatmentPlanDisplay })),
  { 
    ssr: false,
    loading: () => <SoapPlaceholder className="h-64" />
  }
)

// Helper component for wrapping in Suspense
export function WithSoapSuspense({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <Suspense fallback={fallback || <SoapPlaceholder className="h-64" />}>
      {children}
    </Suspense>
  )
}
