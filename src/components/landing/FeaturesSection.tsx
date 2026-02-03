import { Card, CardContent } from '@/components/ui/card'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Doctores con cédula verificada',
    description: 'Cada especialista está validado con su cédula profesional ante la SEP. Consulta perfiles completos antes de agendar.',
  },
  {
    icon: Video,
    title: 'Videoconsulta HD desde casa',
    description: 'Consultas por video con calidad HD y conexión segura. Tu doctor te ve y escucha como si estuvieras en su consultorio.',
  },
  {
    icon: Calendar,
    title: 'Citas en menos de 24 horas',
    description: 'Encuentra disponibilidad en tiempo real. Agenda tu consulta en minutos, no en semanas.',
  },
  {
    icon: FileText,
    title: 'Dr. Simeon: tu copiloto de salud',
    description: 'Nuestro asistente con IA te ayuda a entender síntomas y preparar preguntas para tu doctor. No diagnostica, orienta.',
    featured: true,
  },
  {
    icon: Shield,
    title: 'Privacidad de grado médico',
    description: 'Encriptación punto a punto y cumplimiento con normativas mexicanas de protección de datos de salud.',
  },
  {
    icon: MessageSquare,
    title: 'Seguimiento continuo',
    description: 'Mensajea a tu doctor antes y después de la consulta. Tu historial médico siempre accesible.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-full mb-4">
            Cómo funciona
          </span>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Salud digital, atención humana
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Una plataforma diseñada para conectarte con especialistas mexicanos certificados, de forma rápida, segura y privada.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                feature.featured ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
            >
              <CardContent className="p-6">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    feature.featured
                      ? 'bg-white/10'
                      : 'bg-blue-50'
                  }`}
                >
                  <feature.icon
                    className={`w-6 h-6 ${
                      feature.featured ? 'text-white' : 'text-blue-600'
                    }`}
                  />
                </div>

                {/* Title */}
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    feature.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-sm leading-relaxed ${
                    feature.featured ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
