import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { getLeads, getOutboundStats } from '@/lib/outbound/whatsapp'
import { AdminShell } from '@/components/AdminShell'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Users, PhoneCall, CheckCircle, TrendingUp, Download, Upload } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  responded: 'Respondió',
  converted: 'Convertido',
  unsubscribed: 'Canceló suscripción',
}

const STATUS_VARIANTS: Record<string, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  new: 'info',
  contacted: 'warning',
  responded: 'neutral',
  converted: 'success',
  unsubscribed: 'error',
}

type SearchParams = { status?: string }

export default async function OutboundDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { profile } = await requireRole('admin')
  const params = await searchParams
  const statusFilter = params.status || 'all'

  let stats: Awaited<ReturnType<typeof getOutboundStats>> = {
    total: 0,
    new: 0,
    contacted: 0,
    responded: 0,
    converted: 0,
    unsubscribed: 0,
    conversionRate: 0,
  }
  let leads: Awaited<ReturnType<typeof getLeads>> = []
  try {
    ;[stats, leads] = await Promise.all([
      getOutboundStats(),
      getLeads(statusFilter),
    ])
  } catch (err) {
    console.error('Failed to load outbound data:', err)
  }

  return (
    <AdminShell profile={{ full_name: profile.full_name }} currentPath="/admin/outbound">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Pipeline de Adquisición
          </h1>
          <p className="text-muted-foreground">
            Gestión de leads outbound vía WhatsApp para captación de médicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
            Importar CSV
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Exportar
          </Button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contactados</p>
                <p className="text-2xl font-bold text-foreground">{stats.contacted}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Convertidos</p>
                <p className="text-2xl font-bold text-primary">{stats.converted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Funnel Summary */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {([
            { key: 'new', label: 'Nuevos', color: 'bg-blue-500' },
            { key: 'contacted', label: 'Contactados', color: 'bg-yellow-500' },
            { key: 'responded', label: 'Respondieron', color: 'bg-orange-500' },
            { key: 'converted', label: 'Convertidos', color: 'bg-green-500' },
            { key: 'unsubscribed', label: 'Bajas', color: 'bg-red-500' },
          ] as const).map((stage) => (
            <div key={stage.key} className="text-center">
              <div className={`${stage.color} rounded-lg p-3 mb-2`}>
                <p className="text-2xl font-bold text-white">
                  {stats[stage.key]}
                </p>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{stage.label}</p>
            </div>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'new', 'contacted', 'responded', 'converted', 'unsubscribed'].map((status) => (
            <Link
              key={status}
              href={`/admin/outbound?status=${status}`}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              {status === 'all' ? 'Todos' : STATUS_LABELS[status]}
            </Link>
          ))}
        </div>

        {/* Leads Table */}
        <div className="rounded-lg border bg-card shadow">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Doctor</span>
            <span>Especialidad</span>
            <span>Ciudad</span>
            <span>Estado</span>
            <span className="text-right">Contacto</span>
          </div>

          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-3" />
              <p className="text-lg font-medium">No hay leads</p>
              <p className="text-sm">Importa leads vía CSV para comenzar</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b px-5 py-4 last:border-b-0 hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">Dr. {lead.name}</p>
                  {lead.phone && (
                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                  )}
                  {lead.email && (
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-foreground">{lead.specialty || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">{lead.city || '-'}</p>
                </div>
                <div>
                  <Badge variant={STATUS_VARIANTS[lead.status] || 'neutral'}>
                    {STATUS_LABELS[lead.status] || lead.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {lead.contacted_at
                      ? new Date(lead.contacted_at).toLocaleDateString('es-MX')
                      : new Date(lead.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {leads.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {leads.length} de {stats.total} leads
          </p>
        )}
    </AdminShell>
  )
}
