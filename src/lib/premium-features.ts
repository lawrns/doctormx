// Premium AI Features System
// Individual feature definitions, access control, usage tracking, and billing

import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export type SubscriptionTier = 'starter' | 'pro' | 'elite'

export type PremiumFeature =
  | 'image_analysis'
  | 'clinical_copilot'
  | 'extended_transcription'
  | 'priority_ai_response'

export interface IndividualFeaturePricing {
  key: PremiumFeature
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  singlePurchase: {
    priceCents: number
    priceMXN: number
    unit: string
  }
  monthlyBundle: {
    quantity: number
    priceCents: number
    priceMXN: number
    savingsPercent: number
  }
  tierAccess: {
    starter: { included: boolean; limit: number }
    pro: { included: boolean; limit: number }
    elite: { included: boolean; limit: number }
  }
  category: 'ai' | 'transcription' | 'priority'
}

export const INDIVIDUAL_PREMIUM_FEATURES: Record<PremiumFeature, IndividualFeaturePricing> = {
  image_analysis: {
    key: 'image_analysis',
    name: 'Image Analysis',
    nameEs: 'Análisis de Imágenes',
    description: 'AI-powered medical image analysis using GPT-4 Vision',
    descriptionEs: 'Análisis de imágenes médicas con IA usando GPT-4 Vision',
    singlePurchase: {
      priceCents: 5000,
      priceMXN: 50,
      unit: 'per analysis',
    },
    monthlyBundle: {
      quantity: 10,
      priceCents: 40000,
      priceMXN: 400,
      savingsPercent: 20,
    },
    tierAccess: {
      starter: { included: false, limit: 0 },
      pro: { included: false, limit: 0 },
      elite: { included: true, limit: 10 },
    },
    category: 'ai',
  },
  clinical_copilot: {
    key: 'clinical_copilot',
    name: 'Clinical Copilot Session',
    nameEs: 'Sesión de Clinical Copilot',
    description: 'AI clinical assistant for diagnoses and consultation summaries',
    descriptionEs: 'Asistente clínico de IA para diagnósticos y resúmenes de consulta',
    singlePurchase: {
      priceCents: 3000,
      priceMXN: 30,
      unit: 'per consultation',
    },
    monthlyBundle: {
      quantity: 50,
      priceCents: 120000,
      priceMXN: 1200,
      savingsPercent: 20,
    },
    tierAccess: {
      starter: { included: false, limit: 0 },
      pro: { included: true, limit: 50 },
      elite: { included: true, limit: -1 },
    },
    category: 'ai',
  },
  extended_transcription: {
    key: 'extended_transcription',
    name: 'Extended Transcription',
    nameEs: 'Transcripción Extendida',
    description: 'AI-powered extended audio transcription for consultations',
    descriptionEs: 'Transcripción extendida de audio con IA para consultas',
    singlePurchase: {
      priceCents: 2000,
      priceMXN: 20,
      unit: 'per hour',
    },
    monthlyBundle: {
      quantity: 10,
      priceCents: 15000,
      priceMXN: 150,
      savingsPercent: 25,
    },
    tierAccess: {
      starter: { included: false, limit: 0 },
      pro: { included: false, limit: 0 },
      elite: { included: true, limit: -1 },
    },
    category: 'transcription',
  },
  priority_ai_response: {
    key: 'priority_ai_response',
    name: 'Priority AI Response',
    nameEs: 'Respuesta AI Prioritaria',
    description: 'Priority queue access for AI features - faster responses',
    descriptionEs: 'Acceso prioritario para funciones de IA - respuestas más rápidas',
    singlePurchase: {
      priceCents: 1000,
      priceMXN: 10,
      unit: 'per request',
    },
    monthlyBundle: {
      quantity: 100,
      priceCents: 80000,
      priceMXN: 800,
      savingsPercent: 20,
    },
    tierAccess: {
      starter: { included: false, limit: 0 },
      pro: { included: false, limit: 0 },
      elite: { included: true, limit: -1 },
    },
    category: 'priority',
  },
}

export interface TierUpgradePricing {
  id: SubscriptionTier
  name: string
  nameEs: string
  priceCents: number
  priceMXN: number
  stripePriceId: string
  features: PremiumFeature[]
  aiFeatures: {
    imageAnalysis: { included: boolean; limit: number }
    clinicalCopilot: { included: boolean; limit: number }
    extendedTranscription: { included: boolean; limit: number }
    priorityAiResponse: { included: boolean; limit: number }
  }
  highlight: boolean
}

export const TIER_UPGRADE_PRICING: Record<SubscriptionTier, TierUpgradePricing> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    nameEs: 'Starter',
    priceCents: 0,
    priceMXN: 0,
    stripePriceId: '',
    features: [],
    aiFeatures: {
      imageAnalysis: { included: false, limit: 0 },
      clinicalCopilot: { included: false, limit: 0 },
      extendedTranscription: { included: false, limit: 0 },
      priorityAiResponse: { included: false, limit: 0 },
    },
    highlight: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameEs: 'Pro',
    priceCents: 99900,
    priceMXN: 999,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: ['clinical_copilot'],
    aiFeatures: {
      imageAnalysis: { included: false, limit: 0 },
      clinicalCopilot: { included: true, limit: 50 },
      extendedTranscription: { included: false, limit: 0 },
      priorityAiResponse: { included: false, limit: 0 },
    },
    highlight: true,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    nameEs: 'Elite',
    priceCents: 199900,
    priceMXN: 1999,
    stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || 'price_elite',
    features: ['image_analysis', 'clinical_copilot', 'extended_transcription', 'priority_ai_response'],
    aiFeatures: {
      imageAnalysis: { included: true, limit: 10 },
      clinicalCopilot: { included: true, limit: -1 },
      extendedTranscription: { included: true, limit: -1 },
      priorityAiResponse: { included: true, limit: -1 },
    },
    highlight: false,
  },
}

export function getTierFromPlanId(planId: string): SubscriptionTier {
  const tierMap: Record<string, SubscriptionTier> = {
    basic_499: 'starter',
    pro_499: 'pro',
    elite_999: 'elite',
    starter: 'starter',
    pro: 'pro',
    elite: 'elite',
  }
  return tierMap[planId] || 'starter'
}

export async function getDoctorPremiumStatus(doctorId: string): Promise<{
  tier: SubscriptionTier
  tierName: string
  usage: Record<PremiumFeature, { used: number; limit: number | null }>
  purchases: Record<PremiumFeature, { quantity: number; remaining: number }>
  canUseFeature: (feature: PremiumFeature) => boolean
  getRemainingUsage: (feature: PremiumFeature) => number
}> {
  const supabase = createServiceClient()

  const { data: subscription } = await supabase
    .from('doctor_subscriptions')
    .select('plan_id, status, current_period_start, current_period_end')
    .eq('doctor_id', doctorId)
    .eq('status', 'active')
    .single()

  const tier = subscription ? getTierFromPlanId(subscription.plan_id) : 'starter'

  const periodStart = subscription?.current_period_start || new Date().toISOString()

  const { data: usageRecords } = await supabase
    .from('premium_feature_usage')
    .select('feature_key, usage_count, bundle_quantity, bundle_remaining')
    .eq('doctor_id', doctorId)
    .eq('period_start', periodStart)

  const usage: Record<PremiumFeature, { used: number; limit: number | null }> = {
    image_analysis: { used: 0, limit: TIER_UPGRADE_PRICING[tier].aiFeatures.imageAnalysis.limit },
    clinical_copilot: { used: 0, limit: TIER_UPGRADE_PRICING[tier].aiFeatures.clinicalCopilot.limit },
    extended_transcription: { used: 0, limit: TIER_UPGRADE_PRICING[tier].aiFeatures.extendedTranscription.limit },
    priority_ai_response: { used: 0, limit: TIER_UPGRADE_PRICING[tier].aiFeatures.priorityAiResponse.limit },
  }

  const purchases: Record<PremiumFeature, { quantity: number; remaining: number }> = {
    image_analysis: { quantity: 0, remaining: 0 },
    clinical_copilot: { quantity: 0, remaining: 0 },
    extended_transcription: { quantity: 0, remaining: 0 },
    priority_ai_response: { quantity: 0, remaining: 0 },
  }

  for (const record of usageRecords || []) {
    const feature = record.feature_key as PremiumFeature
    if (usage[feature]) {
      usage[feature].used = record.usage_count
    }
    if (purchases[feature]) {
      purchases[feature] = {
        quantity: record.bundle_quantity || 0,
        remaining: record.bundle_remaining || 0,
      }
    }
  }

  const canUseFeature = (feature: PremiumFeature): boolean => {
    const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]
    const tierAccess = featureConfig.tierAccess[tier]

    if (!tierAccess.included) {
      return false
    }

    if (tierAccess.limit === -1) {
      return true
    }

    if (tierAccess.limit === 0) {
      return purchases[feature].remaining > 0
    }

    return usage[feature].used < tierAccess.limit
  }

  const getRemainingUsage = (feature: PremiumFeature): number => {
    const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]
    const tierAccess = featureConfig.tierAccess[tier]

    if (!tierAccess.included) {
      return purchases[feature].remaining
    }

    if (tierAccess.limit === -1) {
      return -1
    }

    if (tierAccess.limit === 0) {
      return purchases[feature].remaining
    }

    return Math.max(0, tierAccess.limit - usage[feature].used)
  }

  return {
    tier,
    tierName: TIER_UPGRADE_PRICING[tier].nameEs,
    usage,
    purchases,
    canUseFeature,
    getRemainingUsage,
  }
}

export async function checkFeatureAccess(
  doctorId: string,
  feature: PremiumFeature
): Promise<{
  hasAccess: boolean
  tier: SubscriptionTier
  tierName: string
  used: number
  limit: number | null
  remaining: number
  needsUpgrade: boolean
  upgradeTo?: SubscriptionTier
  canPurchaseIndividual: boolean
  singlePrice: number
  bundlePrice: number
  bundleQuantity: number
  savingsPercent: number
}> {
  const status = await getDoctorPremiumStatus(doctorId)
  const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]

  const hasAccess = status.canUseFeature(feature)
  const remaining = status.getRemainingUsage(feature)

  let needsUpgrade = false
  let upgradeTo: SubscriptionTier | undefined

  if (!hasAccess) {
    if (status.tier === 'starter') {
      needsUpgrade = true
      upgradeTo = 'pro'
    } else if (status.tier === 'pro' && feature === 'image_analysis') {
      needsUpgrade = true
      upgradeTo = 'elite'
    }
  }

  const canPurchaseIndividual = !INDIVIDUAL_PREMIUM_FEATURES[feature].tierAccess[status.tier].included &&
    status.tier !== 'starter'

  return {
    hasAccess,
    tier: status.tier,
    tierName: status.tierName,
    used: status.usage[feature].used,
    limit: INDIVIDUAL_PREMIUM_FEATURES[feature].tierAccess[status.tier].limit,
    remaining: remaining === -1 ? -1 : remaining,
    needsUpgrade,
    upgradeTo,
    canPurchaseIndividual,
    singlePrice: featureConfig.singlePurchase.priceMXN,
    bundlePrice: featureConfig.monthlyBundle.priceMXN,
    bundleQuantity: featureConfig.monthlyBundle.quantity,
    savingsPercent: featureConfig.monthlyBundle.savingsPercent,
  }
}

export async function trackFeatureUsage(
  doctorId: string,
  feature: PremiumFeature,
  amount: number = 1
): Promise<{ success: boolean; newCount: number; limit: number | null; remaining: number }> {
  const supabase = createServiceClient()

  const { data: subscription } = await supabase
    .from('doctor_subscriptions')
    .select('plan_id, stripe_customer_id, current_period_start, current_period_end')
    .eq('doctor_id', doctorId)
    .eq('status', 'active')
    .single()

  const periodStart = subscription?.current_period_start || new Date().toISOString()
  const periodEnd = subscription?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: existingUsage } = await supabase
    .from('premium_feature_usage')
    .select('id, usage_count, bundle_remaining')
    .eq('doctor_id', doctorId)
    .eq('feature_key', feature)
    .eq('period_start', periodStart)
    .single()

  let newCount = amount

  if (existingUsage) {
    const { error: updateError } = await supabase
      .from('premium_feature_usage')
      .update({
        usage_count: existingUsage.usage_count + amount,
        bundle_remaining: Math.max(0, (existingUsage.bundle_remaining || 0) - amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUsage.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update usage: ${updateError.message}`)
    }

    newCount = existingUsage.usage_count + amount
  } else {
    const { error: insertError } = await supabase
      .from('premium_feature_usage')
      .insert({
        doctor_id: doctorId,
        feature_key: feature,
        usage_count: amount,
        bundle_quantity: 0,
        bundle_remaining: 0,
        period_start: periodStart,
        period_end: periodEnd,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create usage record: ${insertError.message}`)
    }
  }

  const tier = subscription ? getTierFromPlanId(subscription.plan_id) : 'starter'
  const limit = INDIVIDUAL_PREMIUM_FEATURES[feature].tierAccess[tier].limit

  return {
    success: true,
    newCount,
    limit,
    remaining: limit === -1 ? -1 : Math.max(0, limit - newCount),
  }
}

export async function createFeaturePurchase(
  doctorId: string,
  feature: PremiumFeature,
  purchaseType: 'single' | 'bundle'
): Promise<{ sessionId: string; url: string }> {
  const supabase = createServiceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  const { data: subscription } = await supabase
    .from('doctor_subscriptions')
    .select('plan_id, stripe_customer_id, current_period_start, current_period_end')
    .eq('doctor_id', doctorId)
    .eq('status', 'active')
    .single()

  const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]
  const purchaseConfig = purchaseType === 'bundle' ? featureConfig.monthlyBundle : featureConfig.singlePurchase

  const productName = purchaseType === 'bundle'
    ? `${featureConfig.nameEs} - Pack de ${featureConfig.monthlyBundle.quantity}`
    : `${featureConfig.nameEs} - Uso único`

  const product = await stripe.products.create({
    name: productName,
    description: featureConfig.descriptionEs,
    metadata: {
      feature_key: feature,
      purchase_type: purchaseType,
      doctor_id: doctorId,
    },
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: purchaseConfig.priceCents,
    currency: 'mxn',
    metadata: {
      feature_key: feature,
      purchase_type: purchaseType,
      quantity: purchaseType === 'bundle' ? String(featureConfig.monthlyBundle.quantity) : '1',
    },
  })

  const session = await stripe.checkout.sessions.create({
    customer: subscription?.stripe_customer_id || undefined,
    customer_email: !subscription?.stripe_customer_id ? profile?.email : undefined,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      doctor_id: doctorId,
      feature_key: feature,
      purchase_type: purchaseType,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/premium?canceled=true`,
  })

  return {
    sessionId: session.id,
    url: session.url || '',
  }
}

export async function verifyPurchaseAndCredit(
  sessionId: string,
  doctorId: string,
  feature: PremiumFeature,
  purchaseType: 'single' | 'bundle'
): Promise<{ success: boolean; quantity: number }> {
  const supabase = createServiceClient()

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed')
  }

  const { data: subscription } = await supabase
    .from('doctor_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('doctor_id', doctorId)
    .eq('status', 'active')
    .single()

  const periodStart = subscription?.current_period_start || new Date().toISOString()
  const periodEnd = subscription?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const featureConfig = INDIVIDUAL_PREMIUM_FEATURES[feature]
  const quantity = purchaseType === 'bundle' ? featureConfig.monthlyBundle.quantity : 1

  const { data: existingRecord } = await supabase
    .from('premium_feature_usage')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('feature_key', feature)
    .eq('period_start', periodStart)
    .single()

  if (existingRecord) {
    await supabase
      .from('premium_feature_usage')
      .update({
        bundle_quantity: quantity,
        bundle_remaining: quantity,
        usage_count: 0,
        purchase_session_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRecord.id)
  } else {
    await supabase
      .from('premium_feature_usage')
      .insert({
        doctor_id: doctorId,
        feature_key: feature,
        usage_count: 0,
        bundle_quantity: quantity,
        bundle_remaining: quantity,
        period_start: periodStart,
        period_end: periodEnd,
        purchase_session_id: sessionId,
      })
  }

  await supabase
    .from('premium_purchases')
    .insert({
      doctor_id: doctorId,
      feature_key: feature,
      purchase_type: purchaseType,
      quantity,
      amount_cents: featureConfig.singlePurchase.priceCents,
      currency: 'MXN',
      stripe_session_id: sessionId,
      status: 'completed',
    })

  return {
    success: true,
    quantity,
  }
}

export async function getPremiumUsageReport(doctorId: string): Promise<{
  tier: SubscriptionTier
  tierName: string
  features: Record<PremiumFeature, {
    name: string
    used: number
    limit: number | null
    remaining: number
    included: boolean
    canPurchase: boolean
    singlePrice: number
    bundlePrice: number
    bundleQuantity: number
    savingsPercent: number
  }>
  totalPurchases: number
  totalUsage: number
}> {
  const status = await getDoctorPremiumStatus(doctorId)

  const features: Record<PremiumFeature, {
    name: string
    used: number
    limit: number | null
    remaining: number
    included: boolean
    canPurchase: boolean
    singlePrice: number
    bundlePrice: number
    bundleQuantity: number
    savingsPercent: number
  }> = {
    image_analysis: {
      name: INDIVIDUAL_PREMIUM_FEATURES.image_analysis.nameEs,
      used: status.usage.image_analysis.used,
      limit: status.usage.image_analysis.limit,
      remaining: status.getRemainingUsage('image_analysis'),
      included: TIER_UPGRADE_PRICING[status.tier].aiFeatures.imageAnalysis.included,
      canPurchase: status.tier === 'pro' || status.tier === 'elite',
      singlePrice: INDIVIDUAL_PREMIUM_FEATURES.image_analysis.singlePurchase.priceMXN,
      bundlePrice: INDIVIDUAL_PREMIUM_FEATURES.image_analysis.monthlyBundle.priceMXN,
      bundleQuantity: INDIVIDUAL_PREMIUM_FEATURES.image_analysis.monthlyBundle.quantity,
      savingsPercent: INDIVIDUAL_PREMIUM_FEATURES.image_analysis.monthlyBundle.savingsPercent,
    },
    clinical_copilot: {
      name: INDIVIDUAL_PREMIUM_FEATURES.clinical_copilot.nameEs,
      used: status.usage.clinical_copilot.used,
      limit: status.usage.clinical_copilot.limit,
      remaining: status.getRemainingUsage('clinical_copilot'),
      included: TIER_UPGRADE_PRICING[status.tier].aiFeatures.clinicalCopilot.included,
      canPurchase: false,
      singlePrice: INDIVIDUAL_PREMIUM_FEATURES.clinical_copilot.singlePurchase.priceMXN,
      bundlePrice: INDIVIDUAL_PREMIUM_FEATURES.clinical_copilot.monthlyBundle.priceMXN,
      bundleQuantity: INDIVIDUAL_PREMIUM_FEATURES.clinical_copilot.monthlyBundle.quantity,
      savingsPercent: INDIVIDUAL_PREMIUM_FEATURES.clinical_copilot.monthlyBundle.savingsPercent,
    },
    extended_transcription: {
      name: INDIVIDUAL_PREMIUM_FEATURES.extended_transcription.nameEs,
      used: status.usage.extended_transcription.used,
      limit: status.usage.extended_transcription.limit,
      remaining: status.getRemainingUsage('extended_transcription'),
      included: TIER_UPGRADE_PRICING[status.tier].aiFeatures.extendedTranscription.included,
      canPurchase: false,
      singlePrice: INDIVIDUAL_PREMIUM_FEATURES.extended_transcription.singlePurchase.priceMXN,
      bundlePrice: INDIVIDUAL_PREMIUM_FEATURES.extended_transcription.monthlyBundle.priceMXN,
      bundleQuantity: INDIVIDUAL_PREMIUM_FEATURES.extended_transcription.monthlyBundle.quantity,
      savingsPercent: INDIVIDUAL_PREMIUM_FEATURES.extended_transcription.monthlyBundle.savingsPercent,
    },
    priority_ai_response: {
      name: INDIVIDUAL_PREMIUM_FEATURES.priority_ai_response.nameEs,
      used: status.usage.priority_ai_response.used,
      limit: status.usage.priority_ai_response.limit,
      remaining: status.getRemainingUsage('priority_ai_response'),
      included: TIER_UPGRADE_PRICING[status.tier].aiFeatures.priorityAiResponse.included,
      canPurchase: false,
      singlePrice: INDIVIDUAL_PREMIUM_FEATURES.priority_ai_response.singlePurchase.priceMXN,
      bundlePrice: INDIVIDUAL_PREMIUM_FEATURES.priority_ai_response.monthlyBundle.priceMXN,
      bundleQuantity: INDIVIDUAL_PREMIUM_FEATURES.priority_ai_response.monthlyBundle.quantity,
      savingsPercent: INDIVIDUAL_PREMIUM_FEATURES.priority_ai_response.monthlyBundle.savingsPercent,
    },
  }

  const totalPurchases = 0
  let totalUsage = 0

  for (const feature of Object.keys(features) as PremiumFeature[]) {
    totalUsage += status.usage[feature].used
  }

  return {
    tier: status.tier,
    tierName: status.tierName,
    features,
    totalPurchases,
    totalUsage,
  }
}
