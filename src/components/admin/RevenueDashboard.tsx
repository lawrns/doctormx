// Admin Revenue Dashboard - Track $1M ARR Progress
// Displays subscription revenue, platform fees, and projections

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react'

interface RevenueSummary {
  totalGross: number
  totalPlatformFees: number
  totalDoctorPayouts: number
  consultCount: number
  subscriptionRevenue: number
  byTier: Record<string, { count: number; fees: number }>
}

interface DailyRevenue {
  date: string
  subscriptionRevenueCents: number
  platformFeeRevenueCents: number
  totalConsults: number
  doctorPayoutsCents: number
}

export default function RevenueDashboard() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  async function fetchRevenueData() {
    try {
      const response = await fetch(`/api/admin/revenue?range=${timeRange}`)
      const data = await response.json()
      setSummary(data.summary)
      setDailyRevenue(data.daily)
    } catch (error) {
      console.error('Failed to fetch revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  // $1M ARR target calculations
  const ARR_TARGET = 100000000 // $1M in cents
  const currentARR = (summary?.subscriptionRevenue || 0) * 12 + 
                     (summary?.totalPlatformFees || 0) * 12
  const progressToTarget = Math.min((currentARR / ARR_TARGET) * 100, 100)
  
  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100)
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-64">Cargando...</div>)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard de Ingresos</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' && '7 días'}
              {range === '30d' && '30 días'}
              {range === '90d' && '90 días'}
              {range === '1y' && '1 año'}
            </Button>
          ))}
        </div>
      </div>

      {/* ARR Progress Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/90 text-sm">Progreso hacia $1M ARR</p>
            <p className="text-3xl font-bold">{formatCurrency(currentARR)}</p>
            <p className="text-white/90 text-sm">Meta: {formatCurrency(ARR_TARGET)}</p>
          </div>
          <Target className="w-12 h-12 text-white/70" />
        </div>
        <div className="w-full bg-primary rounded-full h-3">
          <div
            className="bg-card rounded-full h-3 transition-all duration-500"
            style={{ width: `${progressToTarget}%` }}
          />
        </div>
        <p className="text-center mt-2 text-white/90">
          {progressToTarget.toFixed(1)}% de la meta
        </p>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Ingresos Suscripción</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.subscriptionRevenue || 0)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Comisiones Plataforma</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalPlatformFees || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-vital" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Consultas</p>
              <p className="text-2xl font-bold">{summary?.consultCount || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pago a Doctores</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalDoctorPayouts || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Revenue by Tier */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ingresos por Plan</h2>
        <div className="space-y-4">
          {['starter', 'pro', 'elite', 'clinic'].map((tier) => {
            const tierData = summary?.byTier?.[tier]
            if (!tierData) return null
            
            const tierNames: Record<string, string> = {
              starter: 'Starter',
              pro: 'Pro',
              elite: 'Elite',
              clinic: 'Clínica',
            }
            
            return (
              <div key={tier} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    tier === 'starter' ? 'bg-muted-foreground' :
                    tier === 'pro' ? 'bg-primary/60' :
                    tier === 'elite' ? 'bg-purple-400' :
                    'bg-orange-400'
                  }`} />
                  <span className="font-medium">{tierNames[tier]}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(tierData.fees)}</p>
                  <p className="text-sm text-muted-foreground">{tierData.count} consultas</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Daily Revenue Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Ingresos Diarios</h2>
        <div className="space-y-2">
          {dailyRevenue.slice(-10).map((day) => (
            <div key={day.date} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded">
              <span className="text-sm text-muted-foreground">
                {new Date(day.date).toLocaleDateString('es-MX', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm">{day.totalConsults} consultas</span>
                <span className="font-medium">
                  {formatCurrency(day.platformFeeRevenueCents + day.subscriptionRevenueCents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
