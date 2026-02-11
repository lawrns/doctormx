'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { logger } from '@/lib/observability/logger'
import { TrendingUp, Users, Calendar, Clock, Activity, ArrowUp, ArrowDown, LucideIcon } from 'lucide-react'

interface AIMetrics {
  totalReferrals: number
  thisMonth: number
  lastMonth: number
  conversionRate: number
  avgResponseTime: number
  topSpecialties: Array<{ specialty: string; count: number }>
  weeklyTrend: Array<{ week: string; referrals: number }>
}

export function AIMetricsClient() {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchMetrics()
  }, [timeframe])

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/doctor/analytics/ai-referrals?timeframe=${timeframe}`)
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      logger.error('Error fetching AI metrics', { error })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Métricas de Referencias IA
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-8">
          {[
            { value: 'month', label: 'Este Mes' },
            { value: 'quarter', label: 'Este Trimestre' },
            { value: 'year', label: 'Este Año' },
          ].map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === tf.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {metrics && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Total Referencias"
                value={metrics.totalReferrals}
                change={metrics.thisMonth - metrics.lastMonth}
                icon={Users}
                color="emerald"
              />
              <KPICard
                title="Tasa de Conversión"
                value={`${metrics.conversionRate}%`}
                change={2.5}
                icon={Activity}
                color="blue"
                isPercentage
              />
              <KPICard
                title="Tiempo Promedio"
                value={`${metrics.avgResponseTime}h`}
                change={-0.5}
                icon={Clock}
                color="purple"
              />
              <KPICard
                title="Este Mes"
                value={metrics.thisMonth}
                change={metrics.thisMonth - metrics.lastMonth}
                icon={Calendar}
                color="amber"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Weekly Trend */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Tendencia Semanal</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {metrics.weeklyTrend.map((week, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600"
                        style={{
                          height: `${(week.referrals / Math.max(...metrics.weeklyTrend.map(w => w.referrals))) * 100}%`,
                          minHeight: '20px',
                        }}
                      />
                      <span className="text-xs text-gray-500">{week.week}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Specialties */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Especialidades Top</h3>
                <div className="space-y-4">
                  {metrics.topSpecialties.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700">{spec.specialty}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${(spec.count / metrics.topSpecialties[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{spec.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Insights IA
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <InsightCard
                  title="Pacientes de Calidad"
                  description={`El ${metrics.conversionRate}% de pacientes derivados por IA han agendado consulta`}
                />
                <InsightCard
                  title="Mejor Especialidad"
                  description={`${metrics.topSpecialties[0]?.specialty || 'General'} es tu categoría con más referencias`}
                />
                <InsightCard
                  title="Oportunidad"
                  description="Completa tu perfil para recibir más referencias de pacientes"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: number | string
  change: number
  icon: LucideIcon
  color: string
  isPercentage?: boolean
}

function KPICard({ title, value, change, icon: Icon, color, isPercentage }: KPICardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className={`flex items-center gap-1 text-sm ${
          isPositive ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
    </div>
  )
}

interface InsightCardProps {
  title: string
  description: string
}

function InsightCard({ title, description }: InsightCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-emerald-200">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
