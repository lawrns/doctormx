// Referral Program - Viral Growth Engine
// Input: Doctor ID
// Process: Generate referral code → Track referrals → Reward referrer
// Output: Referral link + reward tracking

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { sendWhatsAppMessage } from './whatsapp-business-api'

export interface ReferralCode {
    code: string
    doctorId: string
    url: string
    createdAt: Date
}

export interface ReferralReward {
    type: 'free_month' | 'credit' | 'upgrade'
    value: number
    description: string
}

// Rewards configuration
export const REFERRAL_REWARDS: Record<number, ReferralReward> = {
    1: { type: 'free_month', value: 1, description: '1 mes gratis' },
    3: { type: 'free_month', value: 2, description: '2 meses gratis' },
    5: { type: 'upgrade', value: 1, description: 'Upgrade a Pro por 1 mes' },
    10: { type: 'free_month', value: 6, description: '6 meses gratis' },
}

/**
 * Generate a unique referral code for a doctor
 */
export function generateReferralCode(doctorId: string): string {
    // Create a short, memorable code: DOC + first 6 chars of doctor ID + random
    const shortId = doctorId.replace(/-/g, '').slice(0, 6).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `DOC${shortId}${random}`
}

/**
 * Create or get existing referral code for doctor
 */
export async function getOrCreateReferralCode(doctorId: string): Promise<ReferralCode> {
    const supabase = await createServiceClient()

    // Check if code already exists
    const { data: existing } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('doctor_id', doctorId)
        .single()

    if (existing) {
        return {
            code: existing.code,
            doctorId: existing.doctor_id,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${existing.code}`,
            createdAt: new Date(existing.created_at),
        }
    }

    // Create new code
    const code = generateReferralCode(doctorId)
    const { data: created, error } = await supabase
        .from('referral_codes')
        .insert({
            code,
            doctor_id: doctorId,
            created_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) {
        logger.error('Failed to create referral code:', { error, doctorId })
        throw new Error(`Failed to create referral code: ${error.message}`)
    }

    return {
        code: created.code,
        doctorId: created.doctor_id,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${created.code}`,
        createdAt: new Date(created.created_at),
    }
}

/**
 * Process a referral when a new doctor signs up
 */
export async function processReferral(
    referralCode: string,
    newDoctorId: string
): Promise<{ success: boolean; reward?: ReferralReward; error?: string }> {
    const supabase = await createServiceClient()

    try {
        // 1. Validate referral code
        const { data: codeData, error: codeError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', referralCode)
            .single()

        if (codeError || !codeData) {
            return { success: false, error: 'Invalid referral code' }
        }

        // 2. Prevent self-referral
        if (codeData.doctor_id === newDoctorId) {
            return { success: false, error: 'Cannot refer yourself' }
        }

        // 3. Check if already referred
        const { data: existingReferral } = await supabase
            .from('referrals')
            .select('*')
            .eq('referred_doctor_id', newDoctorId)
            .single()

        if (existingReferral) {
            return { success: false, error: 'Doctor already referred' }
        }

        // 4. Record the referral
        const { data: referral, error: referralError } = await supabase
            .from('referrals')
            .insert({
                referrer_doctor_id: codeData.doctor_id,
                referred_doctor_id: newDoctorId,
                referral_code: referralCode,
                status: 'pending',
                created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (referralError) {
            throw new Error(`Failed to record referral: ${referralError.message}`)
        }

        // 5. Get referrer's total referrals for reward calculation
        const { count: referralCount } = await supabase
            .from('referrals')
            .select('*', { count: 'exact' })
            .eq('referrer_doctor_id', codeData.doctor_id)
            .eq('status', 'converted')

        const totalReferrals = (referralCount || 0) + 1

        // 6. Determine reward
        let reward: ReferralReward | undefined
        if (REFERRAL_REWARDS[totalReferrals]) {
            reward = REFERRAL_REWARDS[totalReferrals]
        } else if (totalReferrals >= 10) {
            // Every 10 referrals after milestone
            reward = { type: 'free_month', value: 1, description: '1 mes gratis' }
        }

        logger.info('Referral processed:', {
            referrerId: codeData.doctor_id,
            referredId: newDoctorId,
            totalReferrals,
            reward,
        })

        return { success: true, reward }

    } catch (error) {
        logger.error('Error processing referral:', { error, referralCode, newDoctorId })
        return { success: false, error: 'Failed to process referral' }
    }
}

/**
 * Convert a referral when the new doctor subscribes
 */
export async function convertReferral(
    doctorId: string,
    subscriptionTier: string
): Promise<{ success: boolean; reward?: ReferralReward }> {
    const supabase = await createServiceClient()

    try {
        // 1. Find pending referral for this doctor
        const { data: referral, error } = await supabase
            .from('referrals')
            .select('*')
            .eq('referred_doctor_id', doctorId)
            .eq('status', 'pending')
            .single()

        if (error || !referral) {
            return { success: false }
        }

        // 2. Update referral status
        await supabase
            .from('referrals')
            .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
                subscription_tier: subscriptionTier,
            })
            .eq('id', referral.id)

        // 3. Get referrer's total converted referrals
        const { count } = await supabase
            .from('referrals')
            .select('*', { count: 'exact' })
            .eq('referrer_doctor_id', referral.referrer_doctor_id)
            .eq('status', 'converted')

        const totalConverted = count || 0

        // 4. Determine and apply reward
        const reward = REFERRAL_REWARDS[totalConverted] || {
            type: 'free_month',
            value: 1,
            description: '1 mes gratis',
        }

        await applyReward(referral.referrer_doctor_id, reward)

        // 5. Notify referrer
        await notifyReferrerOfConversion(referral.referrer_doctor_id, totalConverted, reward)

        logger.info('Referral converted:', {
            referrerId: referral.referrer_doctor_id,
            referredId: doctorId,
            totalConverted,
            reward,
        })

        return { success: true, reward }

    } catch (error) {
        logger.error('Error converting referral:', { error, doctorId })
        return { success: false }
    }
}

/**
 * Apply reward to referrer's account
 */
async function applyReward(doctorId: string, reward: ReferralReward): Promise<void> {
    const supabase = await createServiceClient()

    if (reward.type === 'free_month') {
        // Extend subscription end date
        const { data: subscription } = await supabase
            .from('doctor_subscriptions')
            .select('current_period_end')
            .eq('doctor_id', doctorId)
            .single()

        if (subscription) {
            const currentEnd = new Date(subscription.current_period_end)
            const newEnd = new Date(currentEnd)
            newEnd.setMonth(newEnd.getMonth() + reward.value)

            await supabase
                .from('doctor_subscriptions')
                .update({
                    current_period_end: newEnd.toISOString(),
                    referral_credits_used: reward.value,
                })
                .eq('doctor_id', doctorId)
        }
    } else if (reward.type === 'upgrade') {
        // Temporarily upgrade to Pro
        await supabase
            .from('doctor_subscriptions')
            .update({
                tier: 'pro',
                is_temporary_upgrade: true,
                upgrade_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('doctor_id', doctorId)
    }

    // Record the reward
    await supabase.from('referral_rewards').insert({
        doctor_id: doctorId,
        reward_type: reward.type,
        reward_value: reward.value,
        description: reward.description,
        created_at: new Date().toISOString(),
    })
}

/**
 * Notify referrer that their referral converted
 */
async function notifyReferrerOfConversion(
    doctorId: string,
    totalReferrals: number,
    reward: ReferralReward
): Promise<void> {
    const supabase = await createServiceClient()

    const { data: doctor } = await supabase
        .from('doctors')
        .select('id, profiles(full_name, phone)')
        .eq('id', doctorId)
        .single()

    if (!doctor) return

    const profile = Array.isArray(doctor.profiles) ? doctor.profiles[0] : doctor.profiles
    const phone = profile?.phone

    if (phone) {
        await sendWhatsAppMessage(
            phone,
            `🎉 ¡Felicidades! Un colega se unió usando tu código de referido. ` +
            `Has referido a ${totalReferrals} médicos. ` +
            `Ganaste: ${reward.description}. ` +
            `Sigue compartiendo tu código para más beneficios.`
        )
    }
}

/**
 * Get referral stats for a doctor
 */
export async function getReferralStats(doctorId: string): Promise<{
    code: string
    url: string
    totalReferrals: number
    converted: number
    pending: number
    nextReward: ReferralReward | null
    totalRewards: ReferralReward[]
}> {
    const supabase = await createServiceClient()

    // Get code
    const { data: codeData } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('doctor_id', doctorId)
        .single()

    // Get stats
    const { data: referrals } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_doctor_id', doctorId)

    const converted = referrals?.filter(r => r.status === 'converted').length || 0
    const pending = referrals?.filter(r => r.status === 'pending').length || 0

    // Get rewards
    const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('doctor_id', doctorId)

    // Determine next reward
    const nextMilestone = Object.keys(REFERRAL_REWARDS)
        .map(Number)
        .sort((a, b) => a - b)
        .find(m => m > converted)

    const nextReward = nextMilestone ? REFERRAL_REWARDS[nextMilestone] : null

    return {
        code: codeData?.code || '',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${codeData?.code || ''}`,
        totalReferrals: referrals?.length || 0,
        converted,
        pending,
        nextReward,
        totalRewards: rewards || [],
    }
}
