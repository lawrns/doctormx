import { Card, CardContent } from '@/components/ui/card'
import { BadgeCheck, Star, MapPin } from 'lucide-react'

const testimonials = [
  {
    name: 'María García L.',
    role: 'Paciente verificada',
    location: 'Ciudad de México',
    initials: 'MG',
    content: 'Encontré un cardiólogo excelente en 10 minutos. La videoconsulta fue tan profesional como ir al consultorio, pero sin perder 3 horas en traslados. Ya llevo 4 consultas de seguimiento.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Dr. Carlos Mendoza R.',
    role: 'Cardiólogo · Cédula 8745632',
    location: 'Guadalajara, Jal.',
    initials: 'CM',
    content: 'Doctor.mx me permite atender pacientes de todo México sin limitarme a mi consultorio físico. El sistema de pagos es confiable y el soporte resuelve cualquier duda en minutos.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Ana Rodríguez P.',
    role: 'Paciente verificada',
    location: 'Monterrey, N.L.',
    initials: 'AR',
    content: 'Usé Dr. Simeon para entender mis síntomas antes de mi consulta. Me ayudó a preparar las preguntas correctas. La segunda opinión que obtuve me dio tranquilidad antes de decidir mi tratamiento.',
    rating: 5,
    verified: true,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-full mb-4">
            Historias reales
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pacientes y doctores confían en nosotros
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Más de 10,000 consultas realizadas con un 98% de satisfacción
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-0 shadow-sm">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      {testimonial.verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      {testimonial.role}
                      <span className="text-gray-300">•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{testimonial.location}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
