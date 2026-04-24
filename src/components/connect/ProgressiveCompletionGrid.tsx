import { CalendarClock, Camera, CreditCard, FileBadge, MapPinned, Stethoscope, Video } from 'lucide-react'
import { FeatureGrid, SectionHeader } from '@/components/ui/card-patterns'

const items = [
  { title: 'Foto profesional', body: 'Rostro claro, fondo limpio y recorte consistente en marketplace.', icon: Camera },
  { title: 'Cédula y SEP', body: 'Campo obligatorio para verificación médica; nunca se infiere por IA.', icon: FileBadge },
  { title: 'Horarios reales', body: 'Disponibilidad editable por día, modalidad y tiempos de consulta.', icon: CalendarClock },
  { title: 'Servicios', body: 'La IA sugiere categorías; el médico confirma lo que realmente atiende.', icon: Stethoscope },
  { title: 'Modalidades', body: 'Presencial, video o ambas, con instrucciones antes de reservar.', icon: Video },
  { title: 'Precio y cobro', body: 'Consulta, política de cancelación y métodos de pago claros.', icon: CreditCard },
  { title: 'Ubicación', body: 'Sedes y zonas visibles sin pins falsos ni ubicaciones inventadas.', icon: MapPinned },
]

export function ProgressiveCompletionGrid() {
  return (
    <section className="public-section">
      <div className="editorial-shell">
        <SectionHeader eyebrow="Perfil progresivo" title="El alta empieza rápido, pero termina con evidencia." />
        <FeatureGrid items={items} />
      </div>
    </section>
  )
}
