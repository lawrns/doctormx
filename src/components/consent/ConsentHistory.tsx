/**
 * Consent History Component
 *
 * Displays a chronological history of all consent changes for a user.
 * Includes consent grants, withdrawals, and modifications with timestamps.
 *
 * @component ConsentHistory
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Filter, Download, Eye } from 'lucide-react'
import { logger } from '@/lib/observability/logger'

// Mock types - replace with actual imports
interface ConsentHistoryEntry {
  id: string
  consent_type: string
  action: 'granted' | 'withdrawn' | 'modified'
  previous_status: string | null
  new_status: string
  changed_by: string
  changed_by_role: string
  change_reason: string | null
  occurred_at: string
  metadata: Record<string, unknown> | null
}

const ACTION_LABELS = {
  granted: 'Otorgado',
  withdrawn: 'Retirado',
  modified: 'Modificado',
} as const

const STATUS_COLORS = {
  granted: 'bg-green-100 text-green-800',
  withdrawn: 'bg-red-100 text-red-800',
  modified: 'bg-blue-100 text-blue-800',
} as const

const TYPE_LABELS: Record<string, string> = {
  marketing_emails: 'Correos Electrónicos',
  marketing_sms: 'Mensajes SMS',
  analytics_consent: 'Analíticas',
  personalization_consent: 'Personalización',
  research_consent: 'Investigación',
  ai_training_consent: 'Entrenamiento IA',
  share_with_insurance: 'Compartir Seguros',
  share_with_pharmacies: 'Compartir Farmacias',
}

interface ConsentHistoryProps {
  userId: string
}

export function ConsentHistory({ userId }: ConsentHistoryProps) {
  const [history, setHistory] = useState<ConsentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    consentType?: string
    action?: string
    dateFrom?: string
    dateTo?: string
  }>({})
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  // Load history on mount
  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      try {
        // Mock data - API integration pending (Ticket: TODO-001)
        // Endpoint: /api/consent/history?userId=${userId}
        const mockHistory: ConsentHistoryEntry[] = [
          {
            id: '1',
            consent_type: 'marketing_emails',
            action: 'granted',
            previous_status: null,
            new_status: 'granted',
            changed_by: userId,
            changed_by_role: 'user',
            change_reason: null,
            occurred_at: '2024-01-15T10:30:00Z',
            metadata: { ip_address: '192.168.1.1', user_agent: 'Mozilla/5.0' },
          },
          {
            id: '2',
            consent_type: 'analytics_consent',
            action: 'granted',
            previous_status: null,
            new_status: 'granted',
            changed_by: userId,
            changed_by_role: 'user',
            change_reason: 'Permitir análisis de uso',
            occurred_at: '2024-01-10T14:20:00Z',
            metadata: null,
          },
          {
            id: '3',
            consent_type: 'marketing_sms',
            action: 'withdrawn',
            previous_status: 'granted',
            new_status: 'withdrawn',
            changed_by: userId,
            changed_by_role: 'user',
            change_reason: 'Ya no deseo recibir mensajes SMS',
            occurred_at: '2024-01-08T09:15:00Z',
            metadata: null,
          },
        ]

        setHistory(mockHistory)
      } catch (error) {
        logger.error('Error loading consent history', { error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [userId])

  const filteredHistory = history.filter((entry) => {
    if (filter.consentType && entry.consent_type !== filter.consentType) {
      return false
    }
    if (filter.action && entry.action !== filter.action) {
      return false
    }
    if (filter.dateFrom && entry.occurred_at < filter.dateFrom) {
      return false
    }
    if (filter.dateTo && entry.occurred_at > filter.dateTo) {
      return false
    }
    return true
  })

  const exportHistory = () => {
    const csv = [
      'Fecha,Tipo de Consentimiento,Acción,Estado Anterior,Estado Nuevo,Razón,Usuario',
      ...filteredHistory.map((entry) => [
        entry.occurred_at,
        TYPE_LABELS[entry.consent_type] || entry.consent_type,
        ACTION_LABELS[entry.action],
        entry.previous_status ?? 'N/A',
        entry.new_status,
        entry.change_reason ?? 'N/A',
        entry.changed_by,
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial_consentimiento_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleExpand = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Consentimientos</CardTitle>
        <CardDescription>
          Registro completo de cambios en sus permisos de datos personales
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">
              Tipo de Consentimiento
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filter.consentType ?? ''}
              onChange={(e) => setFilter({ ...filter, consentType: e.target.value || undefined })}
            >
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">
              Acción
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filter.action ?? ''}
              onChange={(e) => setFilter({ ...filter, action: e.target.value || undefined })}
            >
              <option value="">Todas</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter({})
                // Reset filters
              }}
            >
              Limpiar Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {filteredHistory.length}
            </div>
            <div className="text-sm text-blue-700">
              Total de Cambios
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {history.filter((e) => e.action === 'granted').length}
            </div>
            <div className="text-sm text-green-700">
              Consents Activos
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-900">
              {history.filter((e) => e.action === 'withdrawn').length}
            </div>
            <div className="text-sm text-red-700">
              Retirados
            </div>
          </div>
        </div>

        {/* History List */}
        <ScrollArea className="h-[600px] w-full rounded-md border">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Filter className="h-12 w-12 mb-2 opacity-50" />
              <p>No se encontraron registros de consentimiento</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[entry.action]}>
                          {ACTION_LABELS[entry.action]}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {TYPE_LABELS[entry.consent_type] || entry.consent_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">
                        {formatDate(entry.occurred_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(entry.id)
                      }}
                    >
                      {expandedEntry === entry.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedEntry === entry.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Estado Anterior:</span>
                          <span className="text-gray-600 ml-2">
                            {entry.previous_status ?? 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Estado Nuevo:</span>
                          <span className="ml-2">
                            <Badge className={STATUS_COLORS[entry.action]} variant="outline">
                              {entry.new_status}
                            </Badge>
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Usuario:</span>
                          <span className="text-gray-600 ml-2">
                            {entry.changed_by}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Rol:</span>
                          <span className="ml-2 capitalize">
                            {entry.changed_by_role}
                          </span>
                        </div>
                      </div>

                      {entry.change_reason && (
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <span className="font-medium">Razón:</span>
                          <p className="mt-1 text-gray-700">{entry.change_reason}</p>
                        </div>
                      )}

                      {entry.metadata && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                            Ver metadatos
                          </summary>
                          <div className="mt-2 p-3 bg-gray-100 rounded">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
