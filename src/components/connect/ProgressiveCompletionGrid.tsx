import { CalendarClock, Camera, CreditCard, FileBadge, MapPinned, Stethoscope, Video } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IconBadge, SectionHeader } from '@/components/ui/card-patterns'

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
    <section className="bg-[#f4f7fb] py-10 md:py-12 lg:py-14">
      <div className="editorial-shell">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
          <SectionHeader
            eyebrow="Perfil progresivo"
            title="El alta empieza rápido, pero termina con evidencia."
            className="mb-0 max-w-xl [&_h2]:text-[clamp(1.85rem,3vw,2.8rem)]"
          />

          <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {items.map((item) => (
              <Card key={item.title} variant="feature" density="compact" className="rounded-[10px] shadow-none">
                <div className="flex min-w-0 gap-2.5">
                  <IconBadge icon={item.icon} size="sm" />
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-5 tracking-[-0.02em] text-[#071a4e]">{item.title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-[#5c6783]">{item.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
