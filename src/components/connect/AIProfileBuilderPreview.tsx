import { BadgeCheck, FileSearch, PencilLine, ShieldCheck } from 'lucide-react'
import { StepTimeline } from '@/components/ui/card-patterns'

const steps = [
  {
    label: '01',
    title: 'Encuentra tu práctica',
    body: 'Buscamos primero perfiles no reclamados en Doctor.mx y después fuentes externas si están configuradas.',
    icon: FileSearch,
  },
  {
    label: '02',
    title: 'IA arma un borrador',
    body: 'Preparamos descripción, servicios probables, ubicación y campos faltantes como sugerencias editables.',
    icon: PencilLine,
  },
  {
    label: '03',
    title: 'Confirmas lo clínico',
    body: 'Nada sensible se publica como verificado por IA. Cédula, SEP y especialidad oficial requieren revisión.',
    icon: ShieldCheck,
  },
  {
    label: '04',
    title: 'Publicas con evidencia',
    body: 'El perfil sale con foto, horarios, modalidad, precio y credenciales visibles cuando existan.',
    icon: BadgeCheck,
  },
]

export function AIProfileBuilderPreview() {
  return (
    <StepTimeline
      eyebrow="Cómo funciona"
      title="Menos formulario vacío, más perfil listo para revisar."
      body="La promesa no es publicar datos automáticos. Es reducir trabajo administrativo y hacer explícito qué viene de búsqueda, qué viene de IA y qué debe confirmar el médico."
      steps={steps}
    />
  )
}
