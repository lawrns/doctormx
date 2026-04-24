import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

type PublicFinalCtaProps = {
  eyebrow?: string
  title?: string
  description?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function PublicFinalCta({
  eyebrow = 'Siguiente paso',
  title = 'Empieza con una orientación médica segura.',
  description = 'Cuéntale tus síntomas a Dr. Simeón o busca directamente un especialista verificado para agendar consulta.',
  primaryHref = '/ai-consulta',
  primaryLabel = 'Hablar con Dr. Simeón',
  secondaryHref = '/doctors',
  secondaryLabel = 'Ver médicos',
}: PublicFinalCtaProps) {
  return (
    <section className="bg-ink py-12 text-primary-foreground sm:py-16">
      <div className="editorial-shell">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-vital">{eyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/70 sm:text-base">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-foreground px-5 text-sm font-semibold text-ink transition-transform active:scale-[0.98]"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 active:scale-[0.98]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
