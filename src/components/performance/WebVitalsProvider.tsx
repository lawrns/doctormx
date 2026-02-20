'use client'

/**
 * Web Vitals Provider Component
 * 
 * Initializes Web Vitals tracking and metrics flush in the browser.
 * Place this component in your root layout to track metrics across all pages.
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { WebVitalsProvider } from '@/components/performance/WebVitalsProvider'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitalsProvider />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

import { useEffect, useRef } from 'react'
import { initWebVitals, type WebVitalsConfig } from '@/lib/performance/web-vitals'
import { initMetrics } from '@/lib/observability/metrics'

export interface WebVitalsProviderProps {
  /** Enable debug logging */
  debug?: boolean
  /** Sample rate for sending metrics (0-1) */
  sampleRate?: number
  /** Custom endpoint URL */
  endpoint?: string
  /** Enable Sentry integration */
  enableSentry?: boolean
  /** Custom configuration */
  config?: Partial<WebVitalsConfig>
}

export function WebVitalsProvider({
  debug = process.env.NODE_ENV === 'development',
  sampleRate = 1.0,
  endpoint = '/api/metrics/web-vitals',
  enableSentry = true,
  config = {},
}: WebVitalsProviderProps) {
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initialized.current) return
    initialized.current = true

    // Initialize Web Vitals tracking
    const cleanupWebVitals = initWebVitals({
      debug,
      sampleRate,
      endpoint,
      enableSentry,
      ...config,
    })

    // Initialize metrics flush with cleanup
    const cleanupMetrics = initMetrics()

    // Cleanup on unmount
    return () => {
      cleanupWebVitals?.()
      cleanupMetrics?.()
    }
  }, [debug, sampleRate, endpoint, enableSentry, config])

  // This component doesn't render anything
  return null
}

export default WebVitalsProvider
