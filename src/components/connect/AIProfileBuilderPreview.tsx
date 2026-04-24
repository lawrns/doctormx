import { BadgeCheck, FileSearch, PencilLine, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IconBadge, SectionHeader } from '@/components/ui/card-patterns'

const steps = [
  {
    label: '01',
    title: 'Encuentra tu práctica',
    body: 'Buscamos primero perfiles no reclamados en Doctor.mx y después fuentes externas si están configuradas.',
    icon: FileSearch,
  },
  {
    label: '02',
    title: 'IA arma un borrador',
    body: 'Preparamos descripción, servicios probables, ubicación y campos faltantes como sugerencias editables.',
    icon: PencilLine,
  },
  {
    label: '03',
    title: 'Confirmas lo clínico',
    body: 'Nada sensible se publica como verificado por IA. Cédula, SEP y especialidad oficial requieren revisión.',
    icon: ShieldCheck,
  },
  {
    label: '04',
    title: 'Publicas con evidencia',
    body: 'El perfil sale con foto, horarios, modalidad, precio y credenciales visibles cuando existan.',
    icon: BadgeCheck,
  },
]

export function AIProfileBuilderPreview() {
  return (
    <section className="border-b border-[#d8e3f6] bg-[#f4f7fb] py-10 md:py-12 lg:py-14">
      <div className="editorial-shell">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <SectionHeader
            eyebrow="Cómo funciona"
            title="Menos formulario vacío, más perfil listo para revisar."
            className="mb-0 max-w-2xl [&_h2]:text-[clamp(1.85rem,3vw,2.8rem)]"
          >
            La promesa no es publicar datos automáticos. Es reducir trabajo administrativo y hacer explícito qué viene de búsqueda, qué viene de IA y qué debe confirmar el médico.
          </SectionHeader>

          <Card variant="chip" density="none" className="overflow-hidden rounded-[12px] bg-white shadow-none">
            <div className="divide-y divide-[#e3eaf7] lg:grid lg:grid-cols-4 lg:divide-x lg:divide-y-0">
              {steps.map((step) => (
                <div key={step.label} className="min-w-0 p-4 lg:p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] font-semibold text-[#0d72d6]">{step.label}</p>
                    <IconBadge icon={step.icon} size="sm" />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold leading-5 tracking-[-0.02em] text-[#071a4e]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#5c6783]">{step.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
