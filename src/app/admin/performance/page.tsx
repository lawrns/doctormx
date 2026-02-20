import { requireRole } from '@/lib/auth'
import { WebVitalsDashboard } from '@/components/performance/WebVitalsDashboard'
import Link from 'next/link'
import { ArrowLeft, BarChart3, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Performance Dashboard | Doctor.mx Admin',
  description: 'Monitor Core Web Vitals and site performance',
}

export default async function PerformancePage() {
  await requireRole('admin')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
                <p className="text-gray-600 mt-1">Core Web Vitals and site performance monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://sentry.io/organizations/doctormx/performance/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Sentry Performance
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Metrics Tracked</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-500">Core Web Vitals</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Data Source</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">RUM</p>
            <p className="text-sm text-gray-500">Real User Monitoring</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Endpoint</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">Active</p>
            <p className="text-sm text-gray-500">/api/metrics/web-vitals</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Sentry</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">Connected</p>
            <p className="text-sm text-gray-500">Poor metrics logged</p>
          </div>
        </div>

        {/* Web Vitals Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <WebVitalsDashboard />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Implementation Details</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>WebVitalsReporter</strong> - Uses Next.js useReportWebVitals hook</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>All Core Web Vitals</strong> - CLS, FCP, LCP, TTFB, INP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Sentry Integration</strong> - Poor metrics trigger alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Custom Endpoint</strong> - POST /api/metrics/web-vitals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Database Storage</strong> - Historical analysis in Supabase</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thresholds (Google Standards)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">CLS (Layout Shift)</span>
                <span className="text-gray-600">Good: ≤0.1 | Poor: &gt;0.25</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">FCP (First Paint)</span>
                <span className="text-gray-600">Good: ≤1.8s | Poor: &gt;3.0s</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">LCP (Largest Paint)</span>
                <span className="text-gray-600">Good: ≤2.5s | Poor: &gt;4.0s</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">TTFB (Server Response)</span>
                <span className="text-gray-600">Good: ≤0.8s | Poor: &gt;1.8s</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">INP (Interactivity)</span>
                <span className="text-gray-600">Good: ≤200ms | Poor: &gt;500ms</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
