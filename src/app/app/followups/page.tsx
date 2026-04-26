import { requireRole } from '@/lib/auth'
import { getPatientFollowUps } from '@/lib/followup'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowRight, ClipboardList, Info } from 'lucide-react'

export default async function PatientFollowUpsPage() {
  const { user } = await requireRole('patient')
  let followUps: Awaited<ReturnType<typeof getPatientFollowUps>> = []
  try {
    followUps = await getPatientFollowUps(user.id)
  } catch (error) {
    console.error('Error loading follow-ups:', error)
    followUps = []
  }

  const getStatusBadgeVariant = (status: string): React.ComponentProps<typeof Badge>['variant'] => {
    const variants: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
      pending: 'warning',
      sent: 'default',
      failed: 'destructive',
      responded: 'success',
      cancelled: 'secondary',
    }
    return variants[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      sent: 'Enviado',
      failed: 'Fallido',
      responded: 'Respondido',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      follow_up_24h: 'Seguimiento 24h',
      follow_up_7d: 'Seguimiento 7 días',
      medication_reminder: 'Recordatorio de medicación',
      prescription_refill: 'Renovación de receta',
      chronic_care_check: 'Cuidado crónico',
    }
    return labels[type] || type
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Mis Seguimientos</h1>
          <p className="text-lg text-muted-foreground">Revisa el estado de tus seguimientos y respuestas</p>
        </div>

        {followUps.length === 0 ? (
          <Card className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-4">No tienes seguimientos programados</p>
            <p className="text-muted-foreground mb-6">
              Después de tu primera consulta, recibirás mensajes de seguimiento para asegurarnos de que te sientas bien.
            </p>
            <Link href="/doctors">
              <Button className="inline-flex items-center gap-2">
                Buscar un doctor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <Card
                key={followUp.id}
                className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getStatusBadgeVariant(followUp.status)}>
                        {getStatusLabel(followUp.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getTypeLabel(followUp.type)}
                      </span>
                    </div>
                    <p className="text-foreground">
                      {followUp.type === 'follow_up_24h' && '¿Cómo te sientes 24 horas después de tu consulta?'}
                      {followUp.type === 'follow_up_7d' && 'Seguimiento a 7 días de tu consulta'}
                      {followUp.type === 'medication_reminder' && 'Recordatorio para tomar tu medicamento'}
                      {followUp.type === 'prescription_refill' && 'Tu receta está por terminarse'}
                      {followUp.type === 'chronic_care_check' && 'Verificación de tu condición crónica'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(followUp.scheduled_at).toLocaleDateString('es-MX', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(followUp.scheduled_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {followUp.response && (
                  <div className="bg-secondary/50 rounded-xl border border-border p-4 mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tu respuesta:</p>
                    <p className="text-foreground">{followUp.response}</p>
                  </div>
                )}

                {followUp.status === 'responded' && followUp.response_action && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Acción tomada:</span>{' '}
                      {followUp.response_action === 'logged' && 'Respuesta registrada'}
                      {followUp.response_action === 'alert_doctor' && 'Doctor alertado - te contactarán pronto'}
                      {followUp.response_action === 'suggest_followup' && 'Se sugirió agendar seguimiento'}
                      {followUp.response_action === 'positive_outcome' && '¡Mejoría confirmada!'}
                      {followUp.response_action === 'medication_taken' && 'Adherencia confirmada'}
                      {followUp.response_action === 'medication_missed' && 'Se preguntó sobre la omisión'}
                      {followUp.response_action === 'prescription_renewal' && 'Navegando a renovación'}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-secondary/50 rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">¿Cómo funciona?</h3>
              <p className="text-muted-foreground text-sm">
                Después de tu consulta, te enviaremos mensajes de seguimiento por WhatsApp para verificar tu recuperación.
                Tus respuestas nos ayudan a mejorar tu atención y detectar cualquier problema a tiempo.
                Si reportas algún síntoma preocupante, tu doctor será alertado automáticamente.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
