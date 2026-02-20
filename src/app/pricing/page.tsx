'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Check,
  X,
  Zap,
  Users,
  MessageSquare,
  Brain,
  Image,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react'
import { logger } from '@/lib/observability/logger'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface PricingPlan {
  id: string
  name: string
  name_es: string
  description: string
  price_cents: number
  price_mxn: number
  currency: string
  interval: string
  features: {
    profile_visibility: boolean
    whatsapp_patients: number
    ai_copilot: boolean
    ai_copilot_limit: number
    image_analysis: boolean
    image_analysis_limit: number
    priority_search_ranking: boolean
    featured_listing: boolean
    api_access: boolean
  }
  limits: {
    whatsapp_patients: number
    ai_copilot: number
    image_analysis: number
  }
  highlight: boolean
  color: string
  icon: string
}

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    name_es: 'Básico',
    description: 'Para doctores que inician',
    price_cents: 49900,
    price_mxn: 499,
    currency: 'MXN',
    interval: 'monthly',
    features: {
      profile_visibility: true,
      whatsapp_patients: 30,
      ai_copilot: false,
      ai_copilot_limit: 0,
      image_analysis: false,
      image_analysis_limit: 0,
      priority_search_ranking: false,
      featured_listing: false,
      api_access: false,
    },
    limits: {
      whatsapp_patients: 30,
      ai_copilot: 0,
      image_analysis: 0,
    },
    highlight: false,
    color: 'from-gray-500 to-slate-600',
    icon: '🚀',
  },
  {
    id: 'pro',
    name: 'Pro',
    name_es: 'Profesional',
    description: 'Para doctores en crecimiento',
    price_cents: 99900,
    price_mxn: 999,
    currency: 'MXN',
    interval: 'monthly',
    features: {
      profile_visibility: true,
      whatsapp_patients: 100,
      ai_copilot: true,
      ai_copilot_limit: 50,
      image_analysis: false,
      image_analysis_limit: 0,
      priority_search_ranking: true,
      featured_listing: false,
      api_access: false,
    },
    limits: {
      whatsapp_patients: 100,
      ai_copilot: 50,
      image_analysis: 0,
    },
    highlight: true,
    color: 'from-purple-500 to-violet-600',
    icon: '⭐',
  },
  {
    id: 'elite',
    name: 'Elite',
    name_es: 'Élite',
    description: 'Para doctores premium',
    price_cents: 199900,
    price_mxn: 1999,
    currency: 'MXN',
    interval: 'monthly',
    features: {
      profile_visibility: true,
      whatsapp_patients: -1, // unlimited
      ai_copilot: true,
      ai_copilot_limit: -1, // unlimited
      image_analysis: true,
      image_analysis_limit: 10,
      priority_search_ranking: true,
      featured_listing: true,
      api_access: true,
    },
    limits: {
      whatsapp_patients: -1,
      ai_copilot: -1,
      image_analysis: 10,
    },
    highlight: false,
    color: 'from-amber-500 to-orange-600',
    icon: '👑',
  },
]

interface FeatureItem {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  starter: boolean | number | 'Ilimitado'
  pro: boolean | number | 'Ilimitado'
  elite: boolean | number | 'Ilimitado'
}

const FEATURES: FeatureItem[] = [
  {
    id: 'profile',
    name: 'Perfil Público',
    description: 'Tu perfil visible para que los pacientes te encuentren',
    icon: <Users className="w-5 h-5" />,
    starter: true,
    pro: true,
    elite: true,
  },
  {
    id: 'whatsapp',
    name: 'Mensajería WhatsApp',
    description: 'Conecta directamente con tus pacientes',
    icon: <MessageSquare className="w-5 h-5" />,
    starter: 30,
    pro: 100,
    elite: 'Ilimitado',
  },
  {
    id: 'ai',
    name: 'Clinical Copilot AI',
    description: 'Asistente de IA para tus consultas',
    icon: <Brain className="w-5 h-5" />,
    starter: false,
    pro: 50,
    elite: 'Ilimitado',
  },
  {
    id: 'ranking',
    name: 'Ranking Prioritario (+20%)',
    description: 'Aparece primero en los resultados de búsqueda',
    icon: <Sparkles className="w-5 h-5" />,
    starter: false,
    pro: true,
    elite: true,
  },
  {
    id: 'image',
    name: 'Análisis de Imágenes',
    description: 'IA analiza imágenes médicas (10/mes)',
    icon: <Image className="w-5 h-5" />,
    starter: false,
    pro: false,
    elite: 10,
  },
  {
    id: 'featured',
    name: 'Destacado en Homepage',
    description: 'Mayor visibilidad en la portada',
    icon: <Star className="w-5 h-5" />,
    starter: false,
    pro: false,
    elite: true,
  },
  {
    id: 'api',
    name: 'Acceso API',
    description: 'Integra Doctor.mx con tus sistemas',
    icon: <Zap className="w-5 h-5" />,
    starter: false,
    pro: false,
    elite: true,
  },
]

export default function PricingPage() {
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })
  const [userTier, setUserTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!supabase) return

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        // Fetch current tier
        const { data: subscription } = await supabase
          .from('doctor_subscriptions')
          .select('tier')
          .eq('doctor_id', user.id)
          .eq('status', 'active')
          .single()

        if (subscription) {
          setUserTier(subscription.tier)
        }
      }
    }

    checkAuth()
  }, [supabase])

  const handleSubscribe = async (planId: string) => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      window.location.href = `/auth/login?returnTo=${encodeURIComponent('/pricing')}`
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: planId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? 'Error al procesar la suscripción')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      logger.error('Error subscribing', { planId }, error as Error)
      alert(error instanceof Error ? error.message : 'Error al procesar la suscripción')
    } finally {
      setLoading(false)
    }
  }

  const renderFeatureValue = (value: boolean | number | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      )
    }

    if (typeof value === 'number') {
      if (value === -1) {
        return <span className="text-sm font-medium text-green-600">Ilimitado</span>
      }
      return <span className="text-sm font-medium text-gray-900">{value}/mes</span>
    }

    if (value === 'Ilimitado') {
      return <span className="text-sm font-medium text-green-600">Ilimitado</span>
    }

    return <span className="text-sm font-medium text-gray-900">{String(value)}</span>
  }

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Planes diseñados para tu práctica médica
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comienza gratis y escala a medida que crece tu consultorio.
              Sin contratos a largo plazo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#plans"
                className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                Ver Planes
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#faq"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Preguntas Frecuentes
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="plans" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Billing Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12 text-center">
            <p className="text-blue-800">
              <strong>Impuestos incluidos:</strong> Todos los precios incluyen IVA (16%).
              Sin comisiones ocultas. Cancela cuando quieras.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {PLANS.map((plan) => {
              const isCurrentPlan = userTier === plan.id
              const canUpgrade = userTier && userTier !== plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                    plan.highlight
                      ? 'ring-4 ring-blue-500 shadow-2xl transform md:-translate-y-4'
                      : 'hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                      MÁS POPULAR
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className={`p-8 ${plan.highlight ? 'pt-14' : ''} bg-gradient-to-br ${plan.color} text-white`}>
                    <div className="text-center">
                      <div className="text-4xl mb-4">{plan.icon}</div>
                      <h2 className="text-2xl font-bold mb-2">{plan.name_es}</h2>
                      <p className="text-sm opacity-90 mb-6">{plan.description}</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold">
                          ${plan.price_mxn}
                        </span>
                        <span className="text-lg opacity-90">MXN/mes</span>
                      </div>
                      <p className="text-sm opacity-75 mt-2">
                        + IVA incluido
                      </p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {FEATURES.map((feature) => {
                        const value = feature[plan.id as keyof FeatureItem]
                        const isIncluded = value !== false && value !== 0

                        return (
                          <li key={feature.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {renderFeatureValue(value as boolean | number | string)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {feature.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {feature.description}
                              </p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading || isCurrentPlan}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.highlight
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                            : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                      }`}
                    >
                      {loading ? (
                        'Procesando...'
                      ) : isCurrentPlan ? (
                        'Plan Actual'
                      ) : canUpgrade ? (
                        `Cambiar a ${plan.name_es}`
                      ) : (
                        'Comenzar Ahora'
                      )}
                    </button>

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <p className="text-center text-sm text-gray-500 mt-3">
                        Este es tu plan actual
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Comparación Detallada
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Característica
                    </th>
                    {PLANS.map((plan) => (
                      <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        <span className="inline-block mr-2">{plan.icon}</span>
                        {plan.name_es}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {FEATURES.map((feature) => (
                    <tr key={feature.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 text-gray-400">
                            {feature.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {feature.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      {PLANS.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {renderFeatureValue(feature[plan.id as keyof FeatureItem] as boolean | number | string)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: '¿Puedo cambiar de plan en cualquier momento?',
                  a: 'Sí, puedes cambiar de plan cuando quieras. Los cambios se aplican de inmediata y se prorratea la diferencia en tu próximo pago.',
                },
                {
                  q: '¿Qué métodos de pago aceptan?',
                  a: 'Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de Stripe, tu pago está 100% seguro.',
                },
                {
                  q: '¿Hay contrato a largo plazo?',
                  a: 'No, todos nuestros planes son mes a mes sin contrato a largo plazo. Puedes cancelar cuando quieras sin penalización.',
                },
                {
                  q: '¿Qué pasa si excedo mis límites?',
                  a: 'Cuando alcances tu límite, podrás mejorar tu plan para obtener más funcionalidades. También puedes adquirir paquetes adicionales.',
                },
                {
                  q: '¿Cómo funcionan los reembolsos?',
                  a: 'Ofrecemos reembolso completo dentro de los primeros 7 días si no estás satisfecho. Después de ese periodo, puedes cancelar en cualquier momento y el servicio continuará hasta el final del periodo pagado.',
                },
                {
                  q: '¿Tienen soporte técnico?',
                  a: 'Sí, ofrecemos soporte por email a todos nuestros planes. Los planes Pro y Elite tienen soporte prioritario con tiempos de respuesta más rápidos.',
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para mejorar tu práctica médica?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de doctores que ya usan Doctor.mx para crecer su consultorio.
            </p>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg"
            >
              Comenzar Ahora
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
