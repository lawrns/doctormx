import Link from 'next/link'

export default function SecondOpinionLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Obtén una segunda opinión médica de especialistas verificados
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sube tu caso clínico, recibe un análisis preliminar de IA y obtén la opinión de un especialista en hasta 72 horas.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/app/second-opinion"
              className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Solicitar segunda opinión
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-xl border border-border px-8 py-3 font-medium text-foreground transition-transform hover:scale-105"
            >
              Cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground text-center mb-12">
            Cómo funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Sube tu caso',
                description: 'Describe tu situación médica, adjunta estudios clínicos y comparte tu diagnóstico actual.',
              },
              {
                step: '2',
                title: 'Análisis preliminar de IA',
                description: 'Nuestra IA analiza tu caso para identificar hallazgos relevantes y sugerir la especialidad adecuada.',
              },
              {
                step: '3',
                title: 'Revisión por especialista',
                description: 'Un médico especialista verificado revisa tu expediente, estudios y el análisis de IA.',
              },
              {
                step: '4',
                title: 'Recibe tu informe',
                description: 'Obtén un informe detallado con la opinión, recomendaciones y próximos pasos sugeridos.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground text-center mb-4">
            Precios
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Elige el nivel de revisión que mejor se adapte a tu caso
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                type: 'basic',
                name: 'Básica',
                price: '$500',
                description: 'Revisión por médico general',
                features: ['Revisión de 1 médico general', 'Informe escrito', 'Análisis preliminar de IA', 'Hasta 72 horas de entrega'],
              },
              {
                type: 'specialist',
                name: 'Especializada',
                price: '$1,500',
                description: 'Revisión por especialista',
                features: ['Revisión por 1 especialista', 'Informe detallado', 'Análisis avanzado de IA', 'Recomendaciones de tratamiento', 'Hasta 72 horas de entrega'],
                featured: true,
              },
              {
                type: 'panel',
                name: 'Panel Multidisciplinario',
                price: '$3,000',
                description: 'Revisión por panel de especialistas',
                features: ['Panel de 2-3 especialistas', 'Informe comprehensivo', 'Análisis de IA avanzado', 'Plan de tratamiento sugerido', 'Seguimiento recomendado', 'Hasta 72 horas de entrega'],
              },
            ].map((plan) => (
              <div
                key={plan.type}
                className={`rounded-2xl border p-8 ${
                  plan.featured
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card'
                }`}
              >
                {plan.featured && (
                  <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Más popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-4 font-display text-4xl font-bold text-foreground">
                  {plan.price} <span className="text-lg font-normal text-muted-foreground">MXN</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-8">
            Médicos verificados y confiables
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="font-display text-4xl font-bold text-primary">SEP</p>
              <p className="mt-2 text-sm text-muted-foreground">Cédulas verificadas por la SEP</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-primary">4.0+</p>
              <p className="mt-2 text-sm text-muted-foreground">Calificación mínima de nuestros médicos</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-primary">72h</p>
              <p className="mt-2 text-sm text-muted-foreground">Tiempo máximo de entrega</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground">
            ¿Listo para una segunda opinión?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Tu salud merece una segunda mirada. Nuestros especialistas están listos para ayudarte.
          </p>
          <div className="mt-8">
            <Link
              href="/app/second-opinion"
              className="inline-block rounded-xl bg-background px-8 py-3 font-semibold text-foreground transition-transform hover:scale-105"
            >
              Solicitar segunda opinión
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
