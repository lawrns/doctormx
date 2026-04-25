import { FileCheck2, LockKeyhole, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IconBadge, SectionHeader } from '@/components/ui/card-patterns'

const rules = [
  {
    title: 'IA no verifica credenciales',
    body: 'Puede sugerir campos, pero cédula, SEP y documentos quedan pendientes hasta revisión.',
    icon: ShieldAlert,
  },
  {
    title: 'Fuentes visibles',
    body: 'El origen del dato se muestra como Doctor.mx, Places, Brave, IA o médico.',
    icon: FileCheck2,
  },
  {
    title: 'Control del médico',
    body: 'El perfil no se publica con sugerencias sensibles sin confirmación explícita.',
    icon: LockKeyhole,
  },
]

export function DoctorTrustComplianceBlock() {
  return (
    <section className="border-y border-border bg-foreground py-10 text-white md:py-12 lg:py-14">
      <div className="editorial-shell">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <SectionHeader
            eyebrow="Seguridad y cumplimiento"
            title="La IA acelera el perfil, no reemplaza la verificación médica."
            className="mb-0 max-w-2xl text-white [&>div]:text-white/68 [&_h2]:text-[clamp(1.85rem,3vw,2.8rem)] [&_h2]:text-white [&_p:first-child]:text-primary"
          >
            Esta es la regla de producto: impresionar al médico con automatización sin degradar la confianza clínica del paciente.
          </SectionHeader>

          <Card variant="chip" density="none" tone="dark" className="overflow-hidden rounded-xl shadow-none">
            <div className="divide-y divide-white/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
              {rules.map((rule) => (
                <div key={rule.title} className="min-w-0 p-4">
                  <IconBadge icon={rule.icon} tone="dark" size="sm" />
                  <h3 className="mt-3 text-[15px] font-semibold leading-5 tracking-[-0.02em]">{rule.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-white/68">{rule.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
