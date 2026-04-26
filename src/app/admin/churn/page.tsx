import { requireRole } from '@/lib/auth'
import { identifyAtRiskDoctors, recordRetentionEvent } from '@/lib/churn'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/AdminShell'
import { EmptyState } from '@/components/EmptyState'
import { Suspense } from 'react'

async function ChurnDashboardContent() {
  const { supabase } = await requireRole('admin')

  // Get at-risk doctors
  let atRiskDoctors: Awaited<ReturnType<typeof identifyAtRiskDoctors>> = []
  try {
    atRiskDoctors = await identifyAtRiskDoctors()
  } catch (err) {
    console.error('Failed to load at-risk doctors:', err)
  }

  // Get overall counts
  let totalDoctors: number | null = null
  try {
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    totalDoctors = count
  } catch (err) {
    console.error('Failed to load total doctors:', err)
  }

  const criticalCount = atRiskDoctors.filter(d => d.riskLevel === 'critical').length
  const highCount = atRiskDoctors.filter(d => d.riskLevel === 'high').length
  const mediumCount = atRiskDoctors.filter(d => d.riskLevel === 'medium').length
  const atRiskCount = atRiskDoctors.length

  const churnRate = totalDoctors ? ((atRiskCount / totalDoctors) * 100).toFixed(1) : '0'

  // Get re-engagement history
  let retentionHistory: any[] | null = null
  try {
    const { data } = await supabase
      .from('retention_events')
      .select(`
        id,
        doctor_id,
        event_type,
        risk_level,
        details,
        created_at,
        doctors (
          id,
          profiles!doctors_id_fkey (full_name)
        )
      `)
      .in('event_type', ['reengagement_sent', 'saved', 'churned'])
      .order('created_at', { ascending: false })
      .limit(50)
    retentionHistory = data
  } catch (err) {
    console.error('Failed to load retention history:', err)
  }

  const riskColorMap: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  }

  const riskLabelMap: Record<string, string> = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctores</p>
              <p className="text-2xl font-bold text-foreground">{totalDoctors || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Riesgo</p>
              <p className="text-2xl font-bold text-yellow-600">{atRiskCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Riesgo</p>
              <p className="text-2xl font-bold text-foreground">{churnRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Bar Chart (placeholder data) */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Distribución de Riesgo</h3>
        <div className="space-y-3">
          {(['critical', 'high', 'medium', 'low'] as const).map(level => {
            const count = atRiskDoctors.filter(d => d.riskLevel === level).length
            const pct = atRiskCount > 0 ? (count / atRiskCount) * 100 : 0
            return (
              <div key={level} className="flex items-center gap-3">
                <span className={`text-xs font-medium w-16 px-2 py-1 rounded-full border ${riskColorMap[level]}`}>
                  {riskLabelMap[level]}
                </span>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      level === 'critical' ? 'bg-red-500' :
                      level === 'high' ? 'bg-orange-500' :
                      level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-10 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* At-Risk Doctors Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">
            Doctores en Riesgo de Abandono
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {atRiskCount} en riesgo
          </span>
        </div>
        <div className="overflow-x-auto">
          {atRiskDoctors.length === 0 ? (
            <EmptyState iconName="alert" title="No hay doctores en riesgo" description="Actualmente no hay doctores con riesgo de abandono." />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Doctor</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nivel de Riesgo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Factores de Riesgo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Última Actividad</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Consultas (mes)</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Acción</th>
                </tr>
              </thead>
              <tbody>
                {atRiskDoctors.map(doctor => (
                  <tr key={doctor.doctorId} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{doctor.doctorName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${riskColorMap[doctor.riskLevel]}`}>
                        {doctor.riskLevel === 'critical' && '⚠️ '}
                        {riskLabelMap[doctor.riskLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-1">
                        {doctor.factors.map((factor, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {doctor.lastActivity
                        ? new Date(doctor.lastActivity).toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {doctor.appointmentsThisMonth}
                    </td>
                    <td className="px-4 py-3">
                      <form action={`/api/admin/churn/reengage`} method="POST">
                        <input type="hidden" name="doctorId" value={doctor.doctorId} />
                        <input type="hidden" name="type" value="email" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Re-enganchar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Re-engagement History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            Historial de Re-enganche
          </h3>
        </div>
        <div className="overflow-x-auto">
          {!retentionHistory || retentionHistory.length === 0 ? (
            <EmptyState iconName="clipboard" title="Sin historial de re-enganche" description="El historial de actividades de retención aparecerá aquí." />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Doctor</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Evento</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nivel de Riesgo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {(retentionHistory as Array<{
                  id: string
                  doctor_id: string
                  event_type: string
                  risk_level: string | null
                  created_at: string
                  doctors: Array<{ profiles: Array<{ full_name: string }> }>
                }>).map(event => {
                  const eventLabel: Record<string, string> = {
                    reengagement_sent: 'Re-enganche enviado',
                    saved: 'Retenido',
                    churned: 'Abandonó',
                  }
                  const typeLabel = eventLabel[event.event_type] || event.event_type
                  return (
                    <tr key={event.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {event.doctors?.[0]?.profiles?.[0]?.full_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.event_type === 'saved' ? 'bg-green-100 text-green-800' :
                          event.event_type === 'churned' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {event.risk_level || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-4"></div>
            <div className="h-8 bg-muted rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function AdminChurnPage() {
  const { profile } = await requireRole('admin')
  return (
    <AdminShell profile={{ full_name: profile.full_name }} currentPath="/admin/churn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Prevención de Abandono</h1>
          <p className="text-muted-foreground mt-1">Monitorea y re-engancha doctores en riesgo</p>
        </div>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <ChurnDashboardContent />
      </Suspense>
    </AdminShell>
  )
}
