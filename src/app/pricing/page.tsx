import Link from 'next/link'
import { PhoneIcon as Phone, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'

const PRICING_FEATURES = [
  {
    id: 'public_profile',
    name: 'Perfil público en Doctor.mx',
    starter: true,
    pro: true,
    elite: true,
  },
  {
    id: 'appointment_requests',
    name: 'Recibir solicitudes de cita',
    starter: true,
    pro: true,
    elite: true,
  },
  {
    id: 'whatsapp_notifications',
    name: 'Notificaciones WhatsApp/mes',
    starter: '30',
    pro: '100',
    elite: 'Ilimitado',
  },
  {
    id: 'search_position',
    name: 'Posición en búsquedas',
    starter: 'Estándar',
    pro: '+20% visibilidad',
    elite: '+50% visibilidad',
  },
  {
    id: 'sms_reminders',
    name: 'Recordatorios SMS',
    starter: false,
    pro: true,
    elite: true,
  },
  {
    id: 'simeon_copilot',
    name: 'Simeon Copilot (IA)',
    starter: false,
    pro: true,
    elite: true,
  },
  {
    id: 'ai_consultations',
    name: 'Consultas con IA/mes',
    starter: '0',
    pro: '50',
    elite: 'Ilimitado',
  },
  {
    id: 'image_analysis',
    name: 'Análisis de imágenes médicas/mes',
    starter: '0',
    pro: '0',
    elite: '10',
  },
  {
    id: 'featured_profile',
    name: 'Perfil destacado en inicio',
    starter: false,
    pro: false,
    elite: true,
  },
  {
    id: 'elite_badge',
    name: 'Insignia Elite verificada',
    starter: false,
    pro: false,
    elite: true,
  },
  {
    id: 'api_access',
    name: 'Acceso API para integraciones',
    starter: false,
    pro: false,
    elite: true,
  },
  {
    id: 'support',
    name: 'Soporte',
    starter: 'Email',
    pro: 'Chat',
    elite: 'Prioritario',
  },
]

const FAQS = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes upgrade o downgrade de tu plan en cualquier momento. Los cambios se aplican de forma inmediata y tu próxima factura se ajustará automáticamente.'
  },
  {
    question: '¿Qué pasa si excedo mis límites mensuales?',
    answer: 'Cuando alcances tu límite, la funcionalidad se pausará hasta el siguiente ciclo de facturación. Puedes mejorar tu plan para aumentar tus límites o adquirir paquetes adicionales.'
  },
  {
    question: '¿Hay descuento por pago anual?',
    answer: 'Sí, te ofrecemos un 20% de descuento si pagas anualmente. Contacta a nuestro equipo de ventas para activar esta opción.'
  },
  {
    question: '¿Puedo probar antes de pagar?',
    answer: 'Claro, todos los nuevos doctores reciben 7 días de prueba gratuita del plan Pro para que puedas explorar todas las funcionalidades.'
  },
  {
    question: '¿Cómo funciona el Clinical Copilot?',
    answer: 'El Clinical Copilot es tu asistente de información clínica. Te ayuda a organizar información de pacientes, buscar literatura médica, y preparar documentación según tu plan.'
  },
  {
    question: '¿Qué incluye el análisis de imágenes?',
    answer: 'El análisis de imágenes permite subir radiografías, ecografías, dermatología y otras imágenes médicas para obtener un análisis preliminar con IA (Solo Elite).'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria SPEI, y OXXO Pay.'
  },
  {
    question: '¿Emiten factura fiscal (CFDI)?',
    answer: 'Sí, emitimos CFDI automáticamente. Configura tus datos fiscales en la sección de facturación de tu perfil.'
  },
]

// FeatureValue component for consistent rendering
const FeatureValue = ({ value }: { value: boolean | string }) => {
  // Boolean true = green checkmark
  if (value === true) {
    return (
      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )
  }

  // Boolean false = gray X
  if (value === false) {
    return (
      <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  }

  // String value - highlight special values
  const isHighlight = value === 'Ilimitado' || value.includes('%') || value === 'Prioritario'

  return (
    <span className={`text-sm text-center whitespace-nowrap ${isHighlight ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
      {value}
    </span>
  )
}

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

export default function PricingPage() {
  const plans = [
    { id: 'starter', name: 'Starter', price: 499, popular: false },
    { id: 'pro', name: 'Pro', price: 999, popular: true },
    { id: 'elite', name: 'Élite', price: 1999, popular: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section with logo integrated */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo row - left aligned */}
          <div className="flex justify-start mb-10">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold">
                <span className="font-medium">doctor</span><span className="font-bold text-blue-100">.mx</span>
              </span>
            </Link>
          </div>

          {/* Hero content */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Planes para médicos mexicanos
            </h1>
            <p className="text-lg text-blue-100 mb-6">
              Elige el plan ideal para tu práctica. Sin contratos a largo plazo.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sin compromiso</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Cancelar cuando quieras</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Prueba gratis 7 días</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 pt-4">

          {/* Header row */}
          <div className="grid grid-cols-4 border-b border-gray-200 items-center">
            <div className="p-6 bg-gray-50">
              <span className="text-sm font-medium text-gray-500">Características</span>
            </div>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 text-center relative ${plan.popular ? 'bg-blue-50' : 'bg-white'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                      <span className="flex items-center justify-center gap-1">
                        <StarIcon /> <span>Más Popular</span>
                      </span>
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500 text-sm">MXN/mes</span>
                </div>
              </div>
            ))}
          </div>

          {/* Feature rows - each row spans all 4 columns */}
          {PRICING_FEATURES.map((feature, index) => (
            <div
              key={feature.id}
              className={`grid grid-cols-4 ${index < PRICING_FEATURES.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Feature name */}
              <div className="p-4 flex items-center bg-gray-50">
                <span className="text-sm text-gray-700">{feature.name}</span>
              </div>

              {/* Values for each plan */}
              {plans.map((plan) => (
                <div
                  key={`${feature.id}-${plan.id}`}
                  className={`p-4 flex items-center justify-center ${plan.popular ? 'bg-blue-50/50' : ''}`}
                >
                  <FeatureValue value={feature[plan.id as keyof typeof feature]} />
                </div>
              ))}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-4 border-t border-gray-200">
            <div className="p-4 bg-gray-50"></div>
            {plans.map((plan) => (
              <div
                key={`cta-${plan.id}`}
                className={`p-6 ${plan.popular ? 'bg-blue-50' : ''}`}
              >
                <Link
                  href="/auth/register?accountType=doctor"
                  className="block"
                >
                  <button
                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Comenzar Prueba Gratis
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Todos los planes incluyen 7 días de prueba gratis. Cancela cuando quieras.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Preguntas Frecuentes
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {FAQS.map((faq, idx) => (
            <Card
              key={idx}
              className="p-5 transition-all duration-200 ease-out hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            ¿Aún tienes dudas?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed">
            Nuestro equipo de soporte está disponible para ayudarte a elegir el plan ideal para tu práctica médica.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:doctores@doctor.mx"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-blue-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 min-h-[44px]"
            >
              <Phone aria-hidden="true" className="w-4 h-4" />
              <span>Agendar llamada</span>
            </a>
            <Link
              href="/auth/register?accountType=doctor"
              className="inline-flex items-center gap-2 border border-white/30 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-white/10 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 min-h-[44px]"
            >
              <span>Comenzar ahora</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
