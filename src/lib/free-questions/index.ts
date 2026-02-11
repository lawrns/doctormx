/**
 * Free Questions Quota System for Doctor.mx
 * Manages user's free question limits per month
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

export interface FreeQuestionsQuota {
  user_id: string;
  questions_used: number;
  questions_limit: number;
  last_reset_date: string;
  remaining: number;
  next_reset: string;
  is_eligible: boolean;
}

export interface QuotaCheckResult {
  canAsk: boolean;
  remaining: number;
  limit: number;
  used: number;
  message: string;
  nextReset: string;
  isPremium: boolean;
}

const DEFAULT_FREE_LIMIT = 5;
const PREMIUM_LIMIT = -1; // Unlimited

/**
 * Get the start of the current month
 */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get the start of next month
 */
function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * Check if reset is needed (new month)
 */
function needsReset(lastResetDate: string): boolean {
  const lastReset = new Date(lastResetDate);
  const monthStart = getMonthStart();
  return lastReset < monthStart;
}

/**
 * Get or create user's free questions quota
 */
export async function getUserQuota(userId: string): Promise<FreeQuestionsQuota> {
  const supabase = await createClient();
  
  // Check if user is premium
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  const isPremium = !!subscription;
  
  // Get or create quota record
  const quotaResult = await supabase
    .from('user_free_questions')
    .select('*')
    .eq('user_id', userId)
    .single();

  let quota = quotaResult.data;

  if (quotaResult.error || !quota) {
    // Create new quota record
    const { data: newQuota, error: insertError } = await supabase
      .from('user_free_questions')
      .insert({
        user_id: userId,
        questions_used: 0,
        questions_limit: isPremium ? PREMIUM_LIMIT : DEFAULT_FREE_LIMIT,
        last_reset_date: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      logger.error('Error creating free question quota', { error: (insertError as Error).message }, insertError as Error);
      // Return default quota
      return {
        user_id: userId,
        questions_used: 0,
        questions_limit: isPremium ? PREMIUM_LIMIT : DEFAULT_FREE_LIMIT,
        last_reset_date: new Date().toISOString(),
        remaining: isPremium ? -1 : DEFAULT_FREE_LIMIT,
        next_reset: getNextMonthStart().toISOString(),
        is_eligible: true,
      };
    }
    
    quota = newQuota;
  }
  
  // Check if reset is needed
  if (needsReset(quota.last_reset_date)) {
    const { data: resetQuota } = await supabase
      .from('user_free_questions')
      .update({
        questions_used: 0,
        last_reset_date: getMonthStart().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (resetQuota) {
      quota = resetQuota;
    }
  }
  
  const limit = isPremium ? PREMIUM_LIMIT : quota.questions_limit;
  const remaining = isPremium ? -1 : Math.max(0, limit - quota.questions_used);
  
  return {
    user_id: quota.user_id,
    questions_used: quota.questions_used,
    questions_limit: limit,
    last_reset_date: quota.last_reset_date,
    remaining,
    next_reset: getNextMonthStart().toISOString(),
    is_eligible: isPremium || remaining > 0,
  };
}

/**
 * Check if user can ask a free question
 */
export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  const quota = await getUserQuota(userId);
  
  // Check premium status
  const isPremium = quota.questions_limit === PREMIUM_LIMIT;
  
  if (isPremium) {
    return {
      canAsk: true,
      remaining: -1, // Unlimited
      limit: -1,
      used: quota.questions_used,
      message: 'Tienes preguntas ilimitadas como usuario premium',
      nextReset: quota.next_reset,
      isPremium: true,
    };
  }
  
  const canAsk = quota.remaining > 0;
  
  let message: string;
  if (canAsk) {
    message = `Te quedan ${quota.remaining} preguntas gratis este mes`;
  } else {
    const nextReset = new Date(quota.next_reset);
    const daysUntilReset = Math.ceil((nextReset.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    message = `Has agotado tus preguntas gratis. Se renuevan en ${daysUntilReset} días. ¡Actualiza a Premium para preguntas ilimitadas!`;
  }
  
  return {
    canAsk,
    remaining: quota.remaining,
    limit: quota.questions_limit,
    used: quota.questions_used,
    message,
    nextReset: quota.next_reset,
    isPremium: false,
  };
}

/**
 * Use a free question (decrement quota)
 */
export async function useQuestion(userId: string): Promise<{
  success: boolean;
  quota: QuotaCheckResult;
}> {
  // First check if user can ask
  const quotaCheck = await checkQuota(userId);
  
  if (!quotaCheck.canAsk && !quotaCheck.isPremium) {
    return {
      success: false,
      quota: quotaCheck,
    };
  }
  
  const supabase = await createClient();
  
  // Increment questions_used
  const { error } = await supabase
    .from('user_free_questions')
    .update({
      questions_used: quotaCheck.used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (error) {
    logger.error('Error getting or creating quota', { error: (error as Error).message }, error as Error);
    return {
      success: false,
      quota: quotaCheck,
    };
  }
  
  // Return updated quota
  const updatedQuota = await checkQuota(userId);
  
  return {
    success: true,
    quota: updatedQuota,
  };
}

/**
 * Get quota statistics for admin dashboard
 */
export async function getQuotaStats(): Promise<{
  total_users: number;
  premium_users: number;
  free_users: number;
  questions_asked_this_month: number;
  users_at_limit: number;
}> {
  const supabase = await createClient();
  
  const { data: quotas } = await supabase
    .from('user_free_questions')
    .select('*');
  
  const { count: premiumCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  
  if (!quotas) {
    return {
      total_users: 0,
      premium_users: premiumCount || 0,
      free_users: 0,
      questions_asked_this_month: 0,
      users_at_limit: 0,
    };
  }
  
  const freeUsers = quotas.filter(q => q.questions_limit !== PREMIUM_LIMIT);
  const usersAtLimit = freeUsers.filter(q => q.questions_used >= q.questions_limit);
  const totalQuestions = quotas.reduce((sum, q) => sum + q.questions_used, 0);
  
  return {
    total_users: quotas.length,
    premium_users: premiumCount || 0,
    free_users: freeUsers.length,
    questions_asked_this_month: totalQuestions,
    users_at_limit: usersAtLimit.length,
  };
}

/**
 * Reset all quotas (for testing/admin)
 */
export async function resetAllQuotas(): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('user_free_questions')
    .update({
      questions_used: 0,
      last_reset_date: getMonthStart().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Update all
}

