'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Activity,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Download,
  BarChart3,
  Brain,
  BookOpen,
} from 'lucide-react'
import { logger } from '@/lib/observability/logger'

interface AIMetrics {
  overview: {
    totalRequests: number
    totalCostUSD: number
    avgLatencyMs: number
    activeDoctors: number
  }
  byProvider: {
    provider: string
    requests: number
    costUSD: number
    avgLatencyMs: number
  }[]
  byEndpoint: {
    endpoint: string
    requests: number
    costUSD: number
    avgLatencyMs: number
  }[]
  byDay: {
    date: string
    requests: number
    costUSD: number
  }[]
  copilotStats: {
    totalSessions: number
    avgSessionLength: number
    totalSOAPNotes: number
    totalDifferentialDiagnoses: number
  }
  ragStats: {
    totalDocuments: number
    avgRetrievalScore: number
    topSpecialties: {
      specialty: string
      count: number
    }[]
  }
  recentActivity: {
    timestamp: string
    endpoint: string
    provider: string
    model: string
    costUSD: number
    latencyMs: number
  }[]
}

export default function AIDashboardPage() {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchMetrics()
  }, [days])

  async function fetchMetrics() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/ai/metrics?days=${days}`)
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    try {
      const response = await fetch('/api/admin/ai/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', days }),
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-metrics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (err) {
      logger.error('Export error', { error: (err as Error).message })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas de IA...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button onClick={fetchMetrics} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">AI Monitoring Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Activity className="w-6 h-6 text-blue-600" />}
            label="Total Solicitudes"
            value={metrics.overview.totalRequests.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            label="Costo Total (USD)"
            value={`$${metrics.overview.totalCostUSD.toFixed(2)}`}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-purple-600" />}
            label="Latencia Promedio"
            value={`${Math.round(metrics.overview.avgLatencyMs)}ms`}
            color="purple"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-orange-600" />}
            label="Doctores Activos"
            value={metrics.overview.activeDoctors.toString()}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* By Provider */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso por Proveedor</h3>
            <div className="space-y-4">
              {metrics.byProvider.map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{provider.provider}</span>
                      <span className="text-gray-600">{provider.requests} reqs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(provider.requests / metrics.overview.totalRequests) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">
                    ${provider.costUSD.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Endpoint */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso por Endpoint</h3>
            <div className="space-y-4">
              {metrics.byEndpoint.slice(0, 5).map((endpoint) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate max-w-[200px]" title={endpoint.endpoint}>
                        {endpoint.endpoint}
                      </span>
                      <span className="text-gray-600">{endpoint.requests} reqs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(endpoint.requests / metrics.overview.totalRequests) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">
                    ${endpoint.costUSD.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copilot & RAG Stats */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Copilot Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Clinical Copilot</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sesiones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.copilotStats.totalSessions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Notas SOAP Generadas</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.copilotStats.totalSOAPNotes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Longitud Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.copilotStats.avgSessionLength.toFixed(1)} msgs</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Diagnósticos Diferenciales</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.copilotStats.totalDifferentialDiagnoses}</p>
              </div>
            </div>
          </div>

          {/* RAG Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Base de Conocimiento Médico (RAG)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Documentos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.ragStats.totalDocuments}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Score Promedio Recuperación</p>
                <p className="text-2xl font-bold text-gray-900">{(metrics.ragStats.avgRetrievalScore * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Especialidades Principales</p>
              <div className="space-y-2">
                {metrics.ragStats.topSpecialties.slice(0, 5).map((spec) => (
                  <div key={spec.specialty} className="flex justify-between text-sm">
                    <span>{spec.specialty}</span>
                    <span className="font-medium">{spec.count} docs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Over Time */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso en el Tiempo</h3>
          <div className="h-64 flex items-end gap-1">
            {metrics.byDay.map((day) => {
              const maxRequests = Math.max(...metrics.byDay.map(d => d.requests))
              const height = (day.requests / maxRequests) * 100
              return (
                <div
                  key={day.date}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-t transition-colors relative group"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.requests} requests, $${day.costUSD.toFixed(2)}`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    <br />
                    {day.requests} reqs
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {metrics.recentActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(activity.timestamp).toLocaleString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]" title={activity.endpoint}>
                      {activity.endpoint}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.provider}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.model}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${activity.costUSD.toFixed(4)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
