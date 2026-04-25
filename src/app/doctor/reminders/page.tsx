'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Bell,
  Mail,
  MessageCircle,
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
} from 'lucide-react'

interface ReminderPrefs {
  email_enabled: boolean
  sms_enabled: boolean
  whatsapp_enabled: boolean
  reminder_48h: boolean
  reminder_24h: boolean
  reminder_2h: boolean
  preferred_language: string
}

interface ReminderStat {
  status: string
  count: number
}

export default function DoctorRemindersPage() {
  const [prefs, setPrefs] = useState<ReminderPrefs>({
    email_enabled: true,
    sms_enabled: false,
    whatsapp_enabled: true,
    reminder_48h: true,
    reminder_24h: true,
    reminder_2h: true,
    preferred_language: 'es',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<ReminderStat[]>([])
  const [recentReminders, setRecentReminders] = useState<Array<{
    id: string
    hours_before: number
    channel: string
    status: string
    scheduled_at: string
    patient_response?: string | null
  }>>([])

  useEffect(() => {
    fetch('/api/doctor/reminders/preferences')
      .then((r) => r.json())
      .then((data) => {
        if (data.preferences) {
          setPrefs((p) => ({ ...p, ...data.preferences }))
        }
      })
      .finally(() => setLoading(false))

    // Fetch stats separately
    fetch('/api/doctor/reminders/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats)
        if (data.recent) setRecentReminders(data.recent)
      })
      .catch((err) => {
        console.error('[RemindersPage] Failed to load reminder stats:', err)
      })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/doctor/reminders/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Preferencias guardadas')
        setPrefs((p) => ({ ...p, ...data.preferences }))
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de red')
    } finally {
      setSaving(false)
    }
  }

  const toggle = (key: keyof ReminderPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  const activeChannels = [
    prefs.email_enabled && { icon: Mail, label: 'Correo electrónico', color: 'text-blue-500' },
    prefs.whatsapp_enabled && { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-500' },
    prefs.sms_enabled && { icon: Smartphone, label: 'SMS', color: 'text-amber-500' },
  ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; color: string }>

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Recordatorios automáticos
          </h1>
          <p className="mt-2 text-muted-foreground text-base max-w-[65ch] leading-relaxed">
            Configura cómo y cuándo tus pacientes reciben recordatorios antes de sus citas.
            Reduce ausencias y mejora la puntualidad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Canales de notificación
                </CardTitle>
                <CardDescription>
                  Elige qué canales usar para recordatorios automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium cursor-pointer" htmlFor="email-toggle">
                        Correo electrónico
                      </Label>
                      <p className="text-xs text-muted-foreground">Envía recordatorios al correo del paciente</p>
                    </div>
                  </div>
                  <Switch
                    id="email-toggle"
                    checked={prefs.email_enabled}
                    onCheckedChange={() => toggle('email_enabled')}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium cursor-pointer" htmlFor="whatsapp-toggle">
                        WhatsApp
                      </Label>
                      <p className="text-xs text-muted-foreground">Mensajes directos vía WhatsApp Business</p>
                    </div>
                  </div>
                  <Switch
                    id="whatsapp-toggle"
                    checked={prefs.whatsapp_enabled}
                    onCheckedChange={() => toggle('whatsapp_enabled')}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium cursor-pointer" htmlFor="sms-toggle">
                        SMS
                      </Label>
                      <p className="text-xs text-muted-foreground">Mensajes de texto (requiere configuración adicional)</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-toggle"
                    checked={prefs.sms_enabled}
                    onCheckedChange={() => toggle('sms_enabled')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Momentos de recordatorio
                </CardTitle>
                <CardDescription>
                  Define cuánto tiempo antes de la cita se envían los recordatorios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'reminder_48h' as const, label: '48 horas antes', desc: 'Primer recordatorio con opción de confirmar o cancelar' },
                  { key: 'reminder_24h' as const, label: '24 horas antes', desc: 'Recordatorio de preparación con detalles de la cita' },
                  { key: 'reminder_2h' as const, label: '2 horas antes', desc: 'Alerta final con enlace a la videoconsulta' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
                  >
                    <div>
                      <Label className="text-sm font-medium cursor-pointer" htmlFor={item.key}>
                        {item.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={prefs[item.key]}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={save}
                disabled={saving}
                className="px-6 transition-transform active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar preferencias'
                )}
              </Button>
            </div>
          </div>

          {/* Right column - stats */}
          <div className="space-y-6">
            <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Estado del sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Sistema activo</p>
                    <p className="text-xs text-emerald-600">
                      {activeChannels.length} canal{activeChannels.length !== 1 ? 'es' : ''} configurado{activeChannels.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {activeChannels.length === 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Sin canales activos</p>
                      <p className="text-xs text-amber-600">Activa al menos un canal para enviar recordatorios</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Canales activos
                  </p>
                  {activeChannels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeChannels.map((ch) => (
                        <span
                          key={ch.label}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium"
                        >
                          <ch.icon className={`w-3.5 h-3.5 ${ch.color}`} />
                          {ch.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Ninguno seleccionado</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                {recentReminders.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {recentReminders.slice(0, 5).map((rem, i) => (
                        <motion.div
                          key={rem.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                        >
                          <div className="flex items-center gap-2.5">
                            {rem.channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                            {rem.channel === 'whatsapp' && <MessageCircle className="w-4 h-4 text-green-500" />}
                            {rem.channel === 'sms' && <Smartphone className="w-4 h-4 text-amber-500" />}
                            <div>
                              <p className="text-sm font-medium">
                                {rem.hours_before}h antes
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {rem.status}
                              </p>
                            </div>
                          </div>
                          {rem.patient_response && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              rem.patient_response === 'confirm'
                                ? 'bg-emerald-100 text-emerald-700'
                                : rem.patient_response === 'cancel'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {rem.patient_response === 'confirm' ? 'Confirmado' : rem.patient_response === 'cancel' ? 'Cancelado' : 'Reagendado'}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <RefreshCcw className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Aún no hay recordatorios enviados</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Los recordatorios se enviarán automáticamente cuando los pacientes agenden citas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
