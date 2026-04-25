import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck, Stethoscope } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    icon: FileCheck2,
    title: 'Perfil preparado con IA',
    body: 'Buscamos datos públicos de tu práctica y preparamos un borrador que tú revisas y confirmas.',
  },
  {
    icon: ShieldCheck,
    title: 'Verificación de cédula',
    body: 'Validamos tu cédula profesional ante la SEP. Recibirás una insignia de confianza visible para pacientes.',
  },
  {
    icon: Stethoscope,
    title: 'Perfil publicado',
    body: 'Tu perfil aparece en búsquedas. El Dr. Simeón te refiere pacientes verificados que buscan tu especialidad.',
  },
]

export function ConnectOnboardingPreview() {
  return (
    <section className="bg-[#f4f7fb] py-10 md:py-12">
      <div className="editorial-shell">
        <div className="text-center">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
            ¿Qué sigue después?
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#071a4e]">
            Así funciona el proceso de alta
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#5c6783]">
            Desde que reclamas tu perfil hasta que empiezas a recibir pacientes
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-[10px] border border-[#d8e3f6] bg-white p-5"
            >
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0d72d6]">
                Paso {i + 1}
              </p>
              <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#e8f3ff] text-[#0d72d6]">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold leading-5 tracking-[-0.02em] text-[#071a4e]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-5 text-[#5c6783]">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[10px] border border-[#d8e3f6] bg-white p-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] leading-5 text-[#5c6783]">
            {[
              'Sin tarjeta de crédito',
              'Cancela cuando quieras',
              'Verificación en 24-48 horas',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0d72d6]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
