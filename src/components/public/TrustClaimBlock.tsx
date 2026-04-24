import Link from 'next/link'
import { AlertTriangle, LockKeyhole, ShieldCheck } from 'lucide-react'

const claims = [
  {
    icon: ShieldCheck,
    title: 'Handoff verificable',
    body: 'Después de la orientación, mostramos cédula, reseñas y estado SEP solo cuando el dato existe en el expediente público del doctor.',
    href: '/security',
    label: 'Cómo verificamos',
  },
  {
    icon: LockKeyhole,
    title: 'Privacidad en el intake',
    body: 'Los datos sensibles del síntoma se restringen al flujo clínico y se explican en nuestra política de seguridad.',
    href: '/security',
    label: 'Ver seguridad',
  },
  {
    icon: AlertTriangle,
    title: 'La IA no reemplaza urgencias',
    body: 'Dr. Simeón orienta y escala. Cuando hay señales de alarma, el flujo pasa a atención humana o urgente.',
    href: '/terms',
    label: 'Límites clínicos',
  },
]

export function TrustClaimBlock() {
  return (
    <section className="border-y border-border bg-card" aria-labelledby="trust-claims-title">
      <div className="editorial-shell py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="space-y-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-ocean))]">
              Confianza clínica
            </p>
            <h2
              id="trust-claims-title"
              className="max-w-md font-display text-2xl font-semibold leading-tight tracking-tight text-[hsl(var(--public-ink))] sm:text-3xl"
            >
              La confianza empieza antes de mostrar doctores.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-[hsl(var(--public-muted))]">
              El paciente no debe adivinar si necesita dermatología, medicina interna o urgencias. Primero orientamos; después mostramos médicos con evidencia real.
            </p>
          </div>

          <div className="grid gap-3 border-t border-border/80 pt-4 lg:border-0 lg:pt-0">
            {claims.map((claim) => {
              const Icon = claim.icon

              return (
                <div
                  key={claim.title}
                  className="grid gap-4 border-t border-border/80 px-0 py-4 sm:grid-cols-[2rem_1fr_auto]"
                >
                  <div className="flex h-8 w-8 items-center justify-center text-[hsl(var(--brand-ocean))]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--public-ink))]">{claim.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">{claim.body}</p>
                  </div>
                  <div className="sm:self-center">
                    <Link
                      href={claim.href}
                      className="inline-flex rounded-[8px] border border-border px-3 py-1.5 text-xs font-semibold text-[hsl(var(--public-ink))] transition-colors hover:border-[hsl(var(--brand-ocean)/0.25)] hover:bg-[hsl(var(--surface-tint))]"
                    >
                      {claim.label}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
