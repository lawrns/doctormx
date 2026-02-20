/**
 * Performance Components
 * 
 * Components for monitoring and optimizing application performance.
 */

export { WebVitalsProvider } from './WebVitalsProvider'
export type { WebVitalsProviderProps } from './WebVitalsProvider'

// OBS-002: Next.js Web Vitals Reporter using useReportWebVitals hook
export { WebVitalsReporter } from './WebVitalsReporter'
export type { WebVitalsReporterProps } from './WebVitalsReporter'

// OBS-002: Web Vitals Dashboard for viewing metrics
export { WebVitalsDashboard } from './WebVitalsDashboard'
export type { WebVitalsDashboardProps, WebVitalsMetricData } from './WebVitalsDashboard'
