'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, Clock, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      console.error('Error fetching AI metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
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
            <Button
              key={tf.value}
              onClick={() => setTimeframe(tf.value as any)}
              variant={timeframe === tf.value ? 'default' : 'outline'}
            >
              {tf.label}
            </Button>
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
              <Card className="rounded-2xl border border-border shadow-dx-1 p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="font-bold text-foreground">Tendencia Semanal</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 flex items-end justify-between gap-2">
                    {metrics.weeklyTrend.map((week, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                          style={{
                            height: `${(week.referrals / Math.max(...metrics.weeklyTrend.map(w => w.referrals))) * 100}%`,
                            minHeight: '20px',
                          }}
                        />
                        <span className="text-xs text-muted-foreground">{week.week}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Specialties */}
              <Card className="rounded-2xl border border-border shadow-dx-1 p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="font-bold text-foreground">Especialidades Top</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {metrics.topSpecialties.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-foreground">{spec.specialty}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(spec.count / metrics.topSpecialties[0].count) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">{spec.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-vital" />
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
  icon: any
  color: string
  isPercentage?: boolean
}

function KPICard({ title, value, change, icon: Icon, color, isPercentage }: KPICardProps) {
  const colorClasses = {
    emerald: 'bg-vital-soft text-vital border-vital/20',
    blue: 'bg-primary/10 text-primary border-primary/20',
    purple: 'bg-secondary/50 text-primary border-border',
    amber: 'bg-secondary/50 text-amber border-border',
  }

  const isPositive = change >= 0

  return (
    <Card className="rounded-2xl border border-border shadow-dx-1 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <div className={`flex items-center gap-1 text-sm ${
          isPositive ? 'text-vital' : 'text-coral'
        }`}>
          {isPositive ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
    </Card>
  )
}

interface InsightCardProps {
  title: string
  description: string
}

function InsightCard({ title, description }: InsightCardProps) {
  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
