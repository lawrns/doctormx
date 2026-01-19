'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/subscription-types'
import { Card } from '@/components/Card'
import { LoadingButton } from '@/components/LoadingButton'
import { Badge } from '@/components/Badge'

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
)

const XIcon = () => (
    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

const StarIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
)

const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
)

const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
)

const FEATURES = [
    { name: 'Perfil público en Doctor.mx', starter: true, pro: true, elite: true },
    { name: 'Recibir solicitudes de cita', starter: true, pro: true, elite: true },
    { name: 'Notificaciones WhatsApp/mes', starter: '30', pro: '100', elite: 'Ilimitado' },
    { name: 'Posición en búsquedas', starter: 'Estándar', pro: '+20% visibilidad', elite: '+50% visibilidad' },
    { name: 'Recordatorios SMS', starter: false, pro: true, elite: true },
    { name: 'Dr. Simeon Copilot (IA)', starter: false, pro: true, elite: true },
    { name: 'Consultas con IA/mes', starter: '0', pro: '50', elite: 'Ilimitado' },
    { name: 'Análisis de imágenes médicas/mes', starter: '0', pro: '0', elite: '10' },
    { name: 'Perfil destacado en inicio', starter: false, pro: false, elite: true },
    { name: 'Insignia Elite verificada', starter: false, pro: false, elite: true },
    { name: 'Acceso API para integraciones', starter: false, pro: false, elite: true },
    { name: 'Soporte', starter: 'Email', pro: 'Chat', elite: 'Prioritario' },
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
        answer: 'El Clinical Copilot es tu asistente médico con IA. Te ayuda con diagnósticos diferenciales, búsqueda de literatura médica, y análisis de imágenes clínicas según tu plan.'
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

export default function PricingPage() {
    const router = useRouter()
    const supabase = createClient()

    const [subscription, setSubscription] = useState<{
        hasSubscription: boolean
        isActive: boolean
        subscription: {
            plan_id: string
            plan_name: string
        } | null
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        loadSubscription()
    }, [])

    async function loadSubscription() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            // Fetch subscription status directly from database
            const { data: sub } = await supabase
                .from('doctor_subscriptions')
                .select('*')
                .eq('doctor_id', user.id)
                .eq('status', 'active')
                .single()
            
            if (sub) {
                const plan = SUBSCRIPTION_PLANS[sub.tier as SubscriptionTier]
                setSubscription({
                    hasSubscription: true,
                    isActive: true,
                    subscription: {
                        plan_id: sub.tier,
                        plan_name: plan?.name || sub.tier,
                    },
                })
            } else {
                setSubscription({ hasSubscription: false, isActive: false, subscription: null })
            }
        } catch (error) {
            console.error('Error loading subscription:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubscribe(planId: string) {
        setProcessing(planId)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create subscription')
            }

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                router.push('/doctor/subscription')
            }
        } catch (error) {
            console.error('Error:', error)
            alert(error instanceof Error ? error.message : 'Error al procesar')
        } finally {
            setProcessing(null)
        }
    }

    async function handleManageSubscription() {
        router.push('/doctor/subscription')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const currentPlanId = subscription?.subscription?.plan_id as SubscriptionTier | undefined

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Planes diseñados para médicos mexicanos
                    </h1>
                    <p className="text-xl text-blue-100 mb-8">
                        Elige el plan ideal para tu práctica. Sin contratos a largo plazo.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                            <CheckIcon /> Sin compromiso
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckIcon /> Cancelar cuando quieras
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckIcon /> Prueba gratis 7 días
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {SUBSCRIPTION_TIERS.map((tier) => {
                        const plan = SUBSCRIPTION_PLANS[tier]
                        const isCurrentPlan = currentPlanId === tier

                        return (
                            <Card key={tier} className={`flex flex-col relative ${plan.highlight ? 'ring-2 ring-blue-500 shadow-xl scale-105 z-10' : ''}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge variant="info">
                                            <span className="flex items-center gap-1">
                                                <StarIcon /> Más Popular
                                            </span>
                                        </Badge>
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute -top-4 right-4">
                                        <Badge variant="success">Plan Actual</Badge>
                                    </div>
                                )}

                                <div className="text-center pb-6 border-b border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name_es}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl font-bold text-gray-900">
                                            ${plan.price_mxn}
                                        </span>
                                        <span className="text-gray-600">MXN/mes</span>
                                    </div>
                                </div>

                                <div className="flex-1 p-6">
                                    <ul className="space-y-4">
                                        {FEATURES.map((feature, idx) => {
                                            const value = feature[tier === 'starter' ? 'starter' : tier === 'pro' ? 'pro' : 'elite']
                                            const isTrue = value === true
                                            const isFalse = value === false
                                            const displayValue = typeof value === 'boolean' ? (isTrue ? '✓' : '✗') : value

                                            return (
                                                <li key={idx} className="flex items-start gap-3">
                                                    {isTrue ? (
                                                        <CheckIcon />
                                                    ) : isFalse ? (
                                                        <XIcon />
                                                    ) : (
                                                        <span className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 font-semibold text-sm">{displayValue}</span>
                                                    )}
                                                    <span className={`${isFalse ? 'text-gray-400' : 'text-gray-700'}`}>
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>

                                <div className="p-6 pt-0">
                                    {subscription?.hasSubscription ? (
                                        isCurrentPlan ? (
                                            <LoadingButton
                                                onClick={handleManageSubscription}
                                                className="w-full"
                                                variant="secondary"
                                            >
                                                Gestionar Mi Plan
                                            </LoadingButton>
                                        ) : (
                                            <LoadingButton
                                                onClick={() => handleSubscribe(tier)}
                                                isLoading={processing === tier}
                                                className="w-full"
                                                variant={plan.highlight ? 'primary' : 'secondary'}
                                            >
                                                {SUBSCRIPTION_TIERS.indexOf(tier) > SUBSCRIPTION_TIERS.indexOf(currentPlanId || 'starter') 
                                                    ? 'Mejorar a este Plan' 
                                                    : 'Cambiar a este Plan'}
                                            </LoadingButton>
                                        )
                                    ) : (
                                        <LoadingButton
                                            onClick={() => router.push('/auth/register')}
                                            className="w-full"
                                            variant={plan.highlight ? 'primary' : 'secondary'}
                                        >
                                            Comenzar Prueba Gratis
                                        </LoadingButton>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Compara los Planes
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-xl shadow-lg">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-4 font-semibold text-gray-900">Características</th>
                                    <th className="text-center p-4 font-semibold text-gray-900 bg-blue-50">Starter</th>
                                    <th className="text-center p-4 font-semibold text-gray-900 bg-blue-50">Pro</th>
                                    <th className="text-center p-4 font-semibold text-gray-900 bg-blue-50">Elite</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FEATURES.map((feature, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="p-4 text-gray-700">{feature.name}</td>
                                        <td className="text-center p-4">
                                            {typeof feature.starter === 'boolean' ? (
                                                feature.starter ? <CheckIcon /> : <XIcon />
                                            ) : (
                                                <span className="font-medium text-gray-900">{feature.starter}</span>
                                            )}
                                        </td>
                                        <td className="text-center p-4 bg-blue-50/30">
                                            {typeof feature.pro === 'boolean' ? (
                                                feature.pro ? <CheckIcon /> : <XIcon />
                                            ) : (
                                                <span className="font-medium text-gray-900">{feature.pro}</span>
                                            )}
                                        </td>
                                        <td className="text-center p-4">
                                            {typeof feature.elite === 'boolean' ? (
                                                feature.elite ? <CheckIcon /> : <XIcon />
                                            ) : (
                                                <span className="font-medium text-gray-900">{feature.elite}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Preguntas Frecuentes
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {FAQS.map((faq, idx) => (
                            <Card key={idx}>
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">
                        ¿Aún tienes dudas?
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Nuestro equipo de soporte está disponible para ayudarte a elegir el plan ideal para tu práctica médica.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="mailto:doctores@doctor.mx"
                            className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
                        >
                            <PhoneIcon />
                            Agendar llamada con ventas
                        </a>
                        <a
                            href="/support"
                            className="flex items-center gap-2 border border-white/30 px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
                        >
                            <ShieldIcon />
                            Ver preguntas frecuentes
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
