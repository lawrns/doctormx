import Link from 'next/link'
import { CalendarCheck, FileCheck2, MessageSquareQuote, ShieldCheck, Star, Stethoscope } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { CTABand, FeatureGrid, IconBadge, SectionHeader, StepTimeline, TrustBar } from '@/components/ui/card-patterns'

const featureItems = [
  { icon: ShieldCheck, title: 'Médicos verificados', body: 'Cédula visible cuando existe en expediente.' },
  { icon: Star, title: 'Reseñas reales', body: 'Opiniones asociadas a consultas completadas.' },
  { icon: CalendarCheck, title: 'Disponibilidad', body: 'Slots reales conectados al flujo de reserva.' },
]

export default function CardsDevPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="editorial-shell public-section">
        <SectionHeader eyebrow="Card system" title="Doctor.mx card variants">
          Visual specimens for density, spacing, radius, shadow, icon scale, and interaction states.
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardTitle>Default card</CardTitle>
            <CardDescription className="mt-2">16px padding, 12px radius, one border, one shadow.</CardDescription>
          </Card>

          <Card variant="interactive" asChild>
            <Link href="/doctors" aria-label="Interactive doctor card specimen">
              <div className="flex gap-3">
                <IconBadge icon={Stethoscope} />
                <div>
                  <CardTitle>Interactive card</CardTitle>
                  <CardDescription className="mt-2">Single focusable element with subtle hover.</CardDescription>
                </div>
              </div>
            </Link>
          </Card>

          <Card variant="stat">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Stat</p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.03em]">4.9/5</p>
            <p className="text-[13px] text-muted-foreground">Calificación promedio</p>
          </Card>

          <Card variant="testimonial">
            <MessageSquareQuote className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm leading-6 text-foreground">Me ayudó a entender qué especialista necesitaba antes de reservar.</p>
            <Badge className="mt-3">Paciente verificada</Badge>
          </Card>

          <Card variant="preview">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Preview card</CardTitle>
              <Badge variant="info">IA asistiva</Badge>
            </div>
            <div className="mt-4 rounded-[8px] border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              Structured fake UI belongs here, with fixed media slots and compact rows.
            </div>
          </Card>

          <Card variant="chip" className="flex items-center gap-3">
            <IconBadge icon={FileCheck2} size="sm" />
            <span className="text-sm font-semibold">Chip card</span>
          </Card>
        </div>
      </section>

      <section className="editorial-shell public-section-compact">
        <SectionHeader eyebrow="Patterns" title="Reusable section patterns" />
        <FeatureGrid items={featureItems} />
        <div className="mt-4">
          <TrustBar items={featureItems} className="lg:grid-cols-3" />
        </div>
      </section>

      <StepTimeline
        eyebrow="StepTimeline"
        title="One compact timeline for repeated process sections."
        body="Use this for Cómo funciona, Doctor Connect, and clinical trust sequences."
        steps={featureItems}
      />

      <CTABand
        eyebrow="CTABand"
        title="One CTA band, no repeated bespoke shells."
        body="Use only when the page needs a final conversion prompt."
        primary={<Button>Primary CTA</Button>}
        secondary={<Button variant="outline">Secondary</Button>}
      />
    </main>
  )
}
