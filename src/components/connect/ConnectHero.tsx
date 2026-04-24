import { CheckCircle2, ClipboardCheck, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { TrustBar } from '@/components/ui/card-patterns'
import { PracticeSearchPanel } from './PracticeSearchPanel'

const proofPoints = [
  'Borrador asistido por IA, nunca publicado sin confirmación',
  'Cédula y SEP se tratan como verificación separada',
  'Perfiles existentes se reclaman con revisión de identidad',
]

export function ConnectHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#d8e3f6] bg-[#eef5ff]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-18rem] top-[-18rem] h-[36rem] w-[36rem] rounded-full bg-[#0d72d6]/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-white/80 blur-3xl" />
      </div>

      <div className="editorial-shell relative py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#c8d9fa] bg-white px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
              <Sparkles className="h-3.5 w-3.5" />
              Doctor Connect
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,5.1vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-[#071a4e]">
              Reclama tu perfil médico con IA.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5c6783]">
              Busca tu consultorio o práctica. Doctor.mx prepara un borrador con datos públicos y campos sugeridos para que tú confirmes, completes y publiques con evidencia.
            </p>

            <div className="mt-7 grid gap-3">
              {proofPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm leading-6 text-[#071a4e]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0d72d6]" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div id="connect-search" className="scroll-mt-28">
            <PracticeSearchPanel />
          </div>
        </div>

        <div className="mt-8 border-t border-[#d8e3f6] pt-4">
          <TrustBar
            items={[
              { icon: ClipboardCheck, title: 'Perfil preparado', body: 'Borrador editable.' },
              { icon: ShieldCheck, title: 'Verificación separada', body: 'Cédula y SEP reales.' },
              { icon: Search, title: 'Fuentes visibles', body: 'Origen etiquetado.' },
            ]}
            className="lg:grid-cols-3"
          />
        </div>
      </div>
    </section>
  )
}
