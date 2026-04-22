'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Stethoscope,
  Activity,
  Pill,
  User,
} from 'lucide-react'

interface IntakeResponseData {
  id: string
  responses_json: Record<string, unknown>
  has_red_flags: boolean
  red_flags: string[]
  status: string
  completed_at: string | null
  template: {
    name: string
    fields_json: Array<{
      id: string
      type: string
      label: string
      helpText?: string
    }>
  }
}

interface IntakeResponseReviewProps {
  response: IntakeResponseData | null
  appointmentId: string
}

export default function IntakeResponseReview({ response, appointmentId }: IntakeResponseReviewProps) {
  const [expanded, setExpanded] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  if (!response) {
    return (
      <Card className="border border-dashed border-border/60 bg-secondary/20">
        <CardContent className="p-5 flex items-center gap-3">
          <FileText className="w-5 h-5 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Formulario no completado</p>
            <p className="text-xs text-muted-foreground/70">
              El paciente aún no ha llenado el formulario previo a consulta
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const markReviewed = async () => {
    setReviewing(true)
    try {
      const res = await fetch('/api/intake/responses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Formulario marcado como revisado')
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error('Error de red')
    } finally {
      setReviewing(false)
    }
  }

  const getResponseValue = (fieldId: string): string => {
    const val = response.responses_json[fieldId]
    if (val === undefined || val === null) return '-'
    if (Array.isArray(val)) return val.join(', ')
    if (typeof val === 'boolean') return val ? 'Sí' : 'No'
    return String(val)
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'scale':
        return <Activity className="w-3.5 h-3.5" />
      case 'textarea':
      case 'text':
        return <Stethoscope className="w-3.5 h-3.5" />
      case 'select':
      case 'multiselect':
        return <Pill className="w-3.5 h-3.5" />
      default:
        return <User className="w-3.5 h-3.5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className={`border shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
        response.has_red_flags
          ? 'border-red-200/60 bg-red-50/[0.3]'
          : 'border-border/60'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                response.has_red_flags ? 'bg-red-100' : 'bg-primary/8'
              }`}>
                <FileText className={`w-4 h-4 ${response.has_red_flags ? 'text-red-600' : 'text-primary'}`} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">
                  {response.template?.name || 'Formulario de ingreso'}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completado{' '}
                  {response.completed_at
                    ? new Date(response.completed_at).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'recientemente'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {response.has_red_flags && (
                <Badge variant="destructive" className="gap-1 text-[10px] font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {response.red_flags?.length} alerta{response.red_flags?.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {response.status === 'reviewed' && (
                <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Revisado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Red flags summary */}
          <AnimatePresence>
            {response.has_red_flags && response.red_flags && response.red_flags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-1.5">
                  {response.red_flags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-md px-3 py-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {flag}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                <div className="space-y-3">
                  {response.template?.fields_json?.map((field, i) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        {getFieldIcon(field.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          {field.label}
                        </p>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {getResponseValue(field.id)}
                        </p>
                      </div>
                    </motion.div>
                  )) || (
                    <p className="text-sm text-muted-foreground">
                      Sin campos configurados
                    </p>
                  )}
                </div>

                {response.status !== 'reviewed' && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 transition-transform active:scale-[0.98]"
                      onClick={markReviewed}
                      disabled={reviewing}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Marcar como revisado
                    </Button>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
