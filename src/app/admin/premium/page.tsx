import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { TIER_UPGRADE_PRICING } from '@/lib/premium-features'

async function getPremiumStats() {
  const supabase = createServiceClient()

  const { data: subscriptions } = await supabase
    .from('doctor_subscriptions')
    .select('plan_id')
    .eq('status', 'active')

  const { data: billingRecords } = await supabase
    .from('premium_billing_records')
    .select('amount_cents, status, feature_key, created_at')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const tierCounts = { none: 0, starter: 0, pro: 0, elite: 0 }
  const tierMap: Record<string, string> = {
    basic_499: 'starter',
    pro_499: 'pro',
    elite_999: 'elite',
  }

  for (const sub of subscriptions || []) {
    const tier = tierMap[sub.plan_id] || 'none'
    tierCounts[tier as keyof typeof tierCounts]++
  }

  const revenueByFeature: Record<string, number> = {
    image_analysis: 0,
    clinical_copilot: 0,
    extended_chat: 0,
    premium_consultation: 0,
    priority_listing: 0,
    featured_badge: 0,
    api_access: 0,
  }

  let totalRevenue = 0
  let pendingRevenue = 0

  for (const record of billingRecords || []) {
    if (record.feature_key && revenueByFeature[record.feature_key] !== undefined) {
      revenueByFeature[record.feature_key] += record.amount_cents
    }
    totalRevenue += record.amount_cents
    if (record.status === 'pending') {
      pendingRevenue += record.amount_cents
    }
  }

  return {
    tierCounts,
    totalDoctors: Object.values(tierCounts).reduce((a, b) => a + b, 0),
    revenueByFeature,
    totalRevenue,
    pendingRevenue,
    transactionCount: billingRecords?.length || 0,
  }
}

export default async function AdminPremiumPage() {
  await requireRole('admin')
  const stats = await getPremiumStats()

  const formatMXN = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctor.mx Admin</h1>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Premium Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Premium Features Dashboard
          </h2>
          <p className="text-gray-600">
            Monitorea ingresos, uso de features y actividad de doctores premium
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Doctores Premium</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDoctors}</p>
            <div className="mt-4 space-y-2">
              {Object.entries(stats.tierCounts).map(([tier, count]) => (
                <div key={tier} className="flex justify-between text-sm">
                  <span className="capitalize">{tier}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Ingresos del Mes</p>
            <p className="text-3xl font-bold text-green-600">{formatMXN(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatMXN(stats.pendingRevenue)} pendiente de cobro
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Transacciones</p>
            <p className="text-3xl font-bold text-gray-900">{stats.transactionCount}</p>
            <p className="text-sm text-gray-500 mt-2">Este mes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">ARPM</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.transactionCount > 0
                ? formatMXN(Math.round(stats.totalRevenue / stats.transactionCount))
                : '$0'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Promedio por transacción</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ingresos por Feature
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.revenueByFeature).map(([feature, revenue]) => (
                <div key={feature}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{formatMXN(revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${stats.totalRevenue > 0 ? (revenue / stats.totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución de Planes
            </h3>
            <div className="flex items-center justify-center h-64">
              <div className="w-48 h-48 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {Object.entries(stats.tierCounts).map(([tier, count], index) => {
                    if (count === 0) return null
                    const total = stats.totalDoctors
                    const colors: Record<string, string> = {
                      none: '#9CA3AF',
                      starter: '#3B82F6',
                      pro: '#F59E0B',
                      elite: '#8B5CF6',
                    }
                    const strokes = [0]
                    let current = 0
                    for (const [, c] of Object.entries(stats.tierCounts)) {
                      strokes.push((c / total) * 100 + current)
                      current += (c / total) * 100
                    }
                    const start = strokes[index]
                    const end = strokes[index + 1]
                    const dashArray = ((end - start) / 100) * 251.2
                    const dashOffset = -(start / 100) * 251.2
                    return (
                      <circle
                        key={tier}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colors[tier]}
                        strokeWidth="20"
                        strokeDasharray={`${dashArray} 251.2`}
                        strokeDashoffset={dashOffset}
                        className="transition-all"
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                    <p className="text-sm text-gray-500">Doctores</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {Object.entries(stats.tierCounts).map(([tier, count]) => {
                if (count === 0) return null
                const colors: Record<string, string> = {
                  none: 'bg-gray-400',
                  starter: 'bg-blue-500',
                  pro: 'bg-amber-500',
                  elite: 'bg-purple-500',
                }
                return (
                  <div key={tier} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[tier]}`} />
                    <span className="text-sm text-gray-600 capitalize">{tier}: {count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pricing Tiers
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(TIER_UPGRADE_PRICING)
              .filter(([key]) => key !== 'none')
              .map(([key, pricing]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 capitalize">{key}</h4>
                    <span className="text-lg font-bold text-gray-900">
                      {formatMXN(pricing.priceCents)}
                      <span className="text-sm font-normal text-gray-500">/mes</span>
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {pricing.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
