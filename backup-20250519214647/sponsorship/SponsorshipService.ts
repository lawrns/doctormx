import { supabase } from '../../lib/supabase';
import type { SponsorshipPlan, SponsorshipStats } from './types';

class SponsorshipService {
  async getPlans(): Promise<SponsorshipPlan[]> {
    const { data, error } = await supabase
      .from('sponsorship_plans')
      .select<SponsorshipPlan>('id, name, description, benefits, price');
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async optIn(planId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('sponsorship_opt_ins')
      .insert({ plan_id: planId, user_id: userId, created_at: now });
    if (error) {
      throw error;
    }
  }

  async getStats(planId: string): Promise<SponsorshipStats> {
    const { count, error: countError } = await supabase
      .from('sponsorship_opt_ins')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId);
    if (countError) {
      throw countError;
    }
    const totalSponsored = count ?? 0;
    const { data: plan, error: planError } = await supabase
      .from('sponsorship_plans')
      .select<{ price: number }>('price')
      .eq('id', planId)
      .single();
    if (planError || !plan) {
      throw planError || new Error('Sponsorship plan not found');
    }
    const totalRevenue = totalSponsored * plan.price;
    return { totalSponsored, totalRevenue };
  }
}

export default new SponsorshipService();