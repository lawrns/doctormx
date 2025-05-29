import { supabase } from '../lib/supabaseClient';

// Subscription tier definitions from the comprehensive analysis
export interface SubscriptionTier {
  id: 'free' | 'premium' | 'family';
  name: string;
  price_mxn: number;
  consultations_per_month: number | 'unlimited';
  ai_models: string[];
  features: string[];
  storage_limit_mb: number;
  family_members?: number;
  priority_support?: boolean;
  family_dashboard?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price_mxn: 0,
    consultations_per_month: 5,
    ai_models: ['gpt-3.5-turbo'],
    features: [
      'basic_ai',
      'dr_simeon',
      'symptom_analysis',
      'mexican_medical_knowledge'
    ],
    storage_limit_mb: 10
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price_mxn: 299,
    consultations_per_month: 'unlimited',
    ai_models: ['gpt-4-turbo', 'claude-3-opus'],
    features: [
      'advanced_ai_analysis',
      'video_consultations',
      'lab_test_integration',
      'doctor_referrals',
      'prescription_management',
      'medical_history_storage',
      'priority_support'
    ],
    storage_limit_mb: 100,
    family_members: 1,
    priority_support: true
  },
  family: {
    id: 'family',
    name: 'Familiar',
    price_mxn: 499,
    consultations_per_month: 'unlimited',
    ai_models: ['gpt-4-turbo', 'claude-3-opus', 'medical-specialist-models'],
    features: [
      'all_premium_features',
      'family_dashboard',
      'shared_medical_calendar',
      'family_health_insights',
      'emergency_family_contacts',
      'dedicated_family_coordinator'
    ],
    storage_limit_mb: 500,
    family_members: 5,
    priority_support: true,
    family_dashboard: true
  }
};

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: 'free' | 'premium' | 'family';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  subscription_id?: string; // Stripe subscription ID
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  trial_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  feature_type: 'consultation' | 'video_call' | 'lab_test' | 'doctor_referral';
  usage_count: number;
  reset_date: Date;
  created_at: Date;
}

class SubscriptionService {
  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  /**
   * Get subscription tier details
   */
  getSubscriptionTier(tierName: string): SubscriptionTier {
    return SUBSCRIPTION_TIERS[tierName] || SUBSCRIPTION_TIERS.free;
  }

  /**
   * Check if user can access a specific feature
   */
  async canAccessFeature(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    const tier = this.getSubscriptionTier(subscription?.tier || 'free');
    
    return tier.features.includes(feature) || tier.features.includes('all_premium_features');
  }

  /**
   * Check consultation usage limits
   */
  async checkConsultationLimit(userId: string): Promise<{
    canConsult: boolean;
    remaining: number | 'unlimited';
    resetDate: Date;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const tier = this.getSubscriptionTier(subscription?.tier || 'free');

    if (tier.consultations_per_month === 'unlimited') {
      return {
        canConsult: true,
        remaining: 'unlimited',
        resetDate: new Date()
      };
    }

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature_type', 'consultation')
      .gte('reset_date', startOfMonth.toISOString())
      .single();

    const currentUsage = usage?.usage_count || 0;
    const remaining = Math.max(0, tier.consultations_per_month as number - currentUsage);

    const nextMonth = new Date(startOfMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      canConsult: remaining > 0,
      remaining,
      resetDate: nextMonth
    };
  }

  /**
   * Track feature usage
   */
  async trackUsage(userId: string, featureType: string): Promise<void> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: existingUsage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('feature_type', featureType)
        .gte('reset_date', startOfMonth.toISOString())
        .single();

      if (existingUsage) {
        // Update existing usage
        await supabase
          .from('usage_tracking')
          .update({ 
            usage_count: existingUsage.usage_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUsage.id);
      } else {
        // Create new usage record
        const nextMonth = new Date(startOfMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await supabase
          .from('usage_tracking')
          .insert({
            user_id: userId,
            feature_type: featureType,
            usage_count: 1,
            reset_date: nextMonth.toISOString()
          });
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  /**
   * Create Stripe checkout session for subscription upgrade
   */
  async createCheckoutSession(userId: string, tierName: string): Promise<{ sessionUrl: string }> {
    try {
      const tier = this.getSubscriptionTier(tierName);
      
      // This would integrate with Stripe API
      // For now, return a mock response
      const mockSessionUrl = `https://checkout.stripe.com/pay/${tierName}-${userId}`;
      
      return { sessionUrl: mockSessionUrl };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      await supabase
        .from('user_subscriptions')
        .update({ 
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No subscription found');
      }

      await supabase
        .from('user_subscriptions')
        .update({ 
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription analytics for user
   */
  async getSubscriptionAnalytics(userId: string): Promise<{
    currentTier: SubscriptionTier;
    usage: UsageTracking[];
    savings: number;
    nextBillingDate?: Date;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const tier = this.getSubscriptionTier(subscription?.tier || 'free');

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate savings compared to individual consultations
    const totalConsultations = usage?.reduce((sum, u) => 
      u.feature_type === 'consultation' ? sum + u.usage_count : sum, 0) || 0;
    const savingsPerConsultation = 150; // Average cost per consultation in MXN
    const savings = Math.max(0, (totalConsultations * savingsPerConsultation) - tier.price_mxn);

    return {
      currentTier: tier,
      usage: usage || [],
      savings,
      nextBillingDate: subscription?.current_period_end
    };
  }

  /**
   * Handle anonymous to authenticated user transition
   * Merges anonymous consultation history and grants bonus consultations
   */
  async handleAnonymousToAuthenticatedTransition(userId: string, anonymousConsultations: number): Promise<void> {
    try {
      // Grant bonus consultations for creating an account
      const SIGNUP_BONUS_CONSULTATIONS = 5;
      
      // Check if user already has a subscription
      const currentSubscription = await this.getCurrentSubscription(userId);
      
      if (!currentSubscription) {
        // Create free tier subscription
        await this.createSubscription(userId, 'free');
      }
      
      // Add bonus consultations to their current month's usage
      // Instead of tracking used consultations, we'll add bonus to their limit
      const { data: bonusData, error: bonusError } = await supabase
        .from('subscription_bonuses')
        .insert({
          user_id: userId,
          bonus_type: 'signup',
          bonus_consultations: SIGNUP_BONUS_CONSULTATIONS,
          anonymous_consultations_merged: anonymousConsultations,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
      
      if (bonusError) {
        console.error('Error granting signup bonus:', bonusError);
        // Don't throw - we still want the user to be able to sign up
      }
      
      // Log the transition for analytics
      await supabase
        .from('user_events')
        .insert({
          user_id: userId,
          event_type: 'anonymous_to_authenticated',
          event_data: {
            anonymous_consultations: anonymousConsultations,
            bonus_granted: SIGNUP_BONUS_CONSULTATIONS
          },
          created_at: new Date().toISOString()
        });
      
    } catch (error) {
      console.error('Error handling anonymous to authenticated transition:', error);
      // Don't throw - we don't want to block the signup process
    }
  }

  /**
   * Send subscription notification
   */
  async sendSubscriptionNotification(userId: string, type: 'trial_ending' | 'payment_failed' | 'upgrade_available'): Promise<void> {
    try {
      // This would integrate with email service
      console.log(`Sending ${type} notification to user ${userId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService; 