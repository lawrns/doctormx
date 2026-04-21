import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import {
  MapPin,
  Bell,
  MessageSquare,
  FileText,
  Smartphone,
  ArrowRight,
  Download,
  Star,
  ShieldCheck,
  Video,
  Clock,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'App Doctor.mx - Lleva tu salud en tu bolsillo',
  description:
    'Descarga la app de Doctor.mx para buscar doctores en mapa, recibir recordatorios de citas, chatear con especialistas y acceder a tu historial medico.',
  openGraph: {
    title: 'App Doctor.mx - Lleva tu salud en tu bolsillo',
    description: 'Descarga la app de Doctor.mx. Busqueda por mapa, recordatorios, chat y historial.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/app-pacientes',
  },
}

const features = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Busqueda por mapa',
    description:
      'Encuentra doctores y clinicas cercanas en un mapa interactivo. Filtra por especialidad y disponibilidad.',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Recordatorios de citas',
    description:
      'Nunca olvides una consulta. Recibe notificaciones antes de cada cita y recordatorios de seguimiento.',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Chat con especialistas',
    description:
      'Comunicate directamente con tu doctor antes y despues de la consulta. Resuelve dudas rapidamente.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Historial medico',
    description:
      'Todas tus recetas, diagnosticos y notas medicas en un solo lugar. Accesible desde cualquier dispositivo.',
  },
]

const stats = [
  { value: '50K+', label: 'Descargas' },
  { value: '4.8', label: 'Calificacion' },
  { value: '10K+', label: 'Consultas' },
  { value: '< 2 min', label: 'Conexion' },
]

export default function AppPacientesPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <main className="editorial-shell py-8 sm:py-10 lg:py-12">
        {/* Hero */}
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="luxe">App Doctor.mx</Badge>
              <PublicSectionHeading
                align="left"
                eyebrow="Aplicacion movil"
                title="Lleva tu salud"
                accent="en tu bolsillo"
                description="Busca doctores, agenda citas, consulta en linea y accede a tu historial medico desde tu celular. Disponible para iOS y Android."
              />
              <div className="flex flex-wrap gap-3">
                <a href="#" aria-label="Descargar en App Store">
                  <Button variant="hero" size="lg" className="gap-2">
                    <Download className="h-5 w-5" />
                    App Store
                  </Button>
                </a>
                <a href="#" aria-label="Descargar en Google Play">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Download className="h-5 w-5" />
                    Google Play
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-[hsl(var(--text-secondary))]">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                  4.8 en App Store
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                  Datos encriptados
                </span>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-64 h-[500px] rounded-[2.5rem] bg-[hsl(var(--surface-quiet))] border-4 border-[hsl(var(--border))] shadow-2xl flex flex-col overflow-hidden">
                  {/* Status bar mockup */}
                  <div className="bg-[hsl(var(--surface-strong))] px-6 py-2 flex justify-between items-center text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-[hsl(var(--text-soft))] rounded-sm" />
                      <div className="w-4 h-2 bg-[hsl(var(--text-soft))] rounded-sm" />
                    </div>
                  </div>
                  {/* App content mockup */}
                  <div className="flex-1 bg-card p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[hsl(var(--brand-ocean))] flex items-center justify-center">
                        <Smartphone className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                        Doctor.mx
                      </span>
                    </div>
                    <div className="h-8 rounded-lg bg-[hsl(var(--surface-quiet))] flex items-center px-3">
                      <span className="text-[10px] text-[hsl(var(--text-soft))]">
                        Buscar especialista...
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Cardiologia', 'Pediatria', 'Dermatologia', 'General'].map((spec) => (
                        <div
                          key={spec}
                          className="h-16 rounded-lg bg-[hsl(var(--surface-quiet))] flex items-center justify-center"
                        >
                          <span className="text-[10px] text-[hsl(var(--text-secondary))]">
                            {spec}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--border))] p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[hsl(var(--surface-tint))]" />
                        <div>
                          <div className="h-2 w-16 bg-[hsl(var(--surface-strong))] rounded" />
                          <div className="h-1.5 w-12 bg-[hsl(var(--surface-quiet))] rounded mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bottom nav mockup */}
                  <div className="bg-card border-t border-[hsl(var(--border))] px-6 py-2 flex justify-around">
                    <div className="w-5 h-5 rounded bg-[hsl(var(--surface-quiet))]" />
                    <div className="w-5 h-5 rounded bg-[hsl(var(--surface-quiet))]" />
                    <div className="w-5 h-5 rounded bg-[hsl(var(--brand-ocean))]" />
                    <div className="w-5 h-5 rounded bg-[hsl(var(--surface-quiet))]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="surface-panel p-5 text-center">
              <p className="text-3xl font-bold tracking-[-0.04em] text-[hsl(var(--brand-ocean))]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">{stat.label}</p>
            </Card>
          ))}
        </section>

        {/* Feature Highlights */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <PublicSectionHeading
              eyebrow="Funcionalidades"
              title="Todo lo que necesitas"
              accent="en una app"
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index} className="surface-panel p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* App Capabilities */}
        <section className="mt-12">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="surface-panel p-6 text-center">
              <Video className="h-8 w-8 text-[hsl(var(--brand-ocean))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                Videoconsulta HD
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
                Consulta en alta definicion con conexion estable. Compatible con wifi y datos moviles.
              </p>
            </Card>
            <Card className="surface-panel p-6 text-center">
              <Clock className="h-8 w-8 text-[hsl(var(--brand-ocean))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                Agenda inteligente
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
                Ve la disponibilidad en tiempo real y agenda en segundos. Recordatorios automaticos.
              </p>
            </Card>
            <Card className="surface-panel p-6 text-center">
              <ShieldCheck className="h-8 w-8 text-[hsl(var(--brand-ocean))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                Datos protegidos
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
                Encriptacion de nivel hospitalario. Cumplimiento total con la LFPDPPP.
              </p>
            </Card>
          </div>
        </section>

        {/* Download CTA */}
        <section className="mt-12 text-center">
          <Card className="surface-panel-strong inline-block p-8 sm:p-12">
            <PublicSectionHeading
              title="Descarga Doctor.mx"
              accent="ahora"
              description="Disponible para iOS y Android. Registrate en segundos y agenda tu primera consulta."
            />
            <div className="mt-6 flex justify-center gap-4">
              <a href="#" aria-label="Descargar en App Store">
                <Button variant="hero" size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  App Store
                </Button>
              </a>
              <a href="#" aria-label="Descargar en Google Play">
                <Button variant="outline" size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  Google Play
                </Button>
              </a>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
