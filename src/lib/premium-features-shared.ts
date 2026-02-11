// Premium AI Features System - Shared Types and Constants
// This file contains only types and constants that can be safely imported by client components

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

