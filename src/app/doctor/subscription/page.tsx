'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '@/lib/subscription-types'
import { Card } from '@/components/ui/card'
import { LoadingButton } from '@/components/LoadingButton'
import { Badge } from '@/components/Badge'
import DoctorLayout from '@/components/DoctorLayout'
import { Check } from 'lucide-react'

export default function SubscriptionPage() {
    const router = useRouter()
    const [supabase] = useState(() => {
        try {
            return createClient()
        } catch {
            return null
        }
    })

    const [subscription, setSubscription] = useState<{
        hasSubscription?: boolean
        isActive?: boolean
        daysUntilRenewal?: number
        subscription?: {
            plan_id?: string
            plan_name?: string
            current_period_end?: string | number
        } | null
    } | null>(null)
    const [usage, setUsage] = useState<{
        plan?: string
        usage?: {
            whatsapp?: { used: number; limit: number; percentage: number; remaining: number }
            aiCopilot?: { used: number; limit: number; percentage: number; remaining: number }
            imageAnalysis?: { used: number; limit: number; percentage: number; remaining: number }
        }
    } | null>(null)
    const [profile, setProfile] = useState<{ full_name: string } | null>(null)
    const [isPending, setIsPending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }
        loadSubscription()
    }, [supabase])

    async function loadSubscription() {
        if (!supabase) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            // Fetch profile and doctor status
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single()

            const { data: doctorData } = await supabase
                .from('doctores')
                .select('status')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)
            }
            setIsPending(!doctorData || doctorData.status !== 'approved')

            // Fetch subscription status directly from database
            const { data: sub } = await supabase
                .from('doctor_subscriptions')
                .select('*')
                .eq('doctor_id', user.id)
                .eq('status', 'active')
                .single()
            
            // Fetch usage stats directly
            const { data: usageData } = await supabase
                .from('doctor_subscription_usage')
                .select('*')
                .eq('doctor_id', user.id)
                .single()
            
            if (sub) {
                const plan = SUBSCRIPTION_PLANS[sub.tier as SubscriptionTier]
                setSubscription({
                    hasSubscription: true,
                    isActive: true,
                    daysUntilRenewal: sub.current_period_end 
                        ? Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : undefined,
                    subscription: {
                        plan_id: sub.tier,
                        plan_name: plan?.name || sub.tier,
                    },
                })
            } else {
                setSubscription({ hasSubscription: false, isActive: false })
            }
            
            if (usageData) {
                setUsage({
                    plan: sub?.tier,
                    usage: {
                        whatsapp: { used: usageData.whatsapp_patients_used || 0, limit: 100, percentage: 0, remaining: 100 },
                        aiCopilot: { used: usageData.ai_copilot_queries_used || 0, limit: 50, percentage: 0, remaining: 50 },
                        imageAnalysis: { used: usageData.image_analysis_used || 0, limit: 20, percentage: 0, remaining: 20 },
                    },
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load subscription')
        } finally {
            setLoading(false)
        }
    }

    async function handleSubscribe(planId: string) {
        setProcessing(true)
        setError(null)

        try {
            if (!supabase) {
                router.push('/auth/login')
                return
            }

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

            if (data.stripeClientSecret) {
                router.push(`/checkout/${data.subscription.id}`)
            } else {
                await loadSubscription()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process subscription')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const currentPlan = subscription?.subscription?.plan_id as keyof typeof SUBSCRIPTION_PLANS | undefined

    return (
        <DoctorLayout profile={profile || { full_name: 'Doctor' }} isPending={isPending} currentPath="/doctor/subscription">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Mi Suscripción
                    </h1>
                    <p className="text-gray-600">
                        Gestiona tu plan y revisa el uso de tus funcionalidades
                    </p>
                </div>

                {subscription?.hasSubscription && (
                    <Card className="mb-8 border-green-200 bg-green-50">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-green-900 mb-2">
                                    Suscripción Activa
                                </h3>
                                <p className="text-green-700 mb-4">
                                    Plan: {subscription.subscription?.plan_name}
                                </p>
                                <p className="text-sm text-green-600">
                                    Renovación: {subscription.subscription?.current_period_end ? new Date(subscription.subscription.current_period_end).toLocaleDateString('es-MX') : 'N/A'}
                                </p>
                                {subscription.daysUntilRenewal && (
                                    <p className="text-sm text-green-600 mt-2">
                                        Días restantes: {subscription.daysUntilRenewal}
                                    </p>
                                )}
                            </div>
                            <Badge variant="success">Activo</Badge>
                        </div>
                    </Card>
                )}

                {error && (
                    <Card className="mb-8 border-red-200 bg-red-50">
                        <p className="text-red-700">{error}</p>
                    </Card>
                )}

                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
                        const isCurrentPlan = currentPlan === planId
                        const canUpgrade = currentPlan ? 
                            SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS].price_cents < plan.price_cents : 
                            false
                        const canDowngrade = currentPlan ? 
                            SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS].price_cents > plan.price_cents : 
                            false

                        return (
                            <Card key={planId} className={`flex flex-col ${plan.highlight ? 'ring-2 ring-blue-500' : ''}`}>
                                {plan.highlight && (
                                    <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium -mt-6 mx-4 rounded-t-lg">
                                        Más Popular
                                    </div>
                                )}
                                <div className="mb-6 pt-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {plan.name_es}
                                    </h3>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-4xl font-bold text-blue-600">
                                            ${plan.price_mxn}
                                        </span>
                                        <span className="text-gray-600">/mes</span>
                                    </div>
                                </div>

                                <div className="flex-1 mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Incluye:</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-gray-700">
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            Perfil público visible
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-700">
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            {plan.limits.whatsapp_patients === -1 
                                                ? 'WhatsApp ilimitado' 
                                                : `${plan.limits.whatsapp_patients} pacientes WhatsApp/mes`}
                                        </li>
                                        {plan.features.priority_search_ranking && (
                                            <li className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                Búsqueda prioritaria (+20%)
                                            </li>
                                        )}
                                        {plan.features.featured_listing && (
                                            <li className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                Destacado en homepage
                                            </li>
                                        )}
                                        {plan.features.ai_copilot && (
                                            <li className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                Clinical Copilot
                                            </li>
                                        )}
                                        {plan.features.image_analysis && (
                                            <li className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                Análisis de imágenes ({plan.limits.image_analysis}/mes)
                                            </li>
                                        )}
                                        {plan.features.api_access && (
                                            <li className="flex items-center gap-2 text-gray-700">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                Acceso API
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <LoadingButton
                                    onClick={() => handleSubscribe(planId)}
                                    isLoading={processing}
                                    disabled={isCurrentPlan}
                                    className="w-full"
                                >
                                    {isCurrentPlan 
                                        ? 'Plan Actual' 
                                        : !subscription?.hasSubscription 
                                            ? 'Suscribirse' 
                                            : canUpgrade 
                                                ? 'Mejorar Plan' 
                                                : canDowngrade 
                                                    ? 'Cambiar a este Plan' 
                                                    : 'Seleccionar'}
                                </LoadingButton>
                            </Card>
                        )
                    })}
                </div>

                {usage && subscription?.hasSubscription && (
                    <Card className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Uso del Mes Actual</h3>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                                    <span className="text-sm text-gray-600">
                                        {usage.usage?.whatsapp?.used || 0} / {
                                            usage.usage?.whatsapp?.limit === -1 
                                                ? '∞' 
                                                : usage.usage?.whatsapp?.limit || 0
                                        }
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            (usage.usage?.whatsapp?.percentage || 0) > 90 
                                                ? 'bg-red-500' 
                                                : (usage.usage?.whatsapp?.percentage || 0) > 70 
                                                    ? 'bg-yellow-500' 
                                                    : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(100, usage.usage?.whatsapp?.percentage || 0)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Clinical Copilot</span>
                                    <span className="text-sm text-gray-600">
                                        {usage.usage?.aiCopilot?.used || 0} / {
                                            usage.usage?.aiCopilot?.limit === -1 
                                                ? '∞' 
                                                : usage.usage?.aiCopilot?.limit || 0
                                        }
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            (usage.usage?.aiCopilot?.percentage || 0) > 90 
                                                ? 'bg-red-500' 
                                                : (usage.usage?.aiCopilot?.percentage || 0) > 70 
                                                    ? 'bg-yellow-500' 
                                                    : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(100, usage.usage?.aiCopilot?.percentage || 0)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Análisis de Imágenes</span>
                                    <span className="text-sm text-gray-600">
                                        {usage.usage?.imageAnalysis?.used || 0} / {
                                            usage.usage?.imageAnalysis?.limit === -1 
                                                ? '∞' 
                                                : usage.usage?.imageAnalysis?.limit || 0
                                        }
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            (usage.usage?.imageAnalysis?.percentage || 0) > 90 
                                                ? 'bg-red-500' 
                                                : (usage.usage?.imageAnalysis?.percentage || 0) > 70 
                                                    ? 'bg-yellow-500' 
                                                    : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(100, usage.usage?.imageAnalysis?.percentage || 0)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Preguntas Frecuentes</h3>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                ¿Puedo cambiar de plan?
                            </h4>
                            <p className="text-gray-600">
                                Sí, puedes cambiar de plan en cualquier momento. Los cambios se aplicarán de forma inmediata y se prorateará la diferencia.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                ¿Qué pasa si excedo mis límites?
                            </h4>
                            <p className="text-gray-600">
                                Cuando alcances tu límite, podrás mejorar tu plan para obtener más funcionalidades. También puedes adquirir paquetes adicionales.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                ¿Hay contrato a largo plazo?
                            </h4>
                            <p className="text-gray-600">
                                No, tu suscripción es mes a mes. Puedes cancelar en cualquier momento sin penalización.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                ¿Qué métodos de pago aceptan?
                            </h4>
                            <p className="text-gray-600">
                                Aceptamos todas las tarjetas de crédito y débito a través de Stripe.
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>
                        ¿Necesitas ayuda? <a href="/support" className="text-blue-600 hover:underline">Contáctanos</a>
                    </p>
                </div>
            </div>
        </DoctorLayout>
    )
}
