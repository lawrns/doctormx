import { getAdminMetrics, getRevenueMetrics, getUserMetrics, getAppointmentMetrics } from '@/lib/analytics'
import { StatCard, MetricCard, Chart } from '@/components'
import { DollarSign, Users, UserPlus, Calendar, TrendingUp, Activity, Award } from 'lucide-react'
import { Suspense } from 'react'

async function AdminAnalyticsContent() {
  const [adminMetrics, revenueMetrics, userMetrics, appointmentMetrics] = await Promise.all([
    getAdminMetrics(),
    getRevenueMetrics(),
    getUserMetrics(),
    getAppointmentMetrics(),
  ])

  const currencyFormat = (value: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value)

  const funnelData = [
    { stage: 'Visitas', value: 10000 },
    { stage: 'Búsqueda doctores', value: 6000 },
    { stage: 'Perfiles vistos', value: 4000 },
    { stage: 'Citas reservadas', value: 1500 },
    { stage: 'Pagos completados', value: 1200 },
    { stage: 'Consultas realizadas', value: 1100 },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="MRR Mensual"
          value={adminMetrics.revenue.mrr}
          change={adminMetrics.revenue.mrrGrowth}
          changeLabel="vs mes anterior"
          format="currency"
          trend={adminMetrics.revenue.mrrGrowth > 0 ? 'up' : adminMetrics.revenue.mrrGrowth < 0 ? 'down' : 'neutral'}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Doctores Activos"
          value={adminMetrics.doctors.total}
          change={adminMetrics.doctors.newThisMonth}
          changeLabel="nuevos este mes"
          trend={adminMetrics.doctors.newThisMonth > 0 ? 'up' : 'neutral'}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Pacientes Totales"
          value={adminMetrics.patients.total}
          change={adminMetrics.patients.newThisMonth}
          changeLabel="nuevos este mes"
          trend={adminMetrics.patients.newThisMonth > 0 ? 'up' : 'neutral'}
          icon={<UserPlus className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Citas Completadas"
          value={adminMetrics.appointments.completed}
          change={adminMetrics.appointments.growth}
          changeLabel="vs mes anterior"
          format="percentage"
          trend={adminMetrics.appointments.growth > 0 ? 'up' : adminMetrics.appointments.growth < 0 ? 'down' : 'neutral'}
          icon={<Calendar className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard title="Ingresos - Últimos 12 meses">
          <Chart
            data={adminMetrics.revenue.monthlyRevenue}
            type="area"
            xKey="month"
            yKeys={['revenue']}
            formatY="currency"
            height={300}
            colors={['#6366f1']}
          />
        </MetricCard>

        <MetricCard title="Embudo de Conversión">
          <Chart
            data={funnelData}
            type="funnel"
            xKey="stage"
            yKeys={['value']}
            height={300}
            colors={['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff']}
          />
        </MetricCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard title="Top Especialidades por Ingresos">
          {revenueMetrics.bySpecialty.length > 0 ? (
            <Chart
              data={revenueMetrics.bySpecialty.slice(0, 6)}
              type="bar"
              xKey="specialty"
              yKeys={['revenue']}
              formatY="currency"
              height={300}
              colors={['#22c55e']}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500">No hay datos disponibles aún</p>
            </div>
          )}
        </MetricCard>

        <MetricCard title="Distribución Geográfica">
          {revenueMetrics.byCity.length > 0 ? (
            <Chart
              data={revenueMetrics.byCity.slice(0, 8)}
              type="pie"
              xKey="city"
              yKeys={['revenue']}
              formatY="currency"
              height={300}
              colors={['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500">No hay datos disponibles aún</p>
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
            <h3 className="font-semibold text-gray-900">Tasa Conversión</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">11%</p>
          <p className="text-sm text-gray-500 mt-1">Visitantes → Citas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Ticket Promedio</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{currencyFormat(revenueMetrics.averageTransaction)}</p>
          <p className="text-sm text-gray-500 mt-1">Por transacción</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Retención</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userMetrics.retention.rate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Pacientes recurrentes</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Tasa Completación</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{adminMetrics.appointments.completionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Citas finalizadas</p>
        </div>
      </div>

      <MetricCard title="Tendencias de Citas - Últimos 30 días">
        <Chart
          data={appointmentMetrics.trends}
          type="line"
          xKey="date"
          yKeys={['appointments', 'completed', 'cancelled']}
          height={350}
          colors={['#6366f1', '#22c55e', '#ef4444']}
        />
      </MetricCard>
    </div>
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

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Métricas y análisis de la plataforma</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                <option>Últimos 30 días</option>
                <option>Este mes</option>
                <option>Últimos 3 meses</option>
                <option>Último año</option>
              </select>
              <a
                href="/api/analytics/export?type=admin&format=csv"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <AdminAnalyticsContent />
        </Suspense>
      </main>
    </div>
  )
}
