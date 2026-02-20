/**
 * Dynamic import wrapper for Anonymous AI Consultation page
 * Lazy loads the heavy AI consultation component with skeleton fallback
 * 
 * PERF-004: Dynamic import for AI consultation client
 * This reduces initial bundle size by ~150KB by code-splitting the heavy UI components
 */

'use client'

import dynamic from 'next/dynamic'
import { AiConsultaSkeleton } from './AiConsultaSkeleton'

// Dynamic import of the heavy anonymous consultation component
// This splits the bundle and only loads when the route is accessed
const AnonymousConsultaPage = dynamic(
  () => import('@/app/ai-consulta/AnonymousConsultaClient').then((mod) => mod.default),
  {
    loading: () => <AiConsultaSkeleton />,
    ssr: false, // Client-side only to avoid hydration issues with localStorage
  }
)

export function DynamicAnonymousConsulta() {
  return <AnonymousConsultaPage />
}
