export type SubscriptionTier = 'starter' | 'pro' | 'elite' | 'clinic'
export type BillingInterval = 'month' | 'year'

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

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['starter', 'pro', 'elite', 'clinic']

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
            image_analysis: true,
            image_analysis_limit: 20,
            featured_listing: false,
            priority_support: false,
            api_access: false,
        },
        limits: {
            whatsapp_patients: 100,
            ai_copilot_queries: 50,
            image_analysis: 20,
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
            whatsapp_patients: -1, // unlimited
            basic_analytics: true,
            advanced_analytics: true,
            standard_search_ranking: false,
            priority_search_ranking: true,
            featured_listing: true,
            sms_reminders: true,
            email_support: true,
            chat_support: true,
            phone_support: true,
            priority_support: true,
            ai_copilot: true,
            ai_copilot_queries: -1, // unlimited
            image_analysis: true,
            image_analysis_limit: -1, // unlimited
            api_access: true,
            white_label: true,
        },
        limits: {
            whatsapp_patients: -1,
            ai_copilot_queries: -1,
            image_analysis: -1,
            featured_listing: true,
            priority_support: true,
            api_access: true,
        },
    },
    clinic: {
        id: 'clinic',
        name: 'Clinic',
        name_es: 'Clínica',
        price_cents: 599900, // $5,999 MXN (~$300 USD)
        price_mxn: 5999,
        currency: 'MXN',
        stripe_price_id: process.env.STRIPE_CLINIC_PRICE_ID || 'price_clinic',
        features: {
            // Multi-doctor support
            max_doctors: 5,
            max_staff: 10,
            
            // All Elite features included
            profile_visibility: true,
            patient_appointments: true,
            whatsapp_patients: -1, // unlimited
            basic_analytics: true,
            advanced_analytics: true,
            standard_search_ranking: false,
            priority_search_ranking: true,
            featured_listing: true,
            sms_reminders: true,
            email_support: true,
            chat_support: true,
            phone_support: true,
            priority_support: true,
            ai_copilot: true,
            ai_copilot_queries: -1, // unlimited
            image_analysis: true,
            image_analysis_limit: -1, // unlimited
            api_access: true,
            
            // Clinic-specific features
            white_label: true,
            custom_domain: true,
            patient_portal: true,
            insurance_integration: true,
            bulk_patient_import: true,
            team_scheduling: true,
            admin_dashboard: true,
        },
        limits: {
            whatsapp_patients: -1,
            ai_copilot_queries: -1,
            image_analysis: -1,
            featured_listing: true,
            priority_support: true,
            api_access: true,
        },
    },
}

export interface SubscriptionStatus {
    isActive: boolean
    tier: SubscriptionTier | null
    plan: SubscriptionPlan | null
    billingInterval: BillingInterval
    expiresAt: Date | null
    usage: {
        whatsappPatients: number
        aiCopilotQueries: number
        imageAnalysis: number
    }
    limits: {
        whatsappPatients: number
        aiCopilotQueries: number
        imageAnalysis: number
    }
}

// Annual billing discount: 2 months free = 17% discount
export const ANNUAL_DISCOUNT = {
    monthsFree: 2,
    discountPercent: 17,
    multiplier: 10 / 12, // Pay for 10 months, get 12
}

export function getAnnualPrice(monthlyPriceCents: number): number {
    return Math.round(monthlyPriceCents * 12 * ANNUAL_DISCOUNT.multiplier)
}

export function getMonthlySavings(monthlyPriceCents: number): number {
    return monthlyPriceCents * 2 // 2 months free
}
