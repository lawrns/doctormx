// Doctor Subscription System with Multiple Tiers
// Input: Doctor ID, Stripe token
// Process: Create subscription → Charge monthly → Manage status → Track usage
// Output: Subscription record with status and usage limits

import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/observability/logger'
import { cache } from '@/lib/cache'

export type SubscriptionTier = 'starter' | 'pro' | 'elite'

export type SubscriptionPlan = {
    id: SubscriptionTier
    name: string
    name_es: string
    price_cents: number
    price_mxn: number
    currency: string
    stripe_price_id: string
    features: Record<string, number | boolean | string>
    limits: {
        whatsapp_patients: number
        ai_copilot_queries: number
        image_analysis: number
        featured_listing: boolean
        priority_support: boolean
        api_access: boolean
    }
    highlight?: boolean
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        name_es: 'Starter',
        price_cents: 49900,
        price_mxn: 499,
        currency: 'MXN',
        stripe_price_id: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
        features: {
            profile_visibility: true,
            patient_appointments: true,
            whatsapp_patients: 30,
            basic_analytics: true,
            standard_search_ranking: true,
            email_support: true,
            ai_copilot: false,
            image_analysis: false,
            featured_listing: false,
            priority_support: false,
            api_access: false,
        },
        limits: {
            whatsapp_patients: 30,
            ai_copilot_queries: 0,
            image_analysis: 0,
            featured_listing: false,
            priority_support: false,
            api_access: false,
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        name_es: 'Pro',
        price_cents: 99900,
        price_mxn: 999,
        currency: 'MXN',
        stripe_price_id: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
        features: {
            profile_visibility: true,
            patient_appointments: true,
            whatsapp_patients: 100,
            basic_analytics: true,
            standard_search_ranking: false,
            priority_search_ranking: true,
            sms_reminders: true,
            email_support: true,
            chat_support: true,
            ai_copilot: true,
            ai_copilot_queries: 50,
            image_analysis: false,
            featured_listing: false,
            priority_support: false,
            api_access: false,
        },
        limits: {
            whatsapp_patients: 100,
            ai_copilot_queries: 50,
            image_analysis: 0,
            featured_listing: false,
            priority_support: false,
            api_access: false,
        },
        highlight: true,
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        name_es: 'Elite',
        price_cents: 199900,
        price_mxn: 1999,
        currency: 'MXN',
        stripe_price_id: process.env.STRIPE_ELITE_PRICE_ID || 'price_elite',
        features: {
            profile_visibility: true,
            patient_appointments: true,
            whatsapp_patients: -1,
            basic_analytics: true,
            advanced_analytics: true,
            standard_search_ranking: false,
            priority_search_ranking: true,
            featured_search_ranking: true,
            sms_reminders: true,
            email_support: true,
            chat_support: true,
            priority_support: true,
            ai_copilot: true,
            ai_copilot_queries: -1,
            image_analysis: true,
            image_analysis_limit: 10,
            featured_listing: true,
            exclusive_badge: true,
            api_access: true,
        },
        limits: {
            whatsapp_patients: -1,
            ai_copilot_queries: -1,
            image_analysis: 10,
            featured_listing: true,
            priority_support: true,
            api_access: true,
        },
    },
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['starter', 'pro', 'elite']

export function getPlanById(planId: string): SubscriptionPlan | null {
    if (planId in SUBSCRIPTION_PLANS) {
        return SUBSCRIPTION_PLANS[planId as SubscriptionTier]
    }
    return null
}

export function getPlanTierIndex(tier: SubscriptionTier): number {
    return SUBSCRIPTION_TIERS.indexOf(tier)
}

export function canUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
    return getPlanTierIndex(toTier) > getPlanTierIndex(fromTier)
}

export function canDowngrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
    return getPlanTierIndex(toTier) < getPlanTierIndex(fromTier)
}

interface StripeSubscriptionResponse {
    id: string
    status: string
    current_period_start: number
    current_period_end: number
    customer: string
    items: {
        data: Array<{
            id: string
            price: {
                id: string
            }
        }>
    }
}

/**
 * Create a new subscription for a doctor
 */
export async function createSubscription(
    doctorId: string,
    planId: SubscriptionTier = 'starter'
) {
    const supabase = createServiceClient()
    const plan = SUBSCRIPTION_PLANS[planId]

    if (!plan) {
        throw new Error(`Invalid plan: ${planId}`)
    }

    try {
        const { data: profile, error: profileError } = await supabase
            .from('doctors')
            .select('full_name, email')
            .eq('id', doctorId)
            .single()

        if (profileError || !profile) {
            throw new Error('Doctor profile not found')
        }

        const customer = await stripe.customers.create({
            email: profile.email,
            name: profile.full_name,
            metadata: {
                doctor_id: doctorId,
            },
        })

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: plan.stripe_price_id,
                },
            ],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        }) as unknown as StripeSubscriptionResponse

        const periodStart = subscription.current_period_start
        const periodEnd = subscription.current_period_end

        const { data: dbSubscription, error: dbError } = await supabase
            .from('doctor_subscriptions')
            .insert({
                doctor_id: doctorId,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: customer.id,
                plan_id: planId,
                plan_name: plan.name_es,
                plan_price_cents: plan.price_cents,
                plan_currency: plan.currency,
                status: subscription.status === 'active' ? 'active' : 'past_due',
                current_period_start: new Date(periodStart * 1000),
                current_period_end: new Date(periodEnd * 1000),
                whatsapp_messages_used: 0,
                whatsapp_messages_limit: plan.limits.whatsapp_patients,
                ai_copilot_used: 0,
                ai_copilot_limit: plan.limits.ai_copilot_queries,
                image_analysis_used: 0,
                image_analysis_limit: plan.limits.image_analysis,
            })
            .select()
            .single()

        if (dbError) {
            throw new Error(`Failed to store subscription: ${dbError.message}`)
        }

        // Invalidate subscription cache for this doctor
        await cache.invalidateSubscription(doctorId)

        return {
            success: true,
            subscription: dbSubscription,
            stripeSubscriptionId: subscription.id,
        }
    } catch (error) {
        logger.error('Error creating subscription:', { error })
        throw error
    }
}

/**
 * Upgrade subscription to a higher tier with proration
 */
export async function upgradeSubscription(
    doctorId: string,
    newTier: SubscriptionTier
) {
    const supabase = createServiceClient()
    const newPlan = SUBSCRIPTION_PLANS[newTier]

    if (!newPlan) {
        throw new Error(`Invalid plan: ${newTier}`)
    }

    try {
        const { data: currentSub, error: subError } = await supabase
            .from('doctor_subscriptions')
            .select('*')
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle() // Use maybeSingle instead of single to avoid 406

        if (subError || !currentSub) {
            throw new Error('No active subscription found')
        }

        const currentTier = currentSub.plan_id as SubscriptionTier
        if (!canUpgrade(currentTier, newTier)) {
            throw new Error(`Cannot upgrade from ${currentTier} to ${newTier}`)
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(
            currentSub.stripe_subscription_id
        ) as unknown as StripeSubscriptionResponse

        const updatedSubscription = await stripe.subscriptions.update(
            currentSub.stripe_subscription_id,
            {
                items: [
                    {
                        id: stripeSubscription.items.data[0].id,
                        price: newPlan.stripe_price_id,
                    },
                ],
                proration_behavior: 'create_prorations',
            }
        ) as unknown as StripeSubscriptionResponse

        const periodStart = updatedSubscription.current_period_start
        const periodEnd = updatedSubscription.current_period_end

        const { data: updated, error: updateError } = await supabase
            .from('doctor_subscriptions')
            .update({
                plan_id: newTier,
                plan_name: newPlan.name_es,
                plan_price_cents: newPlan.price_cents,
                plan_currency: newPlan.currency,
                status: updatedSubscription.status === 'active' ? 'active' : 'past_due',
                current_period_start: new Date(periodStart * 1000),
                current_period_end: new Date(periodEnd * 1000),
                whatsapp_messages_limit: newPlan.limits.whatsapp_patients,
                ai_copilot_limit: newPlan.limits.ai_copilot_queries,
                image_analysis_limit: newPlan.limits.image_analysis,
            })
            .eq('id', currentSub.id)
            .select()
            .single()

        if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`)
        }

        // Invalidate subscription cache for this doctor
        await cache.invalidateSubscription(doctorId)

        return {
            success: true,
            subscription: updated,
            stripeSubscriptionId: updatedSubscription.id,
        }
    } catch (error) {
        logger.error('Error upgrading subscription:', { error })
        throw error
    }
}

/**
 * Cancel a doctor's subscription
 */
export async function cancelSubscription(
    doctorId: string,
    reason?: string
) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error: getError } = await supabase
            .from('doctor_subscriptions')
            .select('*')
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle() // Use maybeSingle instead of single

        if (getError || !subscription) {
            throw new Error('No active subscription found')
        }

        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

        const { data: updated, error: updateError } = await supabase
            .from('doctor_subscriptions')
            .update({
                status: 'cancelled',
                cancelled_at: new Date(),
                cancellation_reason: reason,
            })
            .eq('id', subscription.id)
            .select()
            .single()

        if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`)
        }

        // Invalidate subscription cache for this doctor
        await cache.invalidateSubscription(doctorId)

        return {
            success: true,
            subscription: updated,
        }
    } catch (error) {
        logger.error('Error cancelling subscription:', { error })
        throw error
    }
}

/**
 * Check subscription status
 */
interface SubscriptionStatusResult {
    hasSubscription: boolean
    isActive: boolean
    subscription: any | null
    daysUntilRenewal?: number
    error?: string
}

export async function checkSubscriptionStatus(doctorId: string): Promise<SubscriptionStatusResult> {
    // Try cache first
    const cached = await cache.getSubscriptionStatus(doctorId)
    if (cached) {
        return cached as Awaited<ReturnType<typeof checkSubscriptionStatus>>
    }

    const supabase = createServiceClient()

    try {
        const { data: subscription, error } = await supabase
            .from('doctor_subscriptions')
            .select('*')
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() // Use maybeSingle to avoid 406 errors

        if (error) {
            console.error('Subscription check error:', error)
            return {
                hasSubscription: false,
                isActive: false,
                subscription: null,
            }
        }

        if (!subscription) {
            return {
                hasSubscription: false,
                isActive: false,
                subscription: null,
            }
        }

        const isActive =
            subscription.status === 'active' &&
            new Date(subscription.current_period_end) > new Date()

        const result = {
            hasSubscription: true,
            isActive,
            subscription,
            daysUntilRenewal: isActive
                ? Math.ceil(
                    (new Date(subscription.current_period_end).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
                : 0,
        }

        // Cache the result
        await cache.setSubscriptionStatus(doctorId, result)

        return result
    } catch (error) {
        logger.error('Error checking subscription status:', { error })
        // Return safe defaults instead of throwing
        return {
            hasSubscription: false,
            isActive: false,
            subscription: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Get subscription details for a doctor
 */
export async function getSubscriptionDetails(doctorId: string) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error } = await supabase
            .from('doctor_subscriptions')
            .select('*')
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() // Use maybeSingle

        if (error || !subscription) {
            return null
        }

        return subscription
    } catch (error) {
        logger.error('Error getting subscription details:', { error })
        return null
    }
}

/**
 * Update subscription status from Stripe webhook
 */
export async function updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: string,
    metadata?: Record<string, string | number | boolean>
) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error } = await supabase
            .from('doctor_subscriptions')
            .update({
                status,
                metadata: metadata || {},
                updated_at: new Date(),
            })
            .eq('stripe_subscription_id', stripeSubscriptionId)
            .select()
            .maybeSingle()

        if (error) {
            throw new Error(`Failed to update subscription: ${error.message}`)
        }

        // Invalidate subscription cache for this doctor
        if (subscription?.doctor_id) {
            await cache.invalidateSubscription(subscription.doctor_id)
        }

        return subscription
    } catch (error) {
        logger.error('Error updating subscription status:', { error })
        throw error
    }
}

/**
 * Check if doctor has active subscription
 */
export async function hasActiveSubscription(doctorId: string): Promise<boolean> {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error } = await supabase
            .from('doctor_subscriptions')
            .select('status, current_period_end')
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle() // Use maybeSingle

        if (error || !subscription) {
            return false
        }

        return new Date(subscription.current_period_end) > new Date()
    } catch (error) {
        logger.error('Error checking active subscription:', { error })
        return false
    }
}

/**
 * Track WhatsApp message usage
 */
export async function trackWhatsAppUsage(doctorId: string, increment: number = 1) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error: fetchError } = await supabase
            .from('doctor_subscriptions')
            .select('whatsapp_messages_used, whatsapp_messages_limit')
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle()

        if (fetchError || !subscription) {
            throw new Error('No active subscription found')
        }

        const newUsed = (subscription.whatsapp_messages_used || 0) + increment
        const limit = subscription.whatsapp_messages_limit || 0

        await supabase
            .from('doctor_subscriptions')
            .update({
                whatsapp_messages_used: newUsed,
            })
            .eq('doctor_id', doctorId)
            .eq('status', 'active')

        return {
            success: true,
            used: newUsed,
            limit,
            remaining: limit === -1 ? -1 : Math.max(0, limit - newUsed),
            isExceeded: limit !== -1 && newUsed > limit,
        }
    } catch (error) {
        logger.error('Error tracking WhatsApp usage:', { error })
        throw error
    }
}

/**
 * Track AI copilot usage
 */
export async function trackAiCopilotUsage(doctorId: string, increment: number = 1) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error: fetchError } = await supabase
            .from('doctor_subscriptions')
            .select('ai_copilot_used, ai_copilot_limit')
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle()

        if (fetchError || !subscription) {
            throw new Error('No active subscription found')
        }

        const newUsed = (subscription.ai_copilot_used || 0) + increment
        const limit = subscription.ai_copilot_limit || 0

        await supabase
            .from('doctor_subscriptions')
            .update({
                ai_copilot_used: newUsed,
            })
            .eq('doctor_id', doctorId)
            .eq('status', 'active')

        return {
            success: true,
            used: newUsed,
            limit,
            remaining: limit === -1 ? -1 : Math.max(0, limit - newUsed),
            isExceeded: limit !== -1 && newUsed > limit,
        }
    } catch (error) {
        logger.error('Error tracking AI copilot usage:', { error })
        throw error
    }
}

/**
 * Track image analysis usage
 */
export async function trackImageAnalysisUsage(doctorId: string, increment: number = 1) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error: fetchError } = await supabase
            .from('doctor_subscriptions')
            .select('image_analysis_used, image_analysis_limit')
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle()

        if (fetchError || !subscription) {
            throw new Error('No active subscription found')
        }

        const newUsed = (subscription.image_analysis_used || 0) + increment
        const limit = subscription.image_analysis_limit || 0

        await supabase
            .from('doctor_subscriptions')
            .update({
                image_analysis_used: newUsed,
            })
            .eq('doctor_id', doctorId)
            .eq('status', 'active')

        return {
            success: true,
            used: newUsed,
            limit,
            remaining: limit === -1 ? -1 : Math.max(0, limit - newUsed),
            isExceeded: limit !== -1 && newUsed > limit,
        }
    } catch (error) {
        logger.error('Error tracking image analysis usage:', { error })
        throw error
    }
}

/**
 * Get current usage statistics
 */
export async function getUsageStats(doctorId: string) {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error } = await supabase
            .from('doctor_subscriptions')
            .select(
                `
                plan_id,
                whatsapp_messages_used,
                whatsapp_messages_limit,
                ai_copilot_used,
                ai_copilot_limit,
                image_analysis_used,
                image_analysis_limit
            `
            )
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle()

        if (error || !subscription) {
            return null
        }

        const plan = getPlanById(subscription.plan_id)

        return {
            plan: plan?.name_es || 'Unknown',
            usage: {
                whatsapp: {
                    used: subscription.whatsapp_messages_used || 0,
                    limit: subscription.whatsapp_messages_limit || 0,
                    percentage: subscription.whatsapp_messages_limit === -1 
                        ? 0 
                        : ((subscription.whatsapp_messages_used || 0) / subscription.whatsapp_messages_limit) * 100,
                    remaining: subscription.whatsapp_messages_limit === -1 
                        ? -1 
                        : Math.max(0, (subscription.whatsapp_messages_limit || 0) - (subscription.whatsapp_messages_used || 0)),
                },
                aiCopilot: {
                    used: subscription.ai_copilot_used || 0,
                    limit: subscription.ai_copilot_limit || 0,
                    percentage: subscription.ai_copilot_limit === -1 
                        ? 0 
                        : ((subscription.ai_copilot_used || 0) / subscription.ai_copilot_limit) * 100,
                    remaining: subscription.ai_copilot_limit === -1 
                        ? -1 
                        : Math.max(0, (subscription.ai_copilot_limit || 0) - (subscription.ai_copilot_used || 0)),
                },
                imageAnalysis: {
                    used: subscription.image_analysis_used || 0,
                    limit: subscription.image_analysis_limit || 0,
                    percentage: subscription.image_analysis_limit === -1 
                        ? 0 
                        : ((subscription.image_analysis_used || 0) / subscription.image_analysis_limit) * 100,
                    remaining: subscription.image_analysis_limit === -1 
                        ? -1 
                        : Math.max(0, (subscription.image_analysis_limit || 0) - (subscription.image_analysis_used || 0)),
                },
            },
        }
    } catch (error) {
        logger.error('Error getting usage stats:', { error })
        return null
    }
}

/**
 * Check if a feature is available for the doctor's subscription
 */
export async function checkFeatureAccess(
    doctorId: string,
    feature: 'whatsapp' | 'ai_copilot' | 'image_analysis'
): Promise<{ allowed: boolean; reason?: string; usage?: number; limit?: number }> {
    const supabase = createServiceClient()

    try {
        const { data: subscription, error } = await supabase
            .from('doctor_subscriptions')
            .select(
                `plan_id,
                whatsapp_messages_used,
                whatsapp_messages_limit,
                ai_copilot_used,
                ai_copilot_limit,
                image_analysis_used,
                image_analysis_limit`
            )
            .eq('doctor_id', doctorId)
            .eq('status', 'active')
            .maybeSingle()

        if (error || !subscription) {
            return { allowed: false, reason: 'No active subscription' }
        }

        const plan = getPlanById(subscription.plan_id)
        if (!plan) {
            return { allowed: false, reason: 'Invalid plan' }
        }

        switch (feature) {
            case 'whatsapp': {
                const used = subscription.whatsapp_messages_used || 0
                const limit = subscription.whatsapp_messages_limit || 0
                const isUnlimited = limit === -1
                const isExceeded = !isUnlimited && used >= limit
                return {
                    allowed: isUnlimited || !isExceeded,
                    reason: isExceeded ? `WhatsApp limit reached (${used}/${limit})` : undefined,
                    usage: used,
                    limit: isUnlimited ? -1 : limit,
                }
            }
            case 'ai_copilot': {
                if (!plan.features.ai_copilot) {
                    return { allowed: false, reason: 'AI Copilot not included in your plan' }
                }
                const used = subscription.ai_copilot_used || 0
                const limit = subscription.ai_copilot_limit || 0
                const isUnlimited = limit === -1
                const isExceeded = !isUnlimited && used >= limit
                return {
                    allowed: isUnlimited || !isExceeded,
                    reason: isExceeded ? `AI Copilot limit reached (${used}/${limit})` : undefined,
                    usage: used,
                    limit: isUnlimited ? -1 : limit,
                }
            }
            case 'image_analysis': {
                if (!plan.features.image_analysis) {
                    return { allowed: false, reason: 'Image Analysis not included in your plan' }
                }
                const used = subscription.image_analysis_used || 0
                const limit = subscription.image_analysis_limit || 0
                const isExceeded = used >= limit
                return {
                    allowed: !isExceeded,
                    reason: isExceeded ? `Image Analysis limit reached (${used}/${limit})` : undefined,
                    usage: used,
                    limit,
                }
            }
            default:
                return { allowed: false, reason: 'Unknown feature' }
        }
    } catch (error) {
        logger.error('Error checking feature access:', { error })
        return { allowed: false, reason: 'Error checking access' }
    }
}
