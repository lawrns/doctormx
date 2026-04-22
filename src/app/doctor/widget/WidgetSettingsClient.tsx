'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Clipboard,
  Code2,
  Eye,
  Monitor,
  Palette,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { WidgetConfig, WidgetDoctor, WidgetService } from '@/lib/widget'

type WidgetSettingsClientProps = {
  doctor: WidgetDoctor
  initialConfig: WidgetConfig
  widgetUrl: string
}

function pesosFromCents(cents: number) {
  return String(Math.round((cents || 0) / 100))
}

function centsFromPesos(value: string, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.round(parsed * 100)
}

function newService(basePrice: number): WidgetService {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `servicio-${Date.now()}`

  return {
    id,
    name: 'Consulta de seguimiento',
    description: 'Revision clinica y plan de continuidad',
    price_cents: basePrice,
    duration_minutes: 30,
    appointment_type: 'video',
  }
}

export function WidgetSettingsClient({
  doctor,
  initialConfig,
  widgetUrl,
}: WidgetSettingsClientProps) {
  const [config, setConfig] = useState(initialConfig)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const embedCode = useMemo(
    () =>
      `<iframe src="${widgetUrl}" title="Reservar cita con Doctor.mx" style="width:100%;min-height:760px;border:0;border-radius:18px;" loading="lazy"></iframe>`,
    [widgetUrl]
  )

  const updateService = (id: string, update: Partial<WidgetService>) => {
    setConfig((current) => ({
      ...current,
      enabled_services: current.enabled_services.map((service) =>
        service.id === id ? { ...service, ...update } : service
      ),
    }))
  }

  const removeService = (id: string) => {
    setConfig((current) => ({
      ...current,
      enabled_services: current.enabled_services.filter((service) => service.id !== id),
    }))
  }

  const addService = () => {
    setConfig((current) => ({
      ...current,
      enabled_services: [...current.enabled_services, newService(doctor.price_cents)],
    }))
  }

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const save = async () => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/widget/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No pudimos guardar el widget.')
      }

      setConfig(data.config)
      setSavedAt(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No pudimos guardar el widget.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 22 }}
        className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]"
      >
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Canal propio
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
              Widget de reservas
            </h1>
            <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-muted-foreground">
              Publica una agenda ligera en tu sitio y recibe pagos ligados a Doctor.mx.
            </p>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[0_20px_44px_rgba(15,37,95,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: config.is_active ? config.accent_color : '#94a3b8' }}
                  />
                  <h2 className="text-lg font-semibold text-foreground">Estado del widget</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {config.is_active ? 'Disponible para pacientes externos.' : 'Pausado en todos los sitios.'}
                </p>
              </div>
              <Switch
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig((current) => ({ ...current, is_active: checked }))}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[0_20px_44px_rgba(15,37,95,0.08)]">
            <div className="mb-5 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Apariencia</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="primary_color">Color principal</Label>
                <div className="grid grid-cols-[48px_1fr] gap-3">
                  <Input
                    id="primary_color_picker"
                    type="color"
                    value={config.primary_color}
                    onChange={(event) => setConfig((current) => ({ ...current, primary_color: event.target.value }))}
                    className="h-11 rounded-xl p-1"
                    aria-label="Color principal"
                  />
                  <Input
                    id="primary_color"
                    value={config.primary_color}
                    onChange={(event) => setConfig((current) => ({ ...current, primary_color: event.target.value }))}
                    className="h-11 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accent_color">Color de acento</Label>
                <div className="grid grid-cols-[48px_1fr] gap-3">
                  <Input
                    id="accent_color_picker"
                    type="color"
                    value={config.accent_color}
                    onChange={(event) => setConfig((current) => ({ ...current, accent_color: event.target.value }))}
                    className="h-11 rounded-xl p-1"
                    aria-label="Color de acento"
                  />
                  <Input
                    id="accent_color"
                    value={config.accent_color}
                    onChange={(event) => setConfig((current) => ({ ...current, accent_color: event.target.value }))}
                    className="h-11 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="custom_title">Titulo</Label>
                <Input
                  id="custom_title"
                  value={config.custom_title || ''}
                  onChange={(event) => setConfig((current) => ({ ...current, custom_title: event.target.value }))}
                  className="h-11 rounded-xl"
                  placeholder={`Agenda con ${doctor.profile?.full_name || 'tu consultorio'}`}
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="custom_message">Mensaje corto</Label>
                <Textarea
                  id="custom_message"
                  value={config.custom_message || ''}
                  onChange={(event) => setConfig((current) => ({ ...current, custom_message: event.target.value }))}
                  className="min-h-[92px] rounded-xl"
                  placeholder="Texto visible en la cabecera del widget"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[0_20px_44px_rgba(15,37,95,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Servicios</h2>
              </div>
              <Button type="button" variant="outline" onClick={addService} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {config.enabled_services.map((service) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    className="rounded-2xl border border-border/70 bg-secondary/30 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2 sm:col-span-2">
                        <Label>Nombre</Label>
                        <Input
                          value={service.name}
                          onChange={(event) => updateService(service.id, { name: event.target.value })}
                          className="h-10 rounded-xl"
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label>Descripcion</Label>
                        <Input
                          value={service.description}
                          onChange={(event) => updateService(service.id, { description: event.target.value })}
                          className="h-10 rounded-xl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Precio MXN</Label>
                        <Input
                          type="number"
                          min="0"
                          value={pesosFromCents(service.price_cents)}
                          onChange={(event) =>
                            updateService(service.id, {
                              price_cents: centsFromPesos(event.target.value, doctor.price_cents),
                            })
                          }
                          className="h-10 rounded-xl font-mono"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Duracion min</Label>
                        <Input
                          type="number"
                          min="15"
                          max="180"
                          value={service.duration_minutes}
                          onChange={(event) =>
                            updateService(service.id, {
                              duration_minutes: Math.max(15, Number(event.target.value) || 30),
                            })
                          }
                          className="h-10 rounded-xl font-mono"
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label>Modalidad</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['video', 'in_person'] as const).map((type) => {
                            const disabled = type === 'video' ? !doctor.offers_video : !doctor.offers_in_person
                            const active = service.appointment_type === type
                            return (
                              <button
                                key={type}
                                type="button"
                                disabled={disabled}
                                onClick={() => updateService(service.id, { appointment_type: type })}
                                className="h-10 rounded-xl border text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                                style={{
                                  borderColor: active ? config.primary_color : 'hsl(var(--border))',
                                  backgroundColor: active ? config.primary_color : 'transparent',
                                  color: active ? '#ffffff' : 'hsl(var(--foreground))',
                                }}
                              >
                                {type === 'video' ? 'Video' : 'Presencial'}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {config.enabled_services.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeService(service.id)}
                        className="mt-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Quitar servicio
                      </Button>
                    ) : null}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={save}
              disabled={saving}
              className="h-11 rounded-xl px-6 transition-transform active:scale-[0.98]"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar widget'}
            </Button>
            {savedAt ? (
              <p className="text-sm text-muted-foreground">Guardado a las {savedAt}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[0_20px_44px_rgba(15,37,95,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Vista previa</h2>
              </div>
              <a
                href={widgetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Abrir
              </a>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-secondary/40">
              <iframe
                title="Vista previa del widget"
                src={widgetUrl}
                className="h-[720px] w-full bg-white"
                loading="lazy"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[0_20px_44px_rgba(15,37,95,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Codigo de insercion</h2>
            </div>
            <pre className="max-h-48 overflow-auto rounded-2xl border border-border bg-secondary/50 p-4 font-mono text-xs leading-5 text-foreground">
              {embedCode}
            </pre>
            <Button
              type="button"
              variant="outline"
              onClick={copyEmbed}
              className="mt-4 h-11 w-full rounded-xl transition-transform active:scale-[0.98]"
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar codigo'}
            </Button>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
