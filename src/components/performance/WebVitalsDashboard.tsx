'use client'

/**
 * Web Vitals Dashboard Component
 * 
 * Displays Core Web Vitals metrics in a visual dashboard.
 * Used in admin panel to monitor site performance.
 * 
 * @see https://web.dev/vitals/
 */

import { useEffect, useState } from 'react'
import { 
  Activity, 
  Zap, 
  Clock, 
  Eye, 
  MousePointer,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react'

export interface WebVitalsMetricData {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  entries?: PerformanceEntryList
  timestamp?: string
  pagePath?: string
}

export interface WebVitalsDashboardProps {
  /** Initial metrics data */
  initialMetrics?: WebVitalsMetricData[]
  /** Refresh interval in milliseconds */
  refreshInterval?: number
  /** Enable auto-refresh */
  autoRefresh?: boolean
}

interface MetricConfig {
  name: string
  label: string
  description: string
  unit: string
  icon: React.ReactNode
  thresholds: {
    good: number
    poor: number
  }
}

const METRICS_CONFIG: Record<string, MetricConfig> = {
  CLS: {
    name: 'CLS',
    label: 'Cumulative Layout Shift',
    description: 'Visual stability - measures unexpected layout shifts',
    unit: '',
    icon: <Eye className="w-5 h-5" />,
    thresholds: { good: 0.1, poor: 0.25 },
  },
  FCP: {
    name: 'FCP',
    label: 'First Contentful Paint',
    description: 'Time until first content is painted',
    unit: 'ms',
    icon: <Zap className="w-5 h-5" />,
    thresholds: { good: 1800, poor: 3000 },
  },
  LCP: {
    name: 'LCP',
    label: 'Largest Contentful Paint',
    description: 'Time until largest content element is painted',
    unit: 'ms',
    icon: <Activity className="w-5 h-5" />,
    thresholds: { good: 2500, poor: 4000 },
  },
  TTFB: {
    name: 'TTFB',
    label: 'Time to First Byte',
    description: 'Server response time',
    unit: 'ms',
    icon: <Clock className="w-5 h-5" />,
    thresholds: { good: 800, poor: 1800 },
  },
  INP: {
    name: 'INP',
    label: 'Interaction to Next Paint',
    description: 'Interactivity - responsiveness to user interactions',
    unit: 'ms',
    icon: <MousePointer className="w-5 h-5" />,
    thresholds: { good: 200, poor: 500 },
  },
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'poor':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'needs-improvement':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getRatingBadge(rating: string): string {
  switch (rating) {
    case 'good':
      return 'bg-green-100 text-green-800'
    case 'poor':
      return 'bg-red-100 text-red-800'
    case 'needs-improvement':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3)
  }
  return Math.round(value).toLocaleString()
}

function MetricCard({ metric }: { metric: WebVitalsMetricData }) {
  const config = METRICS_CONFIG[metric.name]
  if (!config) return null

  const ratingColor = getRatingColor(metric.rating)
  const ratingBadge = getRatingBadge(metric.rating)
  const formattedValue = formatValue(metric.name, metric.value)

  return (
    <div className={`rounded-xl border p-6 ${ratingColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold">{config.label}</h3>
            <p className="text-sm opacity-80">{config.name}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ratingBadge}`}>
          {metric.rating === 'needs-improvement' ? 'Needs Improvement' : metric.rating}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{formattedValue}</span>
          <span className="text-sm opacity-70">{config.unit}</span>
        </div>
        <p className="text-sm mt-2 opacity-80">{config.description}</p>
      </div>

      {metric.delta !== undefined && metric.delta !== 0 && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          {metric.delta > 0 ? (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>+{formatValue(metric.name, metric.delta)} from previous</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" />
              <span>{formatValue(metric.name, metric.delta)} from previous</span>
            </>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-current border-opacity-20">
        <div className="flex justify-between text-xs opacity-70">
          <span>Good: ≤{formatValue(metric.name, config.thresholds.good)}{config.unit}</span>
          <span>Poor: &gt;{formatValue(metric.name, config.thresholds.poor)}{config.unit}</span>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
      </div>
    </div>
  )
}

export function WebVitalsDashboard({
  initialMetrics = [],
  refreshInterval = 30000,
  autoRefresh = false,
}: WebVitalsDashboardProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetricData[]>(initialMetrics)
  const [isLoading, setIsLoading] = useState(initialMetrics.length === 0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Listen for web-vital events
  useEffect(() => {
    if (!isClient) return

    const handleWebVital = (event: CustomEvent<WebVitalsMetricData>) => {
      const metric = event.detail
      
      setMetrics(prev => {
        const index = prev.findIndex(m => m.name === metric.name)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = metric
          return updated
        }
        return [...prev, metric]
      })
      
      setIsLoading(false)
      setLastUpdated(new Date())
    }

    window.addEventListener('web-vital', handleWebVital as EventListener)
    
    return () => {
      window.removeEventListener('web-vital', handleWebVital as EventListener)
    }
  }, [isClient])

  // Auto-refresh (simulated - in production, would fetch from API)
  useEffect(() => {
    if (!autoRefresh || !isClient) return

    const interval = setInterval(() => {
      // In a real implementation, this would fetch from your analytics API
      // fetch('/api/metrics/web-vitals/aggregated').then(...)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, isClient])

  const handleRefresh = () => {
    setIsLoading(true)
    // Trigger a page reload to get fresh metrics
    window.location.reload()
  }

  // Ensure all 5 Core Web Vitals are represented
  const allMetrics = ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'] as const
  const metricsMap = new Map(metrics.map(m => [m.name, m]))

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Core Web Vitals</h2>
            <p className="text-gray-600">Real-time performance metrics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Core Web Vitals</h2>
          <p className="text-gray-600">Real-time performance metrics from current session</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMetrics.map(name => (
            <div
              key={name}
              className="rounded-xl border border-gray-200 p-6 bg-gray-50 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                {METRICS_CONFIG[name].icon}
                <span className="font-medium">{METRICS_CONFIG[name].label}</span>
              </div>
              <p className="text-gray-500 text-sm">
                Waiting for metrics...<br />
                Navigate the site to collect data.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMetrics.map(name => {
            const metric = metricsMap.get(name)
            if (metric) {
              return <MetricCard key={name} metric={metric} />
            }
            return (
              <div
                key={name}
                className="rounded-xl border border-gray-200 p-6 bg-gray-50 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  {METRICS_CONFIG[name].icon}
                  <span className="font-medium">{METRICS_CONFIG[name].label}</span>
                </div>
                <p className="text-gray-500 text-sm">Waiting for data...</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">About Core Web Vitals</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Metrics are collected from real user sessions (RUM)</li>
          <li>• Thresholds follow Google&apos;s Core Web Vitals guidelines</li>
          <li>• Data is sent to Sentry and stored for analysis</li>
          <li>• Poor ratings trigger warnings in Sentry for investigation</li>
        </ul>
      </div>
    </div>
  )
}

export default WebVitalsDashboard
