import Image from 'next/image'
import { CheckCircle2, ClipboardCheck, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { TrustBar } from '@/components/ui/card-patterns'
import { PracticeSearchPanel } from './PracticeSearchPanel'

const proofPoints = [
  'Borrador asistido por IA, nunca publicado sin confirmación',
  'Cédula y SEP se tratan como verificación separada',
  'Perfiles existentes se reclaman con revisión de identidad',
]

const connectDoctorPhoto =
  'https://images.unsplash.com/photo-1758691462848-31a39258dbd8?auto=format&fit=crop&w=1200&q=82'

export function ConnectHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#d8e3f6] bg-[#eef5ff]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-18rem] top-[-20rem] h-[34rem] w-[34rem] rounded-full bg-[#0d72d6]/8 blur-3xl" />
        <div className="absolute right-[-12rem] top-[-18rem] h-[30rem] w-[30rem] rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="editorial-shell relative pb-8 pt-24 md:pb-10 md:pt-28 lg:pb-12">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,520px)] lg:items-center lg:gap-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#c8d9fa] bg-white/84 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <Sparkles className="h-3.5 w-3.5" />
              Doctor Connect
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.15rem,3.8vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-[#071a4e]">
              Reclama tu perfil médico con IA.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5c6783] md:text-base">
              Busca tu consultorio o práctica. Doctor.mx prepara un borrador con datos públicos y campos sugeridos para que tú confirmes, completes y publiques con evidencia.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {proofPoints.map((point) => (
                <div key={point} className="flex max-w-[19rem] items-start gap-2 text-[13px] leading-5 text-[#071a4e]">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0d72d6]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 hidden max-w-[31rem] overflow-hidden rounded-[10px] border border-[#c8d9fa] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:block">
              <div className="relative aspect-[3.6/1]">
                <Image
                  src={connectDoctorPhoto}
                  alt="Médica revisando el perfil digital de su práctica"
                  fill
                  sizes="(min-width: 1024px) 496px, 90vw"
                  className="object-cover object-[50%_31%]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,26,78,0.06),transparent_42%,rgba(255,255,255,0.08))]" />
              </div>
            </div>
          </div>

          <div id="connect-search" className="min-w-0 scroll-mt-28 lg:justify-self-end">
            <PracticeSearchPanel className="w-full lg:max-w-[520px]" />
          </div>
        </div>

        <div className="mt-6 border-t border-[#d8e3f6] pt-3">
          <TrustBar
            items={[
              { icon: ClipboardCheck, title: 'Perfil preparado', body: 'Borrador editable.' },
              { icon: ShieldCheck, title: 'Verificación separada', body: 'Cédula y SEP reales.' },
              { icon: Search, title: 'Fuentes visibles', body: 'Origen etiquetado.' },
            ]}
            className="rounded-[10px] shadow-none lg:grid-cols-3"
          />
        </div>
      </div>
    </section>
  )
}
