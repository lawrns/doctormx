import Link from 'next/link'
import { ArrowRight, CheckCircle, Shield, Star } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-blue-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded-full text-white text-sm mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-300"></span>
          </span>
          Más de 100 especialistas en línea ahora
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
          Tu salud merece
          <span className="block text-blue-200">atención inmediata</span>
        </h2>

        {/* Description */}
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Más de 10,000 consultas realizadas. Únete a los mexicanos que ya cuidan su salud con Doctor.mx.
        </p>

        {/* CTA */}
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Comenzar consulta gratuita
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Secondary link */}
        <Link
          href="/for-doctors"
          className="block mt-4 text-blue-200 hover:text-white text-sm underline underline-offset-4"
        >
          ¿Eres médico? Conoce cómo crecer tu práctica
        </Link>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-blue-200 text-sm">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Datos encriptados
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Sin tarjeta requerida
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-current" />
            4.9 de 2,500+ reseñas
          </span>
        </div>

        {/* Additional text */}
        <p className="text-blue-300/70 text-sm mt-8">
          Primera consulta gratis · Sin compromiso · Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
