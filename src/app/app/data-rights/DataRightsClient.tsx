/**
 * Data Rights Client Component
 *
 * Client-side component for managing ARCO rights.
 * Displays requests, statistics, and quick actions for each right.
 *
 * @component DataRightsClient
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Eye,
  Edit3,
  Trash2,
  Ban,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { getStatusColor, getPriorityColor } from '@/lib/arco/client'
import type { ArcoRequestStatus } from '@/types/arco'

interface ArcoRequest {
  id: string
  request_type: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'
  title: string
  description: string
  status: string
  created_at: string
  due_date: string
  priority: string
  data_scope: string[]
}

interface ArcoStats {
  total_requests: number
  pending_requests: number
  completed_requests: number
  average_resolution_days: number
  by_type: Record<string, number>
  by_status: Record<string, number>
}

interface DataRightsClientProps {
  userId: string
  initialRequests: ArcoRequest[]
  initialCount: number
  initialStats?: ArcoStats
}

// ARCO right types configuration
export const ARCO_RIGHTS = [
  {
    type: 'ACCESS' as const,
    title: 'Derecho de Acceso',
    description: 'Solicita una copia de todos tus datos personales',
    icon: <Eye className="h-6 w-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    type: 'RECTIFY' as const,
    title: 'Derecho de Rectificación',
    description: 'Corrige información inexacta o incompleta en tus datos',
    icon: <Edit3 className="h-6 w-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    type: 'CANCEL' as const,
    title: 'Derecho de Cancelación',
    description: 'Solicita la eliminación de tus datos personales',
    icon: <Trash2 className="h-6 w-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    type: 'OPPOSE' as const,
    title: 'Derecho de Oposición',
    description: 'Opónete al procesamiento de tus datos para fines específicos',
    icon: <Ban className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
]

export function DataRightsClient({
  userId,
  initialRequests,
  initialCount,
  initialStats,
}: DataRightsClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'stats'>('overview')

  const stats = initialStats ?? {
    total_requests: initialCount,
    pending_requests: initialRequests.filter(r => r.status === 'pending' || r.status === 'acknowledged').length,
    completed_requests: initialRequests.filter(r => r.status === 'completed').length,
    average_resolution_days: 0,
    by_type: {} as Record<string, number>,
    by_status: {} as Record<string, number>,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      acknowledged: 'Reconocido',
      processing: 'Procesando',
      info_required: 'Info Requerida',
      escalated: 'Escalado',
      completed: 'Completado',
      denied: 'Denegado',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Baja',
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente',
    }
    return labels[priority] || priority
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'ACCESS':
        return <Eye className="h-5 w-5 text-blue-600" />
      case 'RECTIFY':
        return <Edit3 className="h-5 w-5 text-green-600" />
      case 'CANCEL':
        return <Trash2 className="h-5 w-5 text-red-600" />
      case 'OPPOSE':
        return <Ban className="h-5 w-5 text-purple-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() &&
           !['completed', 'denied', 'cancelled'].includes(status)
  }

  const recentRequests = initialRequests.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Centro de Derechos ARCO</h1>
              <p className="text-xs text-gray-500">Derechos de Acceso, Rectificación, Cancelación y Oposición</p>
            </div>
          </div>
          <Link href="/app/data-rights/new">
            <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
          </Link>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {/* Legal Notice Banner */}
        <Alert className="mb-6 border-indigo-200 bg-indigo-50">
          <Shield className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-900">
            <strong>Tus derechos ARCO:</strong> Conforme a la LFPDPPP, tienes derecho a Acceder, Rectificar,
            Cancelar u Oponerte al tratamiento de tus datos personales. Todas las solicitudes son atendidas
            dentro de un plazo máximo de 20 días hábiles.
          </AlertDescription>
        </Alert>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-indigo-50 border-indigo-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Total de Solicitudes</p>
                  <p className="text-3xl font-bold text-indigo-900">{stats.total_requests}</p>
                </div>
                <FileText className="h-10 w-10 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-amber-900">{stats.pending_requests}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Completadas</p>
                  <p className="text-3xl font-bold text-green-900">{stats.completed_requests}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Promedio Resolución</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.average_resolution_days > 0 ? `${stats.average_resolution_days}d` : 'N/A'}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'requests' | 'stats')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="overview">Derechos</TabsTrigger>
            <TabsTrigger value="requests">Mis Solicitudes</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Overview Tab - ARCO Rights */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tus Derechos ARCO</CardTitle>
                <CardDescription>
                  Selecciona un derecho para ejercer o crear una nueva solicitud
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ARCO_RIGHTS.map((right) => {
                    const requestCount = stats.by_type[right.type] ?? 0
                    return (
                      <Link
                        key={right.type}
                        href={`/app/data-rights/new?type=${right.type}`}
                        className="group"
                      >
                        <Card className={`transition-all hover:shadow-md cursor-pointer ${right.bgColor} ${right.borderColor}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${right.bgColor}`}>
                                <div className={right.color}>
                                  {right.icon}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className={`font-semibold text-gray-900 mb-2 group-hover:${right.color} transition-colors`}>
                                  {right.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  {right.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className={`${right.bgColor} ${right.borderColor}`}>
                                    {requestCount} solicitud{requestCount !== 1 ? 'es' : ''}
                                  </Badge>
                                  <ChevronRight className={`h-5 w-5 text-gray-400 group-hover:${right.color} transition-colors`} />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Requests Preview */}
            {recentRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Actividad Reciente</CardTitle>
                      <CardDescription>Tus últimas solicitudes ARCO</CardDescription>
                    </div>
                    <Link href="/app/data-rights">
                      <Button variant="outline" size="sm">
                        Ver Todo
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-3">
                      {recentRequests.map((request) => (
                        <Link
                          key={request.id}
                          href={`/app/data-rights/${request.id}`}
                          className="block"
                        >
                          <div className="flex items-start gap-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex-shrink-0 mt-1">
                              {getRequestTypeIcon(request.request_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {request.title}
                                </span>
                                <Badge className={getStatusColor(request.status as ArcoRequestStatus)} variant="outline">
                                  {getStatusLabel(request.status)}
                                </Badge>
                                {isOverdue(request.due_date, request.status) && (
                                  <Badge className="bg-red-100 text-red-800" variant="outline">
                                    Vencida
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {formatDate(request.created_at)}
                              </p>
                              <div className="text-xs text-gray-500">
                                Vence: {formatDate(request.due_date)} • {getPriorityLabel(request.priority)}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Ver Detalles
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab - Full List */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Historial de Solicitudes</CardTitle>
                    <CardDescription>Todas tus solicitudes ARCO</CardDescription>
                  </div>
                  <Link href="/app/data-rights/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Solicitud
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {initialRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Shield className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-center mb-4">No tienes solicitudes ARCO aún</p>
                    <Link href="/app/data-rights/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primera Solicitud
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="space-y-3 pr-4">
                      {initialRequests.map((request) => (
                        <Link
                          key={request.id}
                          href={`/app/data-rights/${request.id}`}
                          className="block"
                        >
                          <div className="flex items-start gap-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex-shrink-0 mt-1">
                              {getRequestTypeIcon(request.request_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {request.title}
                                </span>
                                <Badge className={getStatusColor(request.status as ArcoRequestStatus)} variant="outline">
                                  {getStatusLabel(request.status)}
                                </Badge>
                                {isOverdue(request.due_date, request.status) && (
                                  <Badge className="bg-red-100 text-red-800" variant="outline">
                                    Vencida
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Creada: {formatDate(request.created_at)}</span>
                                <span>Vence: {formatDate(request.due_date)}</span>
                                <span>{getPriorityLabel(request.priority)}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Ver Detalles
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes por Tipo</CardTitle>
                  <CardDescription>Distribución de tus solicitudes ARCO</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ARCO_RIGHTS.map((right) => {
                      const count = stats.by_type[right.type] ?? 0
                      const percentage = stats.total_requests > 0
                        ? Math.round((count / stats.total_requests) * 100)
                        : 0

                      return (
                        <div key={right.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded ${right.bgColor}`}>
                                <div className={right.color}>
                                  {right.icon}
                                </div>
                              </div>
                              <span className="font-medium text-gray-900">{right.title}</span>
                            </div>
                            <span className="font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* By Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes por Estado</CardTitle>
                  <CardDescription>Estado actual de tus solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status as ArcoRequestStatus)} variant="outline">
                            {getStatusLabel(status)}
                          </Badge>
                        </div>
                        <span className="font-bold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Privacy Notice */}
      <Card className="max-w-6xl mx-auto mt-8 border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-amber-900 mb-2">Aviso de Privacidad</h4>
          <p className="text-sm text-amber-800">
            El ejercicio de tus derechos ARCO es gratuito y conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares (LFPDPPP). Para más información, consulta nuestro{' '}
            <a href="/privacy" className="underline font-medium">
              Aviso de Privacidad
            </a>
            {' '}y{' '}
            <a href="/app/consent" className="underline font-medium">
              Centro de Consentimientos
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
