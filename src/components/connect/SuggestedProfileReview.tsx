import Image from 'next/image'
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { IconBadge, SectionHeader } from '@/components/ui/card-patterns'

const fields = [
  { label: 'Nombre público', value: 'Dra. Ana López', source: 'Doctor.mx directory', status: 'Sugerido' },
  { label: 'Especialidad', value: 'Dermatología', source: 'IA + fuente pública', status: 'Sugerido' },
  { label: 'Dirección', value: 'Polanco, CDMX', source: 'Places', status: 'Sugerido' },
  { label: 'Cédula profesional', value: 'Pendiente', source: 'SEP / médico', status: 'No verificado' },
]

const reviewPhoto = null

export function SuggestedProfileReview() {
  return (
    <section className="border-b border-border bg-card py-10 md:py-12 lg:py-14">
      <div className="editorial-shell">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.84fr)_minmax(360px,560px)] lg:items-start">
          <SectionHeader
            eyebrow="Revisión de datos"
            title="Cada campo tiene origen, estado y responsabilidad."
            className="mb-0 max-w-2xl [&_h2]:text-[clamp(1.85rem,3vw,2.8rem)]"
          >
            Doctor Connect debe impresionar sin prometer verificación automática. El médico ve lo sugerido, lo faltante y lo que debe confirmarse antes de publicar.
          </SectionHeader>

          <Card variant="preview" tone="tint" density="compact" className="w-full max-w-[560px] justify-self-end rounded-xl shadow-none">
            <div className="mb-3 grid gap-3 rounded-xl border border-border bg-card p-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center">
              {reviewPhoto && (
                <div className="relative h-20 overflow-hidden rounded-lg bg-surface-tint">
                  <Image
                    src={reviewPhoto}
                    alt="Revisión de información médica antes de publicar un perfil"
                    fill
                    sizes="136px"
                    className="object-cover object-[52%_52%]"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-5 text-foreground">
                  El borrador acelera la captura; la verificación sigue separada.
                </p>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  Mostramos fuentes y confianza por campo para que el médico confirme antes de publicar.
                </p>
              </div>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {fields.map((field) => (
                <div key={field.label} className="grid min-w-0 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_8.5rem_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold leading-5 text-foreground">{field.label}</p>
                    <p className="mt-0.5 truncate text-[13px] leading-5 text-muted-foreground">{field.value}</p>
                  </div>
                  <p className="min-w-0 truncate text-[12px] leading-5 text-muted-foreground">{field.source}</p>
                  <Badge
                    variant={field.status === 'No verificado' ? 'outline' : 'info'}
                    className="rounded-md px-2 py-0.5 text-[9px] normal-case tracking-[0.04em]"
                  >
                    {field.status === 'No verificado' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {field.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Card variant="chip" className="mt-3 flex items-start gap-2.5 rounded-xl text-[13px] leading-5 text-muted-foreground">
              <IconBadge icon={ShieldCheck} size="sm" />
              <p>
                La cédula, certificaciones, especialidad oficial y documentos no pueden pasar a "verificado" por IA o búsqueda pública.
              </p>
            </Card>
          </Card>
        </div>
      </div>
    </section>
  )
}
