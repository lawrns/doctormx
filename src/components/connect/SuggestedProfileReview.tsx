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

export function SuggestedProfileReview() {
  return (
    <section className="border-y border-[#d8e3f6] bg-white public-section">
      <div className="editorial-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader eyebrow="Revisión de datos" title="Cada campo tiene origen, estado y responsabilidad.">
              Doctor Connect debe impresionar sin prometer verificación automática. El médico ve lo sugerido, lo faltante y lo que debe confirmarse antes de publicar.
          </SectionHeader>

          <Card variant="preview" tone="tint" density="compact" className="max-w-[560px] justify-self-end">
            <div className="divide-y divide-[#d8e3f6] overflow-hidden rounded-[8px] border border-[#d8e3f6] bg-white">
              {fields.map((field) => (
                <div key={field.label} className="grid gap-3 p-4 sm:grid-cols-[1fr_10rem_8rem] sm:items-center">
                  <div>
                    <p className="font-semibold text-[#071a4e]">{field.label}</p>
                    <p className="mt-1 text-sm text-[#5c6783]">{field.value}</p>
                  </div>
                  <p className="text-sm text-[#5c6783]">{field.source}</p>
                  <Badge variant={field.status === 'No verificado' ? 'outline' : 'info'}>
                    {field.status === 'No verificado' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {field.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Card variant="chip" className="mt-3 flex items-start gap-3 text-sm leading-6 text-[#5c6783]">
              <IconBadge icon={ShieldCheck} size="sm" />
              <p>
                La cédula, certificaciones, especialidad oficial y documentos no pueden pasar a “verificado” por IA o búsqueda pública.
              </p>
            </Card>
          </Card>
        </div>
      </div>
    </section>
  )
}
