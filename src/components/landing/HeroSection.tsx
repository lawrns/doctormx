import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BadgeCheck, Clock, Shield, Users } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-white pt-20 pb-16">
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-700">
                5 consultas GRATIS disponibles
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Consulta médica
              <br />
              <span className="text-blue-600">100% gratuita</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Salud accesible para todos. Consulta con IA médica las veces que necesites — 
              <span className="text-gray-900 font-medium"> sin registrar, sin pagar</span>.
              Cuando necesites un doctor real, te conectamos con especialistas verificados.
            </p>

            {/* Benefits */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Sin registro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-500" />
                <span>Doctores verificados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>24/7 disponible</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/ai-consulta"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Consultar ahora — Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/doctors"
                className="inline-flex items-center justify-center px-8 py-4 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Buscar especialista
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span><strong className="text-gray-900">10,000+</strong> consultas</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                <span><strong className="text-gray-900">500+</strong> doctores</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main image container */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                <Image
                  src="/images/simeon.png"
                  alt="Dr. Simeon - Asistente médico IA"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Dr. Simeon</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      En línea ahora
                    </p>
                  </div>
                </div>
              </div>

              {/* Response time card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tiempo de respuesta</p>
                <p className="text-2xl font-bold text-gray-900">&lt; 1 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
