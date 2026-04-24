import Link from 'next/link'
import { ArrowRight, FileCheck2, LockKeyhole, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <section className="border-y border-[#d8e3f6] bg-[#071a4e] public-section text-white">
      <div className="editorial-shell">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeader eyebrow="Seguridad y cumplimiento" title="La IA acelera el perfil, no reemplaza la verificación médica." className="text-white [&_h2]:text-white [&_p:first-child]:text-[#8fc4ff] [&>div]:text-white/68">
              Esta es la regla de producto: impresionar al médico con automatización sin degradar la confianza clínica del paciente.
            </SectionHeader>
            <Button asChild className="mt-7 bg-white text-[#071a4e] hover:bg-white/95">
              <Link href="/auth/register?role=doctor&connect=1">
                Crear perfil médico
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3">
            {rules.map((rule) => (
              <Card key={rule.title} variant="feature" tone="dark" density="compact" className="grid gap-3 md:grid-cols-[32px_1fr]">
                <IconBadge icon={rule.icon} tone="dark" size="md" />
                <div>
                  <h3 className="text-[15px] font-semibold leading-5 tracking-[-0.02em]">{rule.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-white/68">{rule.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
