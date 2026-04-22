import { AlertTriangle, LockKeyhole, ShieldCheck } from 'lucide-react'

const claims = [
  {
    icon: ShieldCheck,
    title: 'Doctores verificados antes de aparecer',
    body: 'Los perfiles médicos deben pasar revisión interna antes de recibir pacientes desde Doctor.mx.',
  },
  {
    icon: LockKeyhole,
    title: 'Datos protegidos durante el flujo',
    body: 'La información de salud se trata como información sensible y se muestra solo donde aporta al caso clínico.',
  },
  {
    icon: AlertTriangle,
    title: 'La IA orienta, no reemplaza urgencias',
    body: 'Síntomas de alarma se dirigen a atención médica inmediata o a un profesional humano.',
  },
]

export function TrustClaimBlock() {
  return (
    <section className="border-y border-border bg-card" aria-labelledby="trust-claims-title">
      <div className="editorial-shell py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-vital">
              Confianza clínica
            </p>
            <h2 id="trust-claims-title" className="mt-2 max-w-md font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
              Revisión humana, privacidad y límites claros para la IA.
            </h2>
          </div>

          <div className="divide-y divide-border/80 border-y border-border/80">
            {claims.map((claim) => (
              <div key={claim.title} className="grid gap-3 py-5 sm:grid-cols-[2rem_1fr]">
                <div className="flex h-8 w-8 items-center justify-center text-vital">
                  <claim.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{claim.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{claim.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
