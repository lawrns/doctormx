'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { captureError } from '@/lib/utils'
import {
  FileText,
  Plus,
  Trash2,
  Star,
  GripVertical,
  Type,
  ListChecks,
  ToggleLeft,
  Hash,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Copy,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'

interface IntakeField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  helpText?: string
}

interface IntakeTemplate {
  id: string
  name: string
  specialty_context: string | null
  description: string | null
  fields_json: IntakeField[]
  is_default: boolean
  is_active: boolean
  created_at: string
}

export default function DoctorIntakeFormsPage() {
  const [templates, setTemplates] = useState<IntakeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<IntakeTemplate | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)

  const fetchTemplates = useCallback(() => {
    fetch('/api/intake/templates')
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data.templates || [])
        setLoading(false)
      })
      .catch((err) => {
        captureError(err, 'IntakeFormsPage.fetchTemplates')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Formularios de ingreso
            </h1>
            <p className="mt-2 text-muted-foreground text-base max-w-[65ch] leading-relaxed">
              Crea formularios que tus pacientes completan antes de la consulta.
              Recopila síntomas, historial médico y más para aprovechar mejor el tiempo de consulta.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null)
              setShowBuilder(true)
            }}
            className="gap-2 transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nuevo formulario
          </Button>
        </div>

        <AnimatePresence>
          {showBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 overflow-hidden"
            >
              <IntakeFormBuilder
                template={editing}
                onClose={() => setShowBuilder(false)}
                onSaved={() => {
                  setShowBuilder(false)
                  fetchTemplates()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-border transition-colors group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                            {template.name}
                            {template.is_default && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Star className="w-3 h-3 mr-1" />
                                Predeterminado
                              </Badge>
                            )}
                          </h3>
                          {template.specialty_context && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {template.specialty_context}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditing(template)
                            setShowBuilder(true)
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description || `${template.fields_json.length} campo${template.fields_json.length !== 1 ? 's' : ''} configurado${template.fields_json.length !== 1 ? 's' : ''}`}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {template.fields_json.slice(0, 4).map((f) => (
                        <span
                          key={f.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[11px] font-medium text-muted-foreground"
                        >
                          <FieldTypeIcon type={f.type} />
                          {f.label.slice(0, 18)}{f.label.length > 18 ? '...' : ''}
                        </span>
                      ))}
                      {template.fields_json.length > 4 && (
                        <span className="text-[11px] text-muted-foreground">
                          +{template.fields_json.length - 4} más
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {templates.length === 0 && !showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-border/60 rounded-xl"
          >
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin formularios aún
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Crea tu primer formulario de ingreso para que los pacientes completen antes de sus citas.
            </p>
            <Button
              onClick={() => {
                setEditing(null)
                setShowBuilder(true)
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear formulario
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function FieldTypeIcon({ type }: { type: string }) {
  const iconClass = 'w-3 h-3'
  switch (type) {
    case 'text':
    case 'textarea':
      return <Type className={iconClass} />
    case 'select':
    case 'multiselect':
      return <ListChecks className={iconClass} />
    case 'yesno':
      return <ToggleLeft className={iconClass} />
    case 'number':
    case 'scale':
      return <Hash className={iconClass} />
    case 'date':
      return <Calendar className={iconClass} />
    default:
      return <Type className={iconClass} />
  }
}

function IntakeFormBuilder({
  template,
  onClose,
  onSaved,
}: {
  template: IntakeTemplate | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [isDefault, setIsDefault] = useState(template?.is_default ?? false)
  const [fields, setFields] = useState<IntakeField[]>(template?.fields_json || [])
  const [saving, setSaving] = useState(false)

  const addField = (type: string) => {
    const id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newField: IntakeField = {
      id,
      type,
      label: type === 'text' ? 'Nuevo campo de texto' : type === 'textarea' ? 'Área de texto' : type === 'select' ? 'Selección' : type === 'yesno' ? 'Sí / No' : type === 'number' ? 'Número' : type === 'scale' ? 'Escala' : type === 'date' ? 'Fecha' : 'Campo',
      required: false,
    }
    if (type === 'select' || type === 'multiselect') {
      newField.options = ['Opción 1', 'Opción 2', 'Opción 3']
    }
    if (type === 'scale') {
      newField.min = 0
      newField.max = 10
    }
    setFields((f) => [...f, newField])
  }

  const updateField = (index: number, updates: Partial<IntakeField>) => {
    setFields((f) => f.map((field, i) => (i === index ? { ...field, ...updates } : field)))
  }

  const removeField = (index: number) => {
    setFields((f) => f.filter((_, i) => i !== index))
  }

  const moveField = (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= fields.length) return
    const newFields = [...fields]
    const [removed] = newFields.splice(index, 1)
    newFields.splice(newIndex, 0, removed)
    setFields(newFields)
  }

  const save = async () => {
    if (!name.trim()) {
      toast.error('El nombre del formulario es obligatorio')
      return
    }
    if (fields.length === 0) {
      toast.error('Agrega al menos un campo')
      return
    }

    setSaving(true)
    try {
      const payload = {
        id: template?.id,
        name,
        description,
        fields_json: fields,
        is_default: isDefault,
      }

      const res = await fetch('/api/intake/templates', {
        method: template ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(template ? 'Formulario actualizado' : 'Formulario creado')
        onSaved()
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de red')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {template ? 'Editar formulario' : 'Nuevo formulario de ingreso'}
        </CardTitle>
        <CardDescription>
          Configura los campos que los pacientes completarán antes de la consulta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del formulario</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Consulta General, Primera visita..."
              className="max-w-md"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito de este formulario..."
              className="max-w-md resize-none"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="is-default" className="text-sm cursor-pointer">
              Usar como predeterminado para nuevas citas
            </Label>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Campos ({fields.length})
            </h3>
            <div className="flex items-center gap-1.5">
              {[
                { type: 'text', label: 'Texto', icon: Type },
                { type: 'textarea', label: 'Párrafo', icon: Type },
                { type: 'select', label: 'Opciones', icon: ListChecks },
                { type: 'yesno', label: 'Sí/No', icon: ToggleLeft },
                { type: 'number', label: 'Número', icon: Hash },
                { type: 'scale', label: 'Escala', icon: Hash },
              ].map((t) => (
                <Button
                  key={t.type}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => addField(t.type)}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {fields.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border/60 rounded-lg">
                <Plus className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Agrega campos usando los botones de arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-secondary/30"
                  >
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        onClick={() => moveField(index, -1)}
                        disabled={index === 0}
                        className="p-0.5 rounded hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveField(index, 1)}
                        disabled={index === fields.length - 1}
                        className="p-0.5 rounded hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center gap-3">
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="flex-1 text-sm font-medium"
                          placeholder="Etiqueta del campo"
                        />
                        <span className="text-xs text-muted-foreground shrink-0 px-2 py-1 rounded bg-secondary capitalize">
                          {field.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`req-${field.id}`}
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded border-border"
                          />
                          <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">
                            Obligatorio
                          </Label>
                        </div>

                        {(field.type === 'text' || field.type === 'textarea') && (
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            placeholder="Texto de ayuda..."
                            className="text-xs h-7 w-48"
                          />
                        )}

                        {(field.type === 'select' || field.type === 'multiselect') && (
                          <Input
                            value={field.options?.join(', ') || ''}
                            onChange={(e) =>
                              updateField(index, {
                                options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            placeholder="Opciones separadas por coma"
                            className="text-xs h-7 flex-1 min-w-[200px]"
                          />
                        )}

                        {field.type === 'scale' && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Min: {field.min ?? 0}</span>
                            <span>Max: {field.max ?? 10}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2 transition-transform active:scale-[0.98]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {template ? 'Actualizar' : 'Guardar formulario'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
