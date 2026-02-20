import { DynamicAnonymousConsulta } from '@/components/ai-consulta/DynamicAnonymousConsulta'

/**
 * Anonymous AI Consultation Page
 * 
 * PERF-004: Uses dynamic import for the heavy AI consultation component
 * The AnonymousConsultaPage component is lazy-loaded with a skeleton fallback
 * This reduces initial JS bundle by ~150KB and improves Time to Interactive
 */
export default function AIConsultaPage() {
  return <DynamicAnonymousConsulta />
}
