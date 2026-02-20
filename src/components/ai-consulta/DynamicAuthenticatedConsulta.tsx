/**
 * Dynamic import wrapper for Authenticated AI Consultation page
 * Lazy loads the heavy authenticated AI consultation component with skeleton fallback
 * 
 * PERF-004: Dynamic import for AI consultation client
 * This reduces initial bundle size by ~120KB by code-splitting the heavy UI components
 */

'use client'

import dynamic from 'next/dynamic'
import { AiConsultaAppSkeleton } from './AiConsultaAppSkeleton'

// Dynamic import of the heavy authenticated consultation component
// This splits the bundle and only loads the component when needed
const ConversationalAIConsultation = dynamic(
  () => import('@/components/soap/ConversationalAIConsultation').then((mod) => mod.ConversationalAIConsultation),
  {
    loading: () => <AiConsultaAppSkeleton />,
    ssr: true, // Allow SSR for better initial paint
  }
)

interface DynamicAuthenticatedConsultaProps {
  userId: string
}

export function DynamicAuthenticatedConsulta({ userId }: DynamicAuthenticatedConsultaProps) {
  return <ConversationalAIConsultation userId={userId} />
}
