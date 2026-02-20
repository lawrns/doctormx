/**
 * Consent Management Client Component
 *
 * Client-side component for managing user consents.
 * Displays consent history with filtering and statistics.
 *
 * @component ConsentManagementClient
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Plus, Download, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { ConsentHistory } from '@/components/consent/ConsentHistory'
import type { ConsentType } from '@/lib/consent/client'
import { CONSENT_TYPE_LABELS } from '@/lib/consent/client'

// Types for the component props
interface ConsentHistoryEntry {
  id: string
  consent_record_id: string
  consent_type: string
  consent_type_label: string
  action: string
  old_status: string | null
  new_status: string
  old_consent_version_id: string | null
  new_consent_version_id: string
  changed_by: string
  changed_by_role: string
  change_reason: string | null
  ip_address: string | null
  created_at: string
}

interface ConsentStatistics {
  total_entries: number
  by_action: Record<string, number>
  by_consent_type: Record<string, number>
}

interface ConsentManagementClientProps {
  userId: string
  initialHistory: ConsentHistoryEntry[]
  initialStatistics?: ConsentStatistics
}

// Available consent types for new consent
const AVAILABLE_CONSENT_TYPES: ConsentType[] = [
  'medical_treatment',
  'data_processing',
  'telemedicine',
  'recording',
  'ai_analysis',
  'data_sharing',
  'research',
  'marketing',
  'emergency_contact',
  'prescription_forwarding',
]

export function ConsentManagementClient({
  userId,
  initialHistory,
  initialStatistics,
}: ConsentManagementClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')

  // Calculate statistics if not provided
  const stats = initialStatistics ?? {
    total_entries: initialHistory.length,
    by_action: initialHistory.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] ?? 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_consent_type: initialHistory.reduce((acc, entry) => {
      const type = entry.consent_type ?? 'unknown'
      acc[type] = (acc[type] ?? 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'granted':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-blue-600" />
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'granted':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'withdrawn':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'expired':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'modified':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      granted: 'Otorgado',
      withdrawn: 'Retirado',
      expired: 'Expirado',
      modified: 'Modificado',
      revoked: 'Revocado',
    }
    return labels[action] || action
  }

  // Group recent activity by consent record
  const recentActivity = initialHistory.slice(0, 10)
  const consentRecordsMap = new Map<string, ConsentHistoryEntry[]>()

  for (const entry of recentActivity) {
    const existing = consentRecordsMap.get(entry.consent_record_id) ?? []
    existing.push(entry)
    consentRecordsMap.set(entry.consent_record_id, existing)
  }

  const uniqueConsentRecords = Array.from(consentRecordsMap.entries()).map(
    ([consentRecordId, entries]) => ({
      id: consentRecordId,
      latestEntry: entries[0], // First entry is the most recent
      changeCount: entries.length,
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Centro de Consentimientos</h1>
              <p className="text-xs text-gray-500">Gestiona tus permisos de datos</p>
            </div>
          </div>
          <Link href="/app/consent/new">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Consentimiento
            </Button>
          </Link>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total de Cambios</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_entries}</p>
                </div>
                <FileText className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Consents Activos</p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.by_action.granted ?? 0}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Retirados</p>
                  <p className="text-3xl font-bold text-red-900">
                    {stats.by_action.withdrawn ?? 0}
                  </p>
                </div>
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Tipos de Consent</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {Object.keys(stats.by_consent_type).length}
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'history')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="history">Historial Completo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Available Consent Types */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Consentimiento Disponibles</CardTitle>
                <CardDescription>
                  Administra tus permisos para diferentes tipos de procesamiento de datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_CONSENT_TYPES.map((consentType) => {
                    const hasConsent = Object.keys(stats.by_consent_type).includes(consentType)
                    return (
                      <Link
                        key={consentType}
                        href={`/app/consent/new?type=${consentType}`}
                        className="group"
                      >
                        <Card className="transition-all hover:shadow-md hover:border-blue-300 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                  {CONSENT_TYPE_LABELS[consentType]}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {hasConsent ? (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Ya otorgado
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-gray-500">
                                      <Plus className="h-3 w-3" />
                                      Otorgar
                                    </span>
                                  )}
                                </p>
                              </div>
                              <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>
                      Últimos cambios en tus consentimientos
                    </CardDescription>
                  </div>
                  <Link href="/app/consent/history">
                    <Button variant="outline" size="sm">
                      Ver Todo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full">
                  {uniqueConsentRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                      <FileText className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-center">No hay actividad reciente</p>
                      <Link href="/app/consent/new" className="mt-4">
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Otorgar Primer Consentimiento
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {uniqueConsentRecords.map(({ id, latestEntry, changeCount }) => (
                        <Link
                          key={id}
                          href={`/app/consent/${id}`}
                          className="block hover:bg-gray-50 transition-colors"
                        >
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getActionIcon(latestEntry.action)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {latestEntry.consent_type_label}
                                  </span>
                                  <Badge className={getActionBadgeColor(latestEntry.action)} variant="outline">
                                    {getActionLabel(latestEntry.action)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {formatDate(latestEntry.created_at)}
                                  {changeCount > 1 && (
                                    <span className="ml-2">
                                      • {changeCount} cambios
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Ver Detalles
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab - Full ConsentHistory Component */}
          <TabsContent value="history">
            <ConsentHistory userId={userId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
