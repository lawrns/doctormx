'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Baby, Bone, Brain, Eye, Heart, Shield, Stethoscope, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const specialties = [
  { name: 'Cardiologia', slug: 'cardiologia', icon: Heart, description: 'Corazon, presion arterial y sistema cardiovascular.' },
  { name: 'Neurologia', slug: 'neurologia', icon: Brain, description: 'Cerebro, sistema nervioso, migraña y sintomas neurologicos.' },
  { name: 'Oftalmologia', slug: 'oftalmologia', icon: Eye, description: 'Vision, ojos, graduacion y revision oftalmologica.' },
  { name: 'Traumatologia', slug: 'traumatologia', icon: Bone, description: 'Huesos, articulaciones, lesiones y dolor musculoesqueletico.' },
  { name: 'Pediatria', slug: 'pediatria', icon: Baby, description: 'Salud infantil, crecimiento y seguimiento pediatrico.' },
  { name: 'Medicina general', slug: 'medicina-general', icon: Stethoscope, description: 'Atencion primaria, sintomas comunes y seguimiento inicial.' },
  { name: 'Dermatologia', slug: 'dermatologia', icon: Shield, description: 'Piel, cabello, uñas, acne y lesiones dermatologicas.' },
  { name: 'Ginecologia', slug: 'ginecologia', icon: Users, description: 'Salud femenina, control anual, anticoncepcion y embarazo.' },
]

export default function SpecialtiesPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="pt-24 md:pt-28">
        <div className="editorial-shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
          >
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Especialidades medicas
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground md:text-6xl">
                Elige la especialidad antes de elegir doctor.
              </h1>
            </div>
            <div className="space-y-4">
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Usa esta guia para entrar al directorio correcto. Los conteos, horarios y ubicaciones se muestran en resultados solo cuando existen en el catalogo.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">Sin conteos inventados</Badge>
                <Badge variant="outline">Perfiles verificados</Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="editorial-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[10px] border border-border bg-card p-4">
              <Stethoscope className="mb-4 h-5 w-5 text-primary" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Guia rapida
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Si no sabes que especialidad corresponde, empieza con orientacion y escala a un medico real.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href="/ai-consulta">Orientarme</Link>
              </Button>
            </div>
          </aside>

          <div className="divide-y divide-border rounded-[12px] border border-border bg-card">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link
                  href={`/doctors?specialty=${specialty.slug}`}
                  className="grid gap-4 p-4 transition-colors hover:bg-secondary/50 sm:grid-cols-[2.5rem_1fr_auto] sm:items-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[hsl(var(--surface-tint))] text-primary">
                    <specialty.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{specialty.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{specialty.description}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Ver doctores
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
