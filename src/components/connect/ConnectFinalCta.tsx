import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ConnectFinalCta() {
  return (
    <section className="bg-[#f4f7fb] pb-10 md:pb-12 lg:pb-14">
      <div className="editorial-shell">
        <Card variant="chip" className="rounded-[12px] bg-white px-4 py-3 shadow-none">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
                Empieza en minutos
              </p>
              <h2 className="mt-1 text-[18px] font-semibold leading-6 tracking-[-0.03em] text-[#071a4e]">
                Reclama tu presencia médica antes de que el paciente decida en otra plataforma.
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#5c6783]">
                Busca tu práctica, revisa el borrador y completa los campos clínicos que construyen confianza real.
              </p>
            </div>
            <Link
              href="#connect-search"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[8px] border border-[#cfdcf1] bg-white px-3 text-[13px] font-semibold text-[#071a4e] transition hover:-translate-y-px hover:border-[#0d72d6]/30 hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d72d6] focus-visible:ring-offset-2"
            >
              Volver a buscar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}
