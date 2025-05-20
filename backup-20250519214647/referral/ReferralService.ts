import { supabase } from '../../lib/supabase';
import type { Referral, ReferralStats } from './types';

class ReferralService {
  /**
   * Creates a new referral link for the given referrer (doctor) ID.
   * Generates a unique code, inserts it into referral_links, and returns the new Referral.
   * Optionally accepts a name to label the referral link.
   */
  async createReferral(referrerId: string, name?: string): Promise<Referral> {
    const generateCode = (length = 6) =>
      Math.random().toString(36).substring(2, 2 + length).toUpperCase();

    let lastError;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const { data, error } = await supabase
        .from('referral_links')
        .insert({ doctor_id: referrerId, code, name: name ?? null })
        .select('id, code, name, created_at, usage_count, last_used_at, doctor_id')
        .single();
      if (error) {
        lastError = error;
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
          continue;
        }
        throw error;
      }
      return {
        id: data.id,
        code: data.code,
        name: data.name,
        createdAt: data.created_at,
        usageCount: data.usage_count,
        lastUsedAt: data.last_used_at,
        referrerId: data.doctor_id,
      };
    }
    throw lastError;
  }

  /**
   * Fetches aggregated stats for a referral link identified by its code:
   * - totalGenerated: usage_count from referral_links (e.g. number of link visits)
   * - totalUsed: total number of conversions recorded in referral_conversions
   */
  async getReferralStats(referralCode: string): Promise<ReferralStats> {
    const { data: link, error: linkError } = await supabase
      .from('referral_links')
      .select('id, usage_count')
      .eq('code', referralCode)
      .single();
    if (linkError || !link) {
      throw linkError || new Error('Referral link not found');
    }
    const totalGenerated = link.usage_count;
    const { count: totalUsed, error: convError } = await supabase
      .from('referral_conversions')
      .select('*', { count: 'exact', head: true })
      .eq('referral_link_id', link.id);
    if (convError) {
      throw convError;
    }
    return { totalGenerated, totalUsed: totalUsed ?? 0 };
  }
  /**
   * Records a new conversion (e.g. signup) for the given referral link ID,
   * inserting a conversion record and incrementing the link's usage count and last_used_at.
   */
  async recordReferralConversion(referralId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error: convError } = await supabase
      .from('referral_conversions')
      .insert({ referral_link_id: referralId, created_at: now });
    if (convError) {
      throw convError;
    }
    const { error: updateError } = await supabase
      .from('referral_links')
      .update({
        usage_count: supabase.rpc('increment', { row_id: referralId, increment_amount: 1 }),
        last_used_at: now,
      })
      .eq('id', referralId);
    if (updateError) {
      throw updateError;
    }
  }
}

export default new ReferralService();