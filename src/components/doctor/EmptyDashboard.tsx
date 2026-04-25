'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ArrowRight, Lightbulb, UserCheck, Calendar, Share2, Users } from 'lucide-react'

interface EmptyDashboardProps {
  doctorId: string
}

const checklist = [
  {
    id: 'profile',
    label: 'Completa tu perfil profesional',
    href: '/doctor/onboarding',
    icon: UserCheck,
  },
  {
    id: 'availability',
    label: 'Configura tu disponibilidad',
    href: '/doctor/availability',
    icon: Calendar,
  },
  {
    id: 'share',
    label: 'Comparte tu enlace de perfil',
    href: '/doctor/profile',
    icon: Share2,
  },
  {
    id: 'first-patient',
    label: 'Recibe tu primer paciente',
    href: '/doctor',
    icon: Users,
  },
]

const tips = [
  'Completa tu biografía con detalles sobre tu experiencia y enfoque. Los pacientes confían más en perfiles completos.',
  'Responde las preguntas de pacientes en la sección de Q&A. Esto demuestra tu criterio clínico.',
  'Mantén tu disponibilidad actualizada. Los pacientes reservan más cuando ven horarios recientes.',
  'Considera ofrecer un precio competitivo al inicio para atraer a tus primeros pacientes y generar reseñas.',
]

export default function EmptyDashboard({ doctorId }: EmptyDashboardProps) {
  void doctorId

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
          Bienvenido a Doctor.mx
        </h2>
        <p className="text-muted-foreground">
          Sigue estos pasos para comenzar a recibir pacientes
        </p>
      </div>

      {/* Checklist */}
      <Card className="rounded-2xl border border-border shadow-dx-1 mb-8">
        <CardHeader>
          <CardTitle className="font-display text-lg font-semibold">
            Lista de configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map((item, i) => {
              const isFirst = i === 0
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFirst ? (
                      <CheckCircle2 className="h-5 w-5 text-vital" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips section */}
      <Card className="rounded-2xl border border-border shadow-dx-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle className="font-display text-lg font-semibold">
              Consejos para tu primer paciente
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-xl bg-secondary/30"
              >
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/doctor/onboarding">
                Completar perfil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/doctor/preguntas">
                Responder preguntas
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
