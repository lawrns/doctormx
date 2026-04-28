'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, type SubscriptionTier, ANNUAL_DISCOUNT, getAnnualPrice } from '@/lib/subscription-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DoctorLayout from '@/components/DoctorLayout'
import { Check, Calendar, Percent, Loader2 } from 'lucide-react'

export default function SubscriptionPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
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
            status?: string
            current_period_end?: string | number
            grace_period_ends_at?: string | null
            payment_recovery_url?: string | null
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
    const [billingPortalLoading, setBillingPortalLoading] = useState(false)
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

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
                .from('doctors')
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
                .in('status', ['active', 'past_due'])
                .order('created_at', { ascending: false })
                .limit(1)
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
                    isActive: sub.status === 'active',
                    daysUntilRenewal: sub.current_period_end 
                        ? Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : undefined,
                    subscription: {
                        plan_id: sub.tier,
                        plan_name: plan?.name || sub.tier,
                        status: sub.status,
                        current_period_end: sub.current_period_end,
                        grace_period_ends_at: sub.grace_period_ends_at,
                        payment_recovery_url: sub.payment_recovery_url,
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
                body: JSON.stringify({ planId, billingInterval }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create subscription')
            }

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                await loadSubscription()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process subscription')
        } finally {
            setProcessing(false)
        }
    }

    async function handleBillingPortal() {
        setBillingPortalLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/subscriptions/billing-portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to open billing portal')
            }

            if (data.portalUrl) {
                window.location.href = data.portalUrl
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to open billing portal')
            setBillingPortalLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        )
    }

    const currentPlan = subscription?.subscription?.plan_id as keyof typeof SUBSCRIPTION_PLANS | undefined
    const checkoutSucceeded = searchParams.get('checkout') === 'success'

    return (
        <DoctorLayout profile={profile || { full_name: 'Doctor' }} isPending={isPending} currentPath="/doctor/subscription">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
                        Mi Suscripción
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona tu plan y revisa el uso de tus funcionalidades
                    </p>
                </div>

                {checkoutSucceeded && (
                    <Card className="mb-8 border-[hsl(var(--trust)/0.20)] bg-[hsl(var(--trust-soft))]">
                        <CardContent className="p-6">
                            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                                Suscripción recibida
                            </h3>
                            <p className="text-sm text-[hsl(var(--trust)/0.80)]">
                                Stripe confirmó tu checkout. Si tu cédula SEP ya fue validada, tu perfil se activará en el directorio; si no, quedará pendiente de revisión.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {subscription?.hasSubscription && subscription.subscription?.status !== 'past_due' && (
                    <Card className="mb-8 border-[hsl(var(--trust)/0.20)] bg-[hsl(var(--trust-soft))]">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                                        Suscripción Activa
                                    </h3>
                                    <p className="text-[hsl(var(--trust))] mb-4">
                                        Plan: {subscription.subscription?.plan_name}
                                    </p>
                                    <p className="text-sm text-[hsl(var(--trust)/0.80)]">
                                        Renovación: {subscription.subscription?.current_period_end ? new Date(subscription.subscription.current_period_end).toLocaleDateString('es-MX') : 'N/A'}
                                    </p>
                                    {subscription.daysUntilRenewal && (
                                        <p className="text-sm text-[hsl(var(--trust)/0.80)] mt-2">
                                            Días restantes: {subscription.daysUntilRenewal}
                                        </p>
                                    )}
                                </div>
                                <Badge variant="success">Activo</Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {subscription?.subscription?.status === 'past_due' && (
                    <Card className="mb-8 border-destructive/20 bg-destructive/10">
                        <CardContent className="p-6">
                            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                                Pago pendiente de actualización
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Tu suscripción está en periodo de gracia. Actualiza el método de pago para mantener visible tu perfil en el directorio.
                                {subscription.subscription.grace_period_ends_at
                                    ? ` Fecha límite: ${new Date(subscription.subscription.grace_period_ends_at).toLocaleDateString('es-MX')}.`
                                    : ''}
                            </p>
                            {subscription.subscription.payment_recovery_url ? (
                                <Button asChild>
                                    <a href={subscription.subscription.payment_recovery_url}>
                                        Actualizar método de pago
                                    </a>
                                </Button>
                            ) : (
                                <Button onClick={handleBillingPortal} disabled={billingPortalLoading}>
                                    {billingPortalLoading ? 'Abriendo...' : 'Abrir portal de facturación'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="mb-8 border-destructive/20 bg-destructive/10">
                        <CardContent className="p-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Billing Interval Toggle */}
                {!subscription?.hasSubscription && (
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center bg-secondary rounded-xl p-1">
                            <Button
                                variant={billingInterval === 'month' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setBillingInterval('month')}
                            >
                                Mensual
                            </Button>
                            <Button
                                variant={billingInterval === 'year' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setBillingInterval('year')}
                                className="flex items-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                Anual
                                <Badge variant="success" className="text-xs">
                                    <Percent className="w-3 h-3 mr-1" />
                                    Ahorra {ANNUAL_DISCOUNT.discountPercent}%
                                </Badge>
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
                        const isCurrentPlan = currentPlan === planId
                        const isRecommended = plan.price_mxn === 499
                        const canUpgrade = currentPlan ? 
                            SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS].price_cents < plan.price_cents : 
                            false
                        const canDowngrade = currentPlan ? 
                            SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS].price_cents > plan.price_cents : 
                            false
                        const displayedPriceCents = billingInterval === 'year'
                            ? getAnnualPrice(plan.price_cents)
                            : plan.price_cents
                        const displayedPrice = displayedPriceCents / 100
                        const equivalentMonthly = Math.round(displayedPrice / 12)

                        return (
                            <Card key={planId} className={`flex flex-col overflow-hidden ${isRecommended ? 'ring-2 ring-primary' : ''}`}>
                                {isRecommended && (
                                    <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
                                        Recomendado
                                    </div>
                                )}
                                <CardContent className="pt-6 flex flex-col flex-1">
                                    <div className="mb-6">
                                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                            {plan.name_es}
                                        </h3>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-4xl font-bold text-primary">
                                                ${displayedPrice.toLocaleString('es-MX')}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {billingInterval === 'year' ? '/año' : '/mes'}
                                            </span>
                                        </div>
                                        {billingInterval === 'year' && (
                                            <p className="text-sm text-muted-foreground">
                                                Equivale a ${equivalentMonthly.toLocaleString('es-MX')}/mes. Se cobra anualmente.
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-1 mb-6">
                                        <h4 className="font-semibold text-foreground mb-3">Incluye:</h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-foreground">
                                                <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                Perfil público visible
                                            </li>
                                            <li className="flex items-center gap-2 text-foreground">
                                                <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                {plan.limits.whatsapp_patients === -1 
                                                    ? 'WhatsApp ilimitado' 
                                                    : `${plan.limits.whatsapp_patients} pacientes WhatsApp/mes`}
                                            </li>
                                            {plan.features.priority_search_ranking && (
                                                <li className="flex items-center gap-2 text-foreground">
                                                    <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                    Búsqueda prioritaria (+20%)
                                                </li>
                                            )}
                                            {plan.features.featured_listing && (
                                                <li className="flex items-center gap-2 text-foreground">
                                                    <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                    Destacado en homepage
                                                </li>
                                            )}
                                            {plan.features.ai_copilot && (
                                                <li className="flex items-center gap-2 text-foreground">
                                                    <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                    Clinical Copilot
                                                </li>
                                            )}
                                            {plan.features.image_analysis && (
                                                <li className="flex items-center gap-2 text-foreground">
                                                    <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                    Análisis de imágenes ({plan.limits.image_analysis}/mes)
                                                </li>
                                            )}
                                            {plan.features.api_access && (
                                                <li className="flex items-center gap-2 text-foreground">
                                                    <Check className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                                                    Acceso API
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={() => handleSubscribe(planId)}
                                        disabled={isCurrentPlan || processing}
                                        className="w-full"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="animate-spin h-4 w-4" />
                                                Procesando...
                                            </>
                                        ) : (
                                            isCurrentPlan 
                                                ? 'Plan Actual' 
                                                : !subscription?.hasSubscription 
                                                    ? billingInterval === 'year' ? 'Suscribirse anual' : 'Suscribirse mensual'
                                                    : canUpgrade 
                                                        ? 'Mejorar Plan' 
                                                        : canDowngrade 
                                                            ? 'Cambiar a este Plan' 
                                                            : 'Seleccionar'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {usage && subscription?.hasSubscription && (
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <h3 className="font-display text-lg font-bold text-foreground mb-6">Uso del Mes Actual</h3>
                            
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground">WhatsApp</span>
                                        <span className="text-sm text-muted-foreground">
                                            {usage.usage?.whatsapp?.used || 0} / {
                                                usage.usage?.whatsapp?.limit === -1 
                                                    ? '∞' 
                                                    : usage.usage?.whatsapp?.limit || 0
                                            }
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                (usage.usage?.whatsapp?.percentage || 0) > 90 
                                                    ? 'bg-destructive' 
                                                    : (usage.usage?.whatsapp?.percentage || 0) > 70 
                                                        ? 'bg-amber-500' 
                                                        : 'bg-[hsl(var(--trust))]'
                                            }`}
                                            style={{ width: `${Math.min(100, usage.usage?.whatsapp?.percentage || 0)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground">Clinical Copilot</span>
                                        <span className="text-sm text-muted-foreground">
                                            {usage.usage?.aiCopilot?.used || 0} / {
                                                usage.usage?.aiCopilot?.limit === -1 
                                                    ? '∞' 
                                                    : usage.usage?.aiCopilot?.limit || 0
                                            }
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                (usage.usage?.aiCopilot?.percentage || 0) > 90 
                                                    ? 'bg-destructive' 
                                                    : (usage.usage?.aiCopilot?.percentage || 0) > 70 
                                                        ? 'bg-amber-500' 
                                                        : 'bg-[hsl(var(--trust))]'
                                            }`}
                                            style={{ width: `${Math.min(100, usage.usage?.aiCopilot?.percentage || 0)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground">Análisis de Imágenes</span>
                                        <span className="text-sm text-muted-foreground">
                                            {usage.usage?.imageAnalysis?.used || 0} / {
                                                usage.usage?.imageAnalysis?.limit === -1 
                                                    ? '∞' 
                                                    : usage.usage?.imageAnalysis?.limit || 0
                                            }
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                (usage.usage?.imageAnalysis?.percentage || 0) > 90 
                                                    ? 'bg-destructive' 
                                                    : (usage.usage?.imageAnalysis?.percentage || 0) > 70 
                                                        ? 'bg-amber-500' 
                                                        : 'bg-[hsl(var(--trust))]'
                                            }`}
                                            style={{ width: `${Math.min(100, usage.usage?.imageAnalysis?.percentage || 0)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-display text-lg font-bold text-foreground mb-4">Preguntas Frecuentes</h3>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">
                                    ¿Puedo cambiar de plan?
                                </h4>
                                <p className="text-muted-foreground">
                                    Sí, puedes cambiar de plan en cualquier momento. Los cambios se aplicarán de forma inmediata y se prorateará la diferencia.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">
                                    ¿Qué pasa si excedo mis límites?
                                </h4>
                                <p className="text-muted-foreground">
                                    Cuando alcances tu límite, podrás mejorar tu plan para obtener más funcionalidades. También puedes adquirir paquetes adicionales.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">
                                    ¿Hay contrato a largo plazo?
                                </h4>
                                <p className="text-muted-foreground">
                                    No, tu suscripción es mes a mes. Puedes cancelar en cualquier momento sin penalización.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">
                                    ¿Qué métodos de pago aceptan?
                                </h4>
                                <p className="text-muted-foreground">
                                    Aceptamos todas las tarjetas de crédito y débito a través de Stripe.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>
                        ¿Necesitas ayuda? <a href="/support" className="text-primary hover:underline">Contáctanos</a>
                    </p>
                </div>
            </div>
        </DoctorLayout>
    )
}
