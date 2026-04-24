import { CalendarCheck, CreditCard, ShieldAlert, Stethoscope } from 'lucide-react'
import { StepTimeline } from '@/components/ui/card-patterns'

const steps = [
  {
    title: 'Describe síntomas',
    description: 'Empieza con lenguaje natural. Dr. Simeón recoge contexto, duración, intensidad y datos básicos antes de sugerir el camino.',
    icon: Stethoscope,
  },
  {
    title: 'Descarta señales de alarma',
    description: 'Si aparecen datos de urgencia, el flujo no empuja una reserva: orienta hacia atención humana o urgente.',
    icon: ShieldAlert,
  },
  {
    title: 'Especialidad y médico',
    description: 'Cuando el caso es apto para consulta, la plataforma muestra especialidad probable y médicos verificados con modalidad y precio.',
    icon: CalendarCheck,
  },
  {
    title: 'Reserva con contexto',
    description: 'La cita conserva el contexto de la orientación para que booking se sienta como continuidad, no como empezar de cero.',
    icon: CreditCard,
  },
]

export function HowItWorks() {
  return (
    <StepTimeline
      eyebrow="Cómo funciona"
      title="Del síntoma a la cita correcta, sin obligarte a adivinar."
      body="Doctor.mx empieza con orientación clínica y termina, cuando corresponde, en una consulta real con un médico verificado."
      steps={steps.map((step) => ({ title: step.title, body: step.description, icon: step.icon }))}
      className="bg-background"
    />
  )
}
