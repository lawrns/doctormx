import { supabase } from '../lib/supabase.js';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    consultations: number;
    visionAnalysis: number;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    customPersonalities: boolean;
    premiumContent: boolean;
  };
  popular?: boolean;
  color: string;
  icon: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  usage: {
    consultations: number;
    visionAnalysis: number;
    lastReset: string;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfecto para empezar tu viaje de salud',
    price: 0,
    currency: 'MXN',
    interval: 'monthly',
    features: [
      '3 consultas AI por mes',
      '1 análisis de imagen por mes',
      'Acceso a Dr. María y Dr. Carlos',
      'Logros y puntos básicos',
      'Soporte por email'
    ],
    limits: {
      consultations: 3,
      visionAnalysis: 1,
      prioritySupport: false,
      advancedAnalytics: false,
      customPersonalities: false,
      premiumContent: false
    },
    color: 'from-gray-500 to-gray-600',
    icon: '🆓'
  },
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para usuarios que buscan más consultas',
    price: 199,
    currency: 'MXN',
    interval: 'monthly',
    features: [
      '15 consultas AI por mes',
      '5 análisis de imagen por mes',
      'Acceso a todas las personalidades',
      'Trivia médica ilimitada',
      'Soporte prioritario',
      'Análisis avanzados'
    ],
    limits: {
      consultations: 15,
      visionAnalysis: 5,
      prioritySupport: true,
      advancedAnalytics: true,
      customPersonalities: false,
      premiumContent: false
    },
    color: 'from-blue-500 to-blue-600',
    icon: '💙'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'La opción más popular para usuarios activos',
    price: 399,
    currency: 'MXN',
    interval: 'monthly',
    features: [
      'Consultas AI ilimitadas',
      'Análisis de imagen ilimitados',
      'Personalidades personalizadas',
      'Contenido premium exclusivo',
      'Soporte prioritario 24/7',
      'Análisis avanzados y reportes',
      'Acceso anticipado a nuevas funciones'
    ],
    limits: {
      consultations: -1, // -1 means unlimited
      visionAnalysis: -1,
      prioritySupport: true,
      advancedAnalytics: true,
      customPersonalities: true,
      premiumContent: true
    },
    popular: true,
    color: 'from-medical-500 to-medical-600',
    icon: '⭐'
  },
  {
    id: 'family',
    name: 'Familiar',
    description: 'Perfecto para familias que cuidan su salud juntas',
    price: 699,
    currency: 'MXN',
    interval: 'monthly',
    features: [
      'Consultas AI ilimitadas para 4 usuarios',
      'Análisis de imagen ilimitados',
      'Perfiles familiares separados',
      'Monitoreo de salud familiar',
      'Recordatorios personalizados',
      'Soporte prioritario familiar',
      'Descuentos en farmacias afiliadas'
    ],
    limits: {
      consultations: -1,
      visionAnalysis: -1,
      prioritySupport: true,
      advancedAnalytics: true,
      customPersonalities: true,
      premiumContent: true
    },
    color: 'from-green-500 to-green-600',
    icon: '👨‍👩‍👧‍👦'
  }
];

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethod: string,
  autoRenew: boolean = true
): Promise<UserSubscription> {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: autoRenew,
        payment_method: paymentMethod,
        usage: {
          consultations: 0,
          visionAnalysis: 0,
          lastReset: startDate.toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscriptionUsage(
  userId: string,
  type: 'consultation' | 'visionAnalysis'
): Promise<UserSubscription | null> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return null;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if usage needs to be reset (monthly)
    const lastReset = new Date(subscription.usage.lastReset);
    const now = new Date();
    const needsReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

    let newUsage = { ...subscription.usage };
    
    if (needsReset) {
      newUsage.consultations = 0;
      newUsage.visionAnalysis = 0;
      newUsage.lastReset = now.toISOString();
    }

    // Increment usage
    if (type === 'consultation') {
      newUsage.consultations += 1;
    } else if (type === 'visionAnalysis') {
      newUsage.visionAnalysis += 1;
    }

    // Check limits
    const limitExceeded = 
      (type === 'consultation' && plan.limits.consultations !== -1 && newUsage.consultations > plan.limits.consultations) ||
      (type === 'visionAnalysis' && plan.limits.visionAnalysis !== -1 && newUsage.visionAnalysis > plan.limits.visionAnalysis);

    if (limitExceeded) {
      throw new Error('Usage limit exceeded');
    }

    // Update subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ usage: newUsage })
      .eq('id', subscription.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating subscription usage:', error);
    throw error;
  }
}

export async function checkSubscriptionLimit(
  userId: string,
  type: 'consultation' | 'visionAnalysis'
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      // Free plan limits
      return {
        allowed: true,
        remaining: 3,
        limit: 3
      };
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const limit = type === 'consultation' ? plan.limits.consultations : plan.limits.visionAnalysis;
    const currentUsage = type === 'consultation' ? subscription.usage.consultations : subscription.usage.visionAnalysis;

    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1
      };
    }

    const remaining = Math.max(0, limit - currentUsage);
    const allowed = remaining > 0;

    return { allowed, remaining, limit };
  } catch (error) {
    console.error('Error checking subscription limit:', error);
    throw error;
  }
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'cancelled',
        auto_renew: false
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

export async function getSubscriptionUsage(userId: string): Promise<any> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return {
        plan: 'free',
        usage: { consultations: 0, visionAnalysis: 0 },
        limits: { consultations: 3, visionAnalysis: 1 }
      };
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    return {
      plan: plan.id,
      usage: subscription.usage,
      limits: plan.limits,
      endDate: subscription.endDate,
      autoRenew: subscription.autoRenew
    };
  } catch (error) {
    console.error('Error getting subscription usage:', error);
    throw error;
  }
}

export async function startTrial(userId: string, planId: string): Promise<UserSubscription> {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7-day trial

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'trial',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
        payment_method: 'trial',
        usage: {
          consultations: 0,
          visionAnalysis: 0,
          lastReset: startDate.toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error starting trial:', error);
    throw error;
  }
}

export async function upgradeSubscription(
  userId: string,
  newPlanId: string,
  paymentMethod: string
): Promise<UserSubscription> {
  try {
    // Cancel current subscription
    await cancelSubscription(userId);

    // Create new subscription
    const newSubscription = await createSubscription(userId, newPlanId, paymentMethod);

    return newSubscription;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
}

export function getAllPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS;
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(p => p.id === planId);
}

export function calculateSavings(planId: string): number {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) return 0;

  // Calculate savings compared to pay-per-use
  const payPerUseCost = 79; // Cost per consultation
  const monthlyConsultations = plan.limits.consultations === -1 ? 20 : plan.limits.consultations;
  
  if (plan.limits.consultations === -1) {
    return 0; // Unlimited plans don't have savings calculation
  }

  const payPerUseTotal = monthlyConsultations * payPerUseCost;
  const savings = payPerUseTotal - plan.price;
  
  return Math.max(0, savings);
}
