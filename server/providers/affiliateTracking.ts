import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key must be provided in .env');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export interface AffiliateTrackingEvent {
  affiliate_id: string;
  event_type: 'click' | 'signup' | 'consultation' | 'payment' | 'referral';
  event_data?: Record<string, any>;
  user_ip?: string;
  user_agent?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  conversion_value?: number;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  referral_id?: string;
  commission_type: 'signup' | 'consultation' | 'subscription' | 'recurring';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliatePerformance {
  id: string;
  affiliate_id: string;
  date: string;
  clicks: number;
  signups: number;
  consultations: number;
  payments: number;
  revenue: number;
  commissions: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingMaterial {
  id: string;
  affiliate_id: string;
  material_type: 'banner' | 'social_post' | 'email_template' | 'landing_page';
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  utm_parameters?: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Track an affiliate event
 */
export async function trackAffiliateEvent(event: AffiliateTrackingEvent): Promise<string> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient.rpc('track_affiliate_event', {
      p_affiliate_id: event.affiliate_id,
      p_event_type: event.event_type,
      p_event_data: event.event_data || {},
      p_user_ip: event.user_ip,
      p_user_agent: event.user_agent,
      p_referrer_url: event.referrer_url,
      p_utm_source: event.utm_source,
      p_utm_medium: event.utm_medium,
      p_utm_campaign: event.utm_campaign,
      p_utm_term: event.utm_term,
      p_utm_content: event.utm_content,
      p_conversion_value: event.conversion_value || 0
    });

    if (error) {
      console.error('Error tracking affiliate event:', error);
      throw new Error('Error al registrar evento de afiliado');
    }

    return data;
  } catch (error) {
    console.error('Error in trackAffiliateEvent:', error);
    throw error;
  }
}

/**
 * Get affiliate performance data
 */
export async function getAffiliatePerformance(
  affiliateId: string,
  startDate?: string,
  endDate?: string
): Promise<AffiliatePerformance[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    let query = supabaseClient
      .from('affiliate_performance')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting affiliate performance:', error);
      throw new Error('Error al obtener rendimiento del afiliado');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAffiliatePerformance:', error);
    throw error;
  }
}

/**
 * Get affiliate commissions
 */
export async function getAffiliateCommissions(
  affiliateId: string,
  status?: string
): Promise<AffiliateCommission[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    let query = supabaseClient
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting affiliate commissions:', error);
      throw new Error('Error al obtener comisiones del afiliado');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAffiliateCommissions:', error);
    throw error;
  }
}

/**
 * Get affiliate marketing materials
 */
export async function getAffiliateMarketingMaterials(affiliateId: string): Promise<MarketingMaterial[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('affiliate_marketing_materials')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting marketing materials:', error);
      throw new Error('Error al obtener materiales de marketing');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAffiliateMarketingMaterials:', error);
    throw error;
  }
}

/**
 * Create affiliate commission
 */
export async function createAffiliateCommission(
  affiliateId: string,
  referralId: string,
  commissionType: string,
  amount: number
): Promise<string> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient.rpc('calculate_affiliate_commission', {
      p_affiliate_id: affiliateId,
      p_referral_id: referralId,
      p_commission_type: commissionType,
      p_amount: amount
    });

    if (error) {
      console.error('Error creating affiliate commission:', error);
      throw new Error('Error al crear comisión de afiliado');
    }

    return data;
  } catch (error) {
    console.error('Error in createAffiliateCommission:', error);
    throw error;
  }
}

/**
 * Update affiliate performance
 */
export async function updateAffiliatePerformance(affiliateId: string, date: string): Promise<void> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { error } = await supabaseClient.rpc('update_affiliate_performance', {
      p_affiliate_id: affiliateId,
      p_date: date
    });

    if (error) {
      console.error('Error updating affiliate performance:', error);
      throw new Error('Error al actualizar rendimiento del afiliado');
    }
  } catch (error) {
    console.error('Error in updateAffiliatePerformance:', error);
    throw error;
  }
}

/**
 * Get affiliate analytics summary
 */
export async function getAffiliateAnalytics(affiliateId: string): Promise<{
  total_clicks: number;
  total_signups: number;
  total_consultations: number;
  total_payments: number;
  total_revenue: number;
  total_commissions: number;
  conversion_rate: number;
  top_utm_sources: Array<{ source: string; count: number }>;
  recent_events: Array<{ event_type: string; count: number; date: string }>;
}> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get total metrics
    const { data: performanceData, error: performanceError } = await supabaseClient
      .from('affiliate_performance')
      .select('clicks, signups, consultations, payments, revenue, commissions')
      .eq('affiliate_id', affiliateId);

    if (performanceError) {
      console.error('Error getting performance data:', performanceError);
      throw new Error('Error al obtener datos de rendimiento');
    }

    // Calculate totals
    const totals = performanceData?.reduce((acc, row) => ({
      total_clicks: acc.total_clicks + (row.clicks || 0),
      total_signups: acc.total_signups + (row.signups || 0),
      total_consultations: acc.total_consultations + (row.consultations || 0),
      total_payments: acc.total_payments + (row.payments || 0),
      total_revenue: acc.total_revenue + (row.revenue || 0),
      total_commissions: acc.total_commissions + (row.commissions || 0)
    }), {
      total_clicks: 0,
      total_signups: 0,
      total_consultations: 0,
      total_payments: 0,
      total_revenue: 0,
      total_commissions: 0
    });

    // Get top UTM sources
    const { data: utmData, error: utmError } = await supabaseClient
      .from('affiliate_tracking')
      .select('utm_source')
      .eq('affiliate_id', affiliateId)
      .not('utm_source', 'is', null);

    if (utmError) {
      console.error('Error getting UTM data:', utmError);
    }

    const utmCounts = (utmData || []).reduce((acc, row) => {
      const source = row.utm_source || 'direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const top_utm_sources = Object.entries(utmCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent events
    const { data: eventsData, error: eventsError } = await supabaseClient
      .from('affiliate_tracking')
      .select('event_type, created_at')
      .eq('affiliate_id', affiliateId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error getting events data:', eventsError);
    }

    const recent_events = (eventsData || []).reduce((acc, row) => {
      const date = row.created_at.split('T')[0];
      const key = `${row.event_type}_${date}`;
      if (!acc[key]) {
        acc[key] = { event_type: row.event_type, count: 0, date };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);

    const recent_events_array = Object.values(recent_events)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const conversion_rate = totals.total_clicks > 0 
      ? (totals.total_signups / totals.total_clicks) * 100 
      : 0;

    return {
      ...totals,
      conversion_rate,
      top_utm_sources,
      recent_events: recent_events_array
    };
  } catch (error) {
    console.error('Error in getAffiliateAnalytics:', error);
    throw error;
  }
}

/**
 * Generate affiliate referral link
 */
export async function generateAffiliateLink(
  affiliateId: string,
  baseUrl: string,
  utmSource: string,
  utmMedium: string = 'affiliate',
  utmCampaign?: string
): Promise<string> {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) {
      url.searchParams.set('utm_campaign', utmCampaign);
    }
    url.searchParams.set('affiliate_id', affiliateId);
    
    return url.toString();
  } catch (error) {
    console.error('Error generating affiliate link:', error);
    throw new Error('Error al generar enlace de afiliado');
  }
}

/**
 * Track affiliate click
 */
export async function trackAffiliateClick(
  affiliateId: string,
  userIp: string,
  userAgent: string,
  referrerUrl?: string,
  utmParams?: Record<string, string>
): Promise<void> {
  try {
    await trackAffiliateEvent({
      affiliate_id: affiliateId,
      event_type: 'click',
      user_ip: userIp,
      user_agent: userAgent,
      referrer_url: referrerUrl,
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      utm_term: utmParams?.utm_term,
      utm_content: utmParams?.utm_content
    });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    // Don't throw error for tracking failures
  }
}

/**
 * Track affiliate conversion
 */
export async function trackAffiliateConversion(
  affiliateId: string,
  eventType: 'signup' | 'consultation' | 'payment',
  conversionValue: number,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    await trackAffiliateEvent({
      affiliate_id: affiliateId,
      event_type: eventType,
      conversion_value: conversionValue,
      event_data: eventData
    });

    // Update performance data
    await updateAffiliatePerformance(affiliateId, new Date().toISOString().split('T')[0]);
  } catch (error) {
    console.error('Error tracking affiliate conversion:', error);
    // Don't throw error for tracking failures
  }
}
