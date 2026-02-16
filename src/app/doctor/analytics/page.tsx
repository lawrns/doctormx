import { requireRole } from '@/lib/auth'
import { getDoctorMetrics } from '@/lib/analytics'
import { StatCard, MetricCard, Chart } from '@/components'
import DoctorLayout from '@/components/DoctorLayout'
import { DollarSign, Users, Star, Calendar, TrendingUp, Clock, Activity, Award } from 'lucide-react'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value)

async function DoctorAnalyticsContent() {
  const { user, profile, supabase } = await requireRole('doctor')

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  const metrics = await getDoctorMetrics(user.id)

  const { data: doctor } = await supabase
    .from('doctores')
    .select('status')
    .eq('id', user.id)
    .single()

  const isPending = !doctor || doctor.status !== 'approved'

  const appointmentsByStatus = Object.entries(metrics.appointments.byStatus).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count,
  }))

  return (
    <DoctorLayout profile={profile} isPending={isPending} currentPath="/doctor/analytics">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Analytics</h1>
            <p className="text-gray-600 mt-1">Tu rendimiento y métricas personales</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
              <option>Este mes</option>
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
              <option>Último año</option>
            </select>
            <a
              href="/api/analytics/export?type=doctor&format=csv"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </a>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Consultas Este Mes"
              value={metrics.consultations.thisMonth}
              change={metrics.consultations.growth}
              changeLabel="vs mes anterior"
              format="number"
              trend={metrics.consultations.growth > 0 ? 'up' : metrics.consultations.growth < 0 ? 'down' : 'neutral'}
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
            />
            <StatCard
              title="Ingresos Este Mes"
              value={metrics.revenue.thisMonth}
              change={metrics.revenue.growth}
              changeLabel="vs mes anterior"
              format="currency"
              trend={metrics.revenue.growth > 0 ? 'up' : metrics.revenue.growth < 0 ? 'down' : 'neutral'}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
            />
            <StatCard
              title="Calificación Promedio"
              value={metrics.rating.average}
              change={metrics.rating.trend}
              changeLabel="vs mes anterior"
              format="percentage"
              icon={<Star className="w-6 h-6 text-yellow-500" />}
            />
            <StatCard
              title="Tasa No-Show"
              value={metrics.appointments.noShowRate}
              change={0}
              changeLabel="citas perdidas"
              format="percentage"
              trend={metrics.appointments.noShowRate > 10 ? 'down' : 'up'}
              icon={<Users className="w-6 h-6 text-red-600" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricCard title="Ingresos - Últimos 6 meses">
              <Chart
                data={metrics.revenueHistory}
                type="area"
                xKey="month"
                yKeys={['revenue']}
                formatY="currency"
                height={300}
                colors={['#22c55e']}
              />
            </MetricCard>

            <MetricCard title="Citas por Estado">
              {appointmentsByStatus.length > 0 ? (
                <Chart
                  data={appointmentsByStatus}
                  type="pie"
                  xKey="status"
                  yKeys={['count']}
                  height={300}
                  colors={['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">No hay citas aún</p>
                </div>
              )}
            </MetricCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Consultas Totales</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.consultations.total}</p>
              <p className="text-sm text-gray-500 mt-1">Histórico</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Ingresos Totales</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.revenue.gross)}</p>
              <p className="text-sm text-gray-500 mt-1">Bruto</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Reviews</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.rating.totalReviews}</p>
              <p className="text-sm text-gray-500 mt-1">Recibidos</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Duración Promedio</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.appointments.avgDuration}min</p>
              <p className="text-sm text-gray-500 mt-1">Por consulta</p>
            </div>
          </div>

          {metrics.peakHours.length > 0 && (
            <MetricCard title="Horarios Pico">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.peakHours.slice(0, 6).map((peak) => (
                  <div key={peak.hour} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {peak.hour}:00
                    </p>
                    <p className="text-sm text-gray-500">{peak.count} citas</p>
                  </div>
                ))}
              </div>
            </MetricCard>
          )}

          <MetricCard title="Resumen de Rendimiento">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Ingresos Netos ( después de fees )</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(metrics.revenue.net)}</p>
                <p className="text-xs text-gray-500 mt-1">Fee de plataforma: {formatCurrency(metrics.revenue.platformFee)}</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Pacientes Únicos</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.patients.unique}</p>
                <p className="text-xs text-gray-500 mt-1">Pacientes que te han visitado</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Retención de Pacientes</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.patients.retentionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Pacientes que regresan</p>
              </div>
            </div>
          </MetricCard>
        </div>
      </div>
    </DoctorLayout>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DoctorAnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DoctorAnalyticsContent />
    </Suspense>
  )
}
