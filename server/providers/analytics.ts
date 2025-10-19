import { supabaseAdmin } from '../lib/supabase.js';

export interface OnboardingEvent {
  id: string;
  doctor_id: string;
  email: string;
  event_name: string;
  event_data: any;
  session_id: string;
  user_agent: string;
  ip_address: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  created_at: string;
}

export interface OnboardingSession {
  id: string;
  doctor_id: string;
  session_id: string;
  started_at: string;
  completed_at?: string;
  current_stage: string;
  total_time_minutes?: number;
  abandonment_reason?: string;
  conversion_source: string;
  utm_data: any;
  device_type: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingConversion {
  id: string;
  doctor_id: string;
  conversion_type: string;
  conversion_date: string;
  time_to_convert_minutes?: number;
  conversion_source: string;
  conversion_value?: number;
  metadata: any;
  created_at: string;
}

export interface FunnelMetrics {
  stage_name: string;
  stage_order: number;
  total_events: number;
  unique_doctors: number;
  conversion_rate: number;
  dropoff_rate: number;
  avg_time_minutes: number;
}

export interface AcquisitionStats {
  date: string;
  new_signups: number;
  completed_onboarding: number;
  active_subscriptions: number;
  first_consultations: number;
  conversion_rate: number;
}

export interface DropoffPoint {
  stage_name: string;
  stage_order: number;
  dropoff_count: number;
  dropoff_rate: number;
  common_reasons: string[];
}

// Track onboarding event
export async function trackOnboardingEvent(
  doctorId: string,
  email: string,
  eventName: string,
  eventData?: any,
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string,
  referrer?: string,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string,
  utmTerm?: string,
  utmContent?: string
): Promise<string> {
  try {
    console.log('📊 Tracking onboarding event:', { doctorId, eventName });

    const { data, error } = await supabaseAdmin
      .rpc('track_onboarding_event', {
        p_doctor_id: doctorId,
        p_email: email,
        p_event_name: eventName,
        p_event_data: eventData,
        p_session_id: sessionId,
        p_user_agent: userAgent,
        p_ip_address: ipAddress,
        p_referrer: referrer,
        p_utm_source: utmSource,
        p_utm_medium: utmMedium,
        p_utm_campaign: utmCampaign,
        p_utm_term: utmTerm,
        p_utm_content: utmContent
      });

    if (error) throw error;

    console.log('✅ Onboarding event tracked:', data);

    return data;

  } catch (error) {
    console.error('Error tracking onboarding event:', error);
    throw error;
  }
}

// Get onboarding funnel metrics
export async function getOnboardingFunnelMetrics(
  startDate?: string,
  endDate?: string
): Promise<FunnelMetrics[]> {
  try {
    console.log('📊 Getting onboarding funnel metrics');

    const { data, error } = await supabaseAdmin
      .rpc('get_onboarding_funnel_metrics', {
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('Error getting onboarding funnel metrics:', error);
    return [];
  }
}

// Get doctor acquisition stats
export async function getDoctorAcquisitionStats(
  startDate?: string,
  endDate?: string
): Promise<AcquisitionStats[]> {
  try {
    console.log('📊 Getting doctor acquisition stats');

    const { data, error } = await supabaseAdmin
      .rpc('get_doctor_acquisition_stats', {
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('Error getting doctor acquisition stats:', error);
    return [];
  }
}

// Identify dropoff points
export async function identifyDropoffPoints(
  startDate?: string,
  endDate?: string
): Promise<DropoffPoint[]> {
  try {
    console.log('📊 Identifying dropoff points');

    const { data, error } = await supabaseAdmin
      .rpc('identify_dropoff_points', {
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('Error identifying dropoff points:', error);
    return [];
  }
}

// Get onboarding events for a specific doctor
export async function getDoctorOnboardingEvents(
  doctorId: string,
  limit: number = 50
): Promise<OnboardingEvent[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_onboarding_events')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('Error getting doctor onboarding events:', error);
    return [];
  }
}

// Get onboarding session details
export async function getOnboardingSession(
  sessionId: string
): Promise<OnboardingSession | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Session not found
      }
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error getting onboarding session:', error);
    return null;
  }
}

// Record conversion
export async function recordConversion(
  doctorId: string,
  conversionType: string,
  conversionSource: string,
  conversionValue?: number,
  timeToConvertMinutes?: number,
  metadata?: any
): Promise<OnboardingConversion> {
  try {
    console.log('📊 Recording conversion:', { doctorId, conversionType });

    const { data, error } = await supabaseAdmin
      .from('onboarding_conversions')
      .insert({
        doctor_id: doctorId,
        conversion_type: conversionType,
        conversion_source: conversionSource,
        conversion_value: conversionValue,
        time_to_convert_minutes: timeToConvertMinutes,
        metadata: metadata
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Conversion recorded:', data.id);

    return data;

  } catch (error) {
    console.error('Error recording conversion:', error);
    throw error;
  }
}

// Get conversion statistics
export async function getConversionStatistics(
  startDate?: string,
  endDate?: string
): Promise<{
  totalConversions: number;
  conversionRate: number;
  averageTimeToConvert: number;
  topConversionSources: Array<{ source: string; count: number; rate: number }>;
  conversionValue: number;
}> {
  try {
    // Get total conversions
    const { count: totalConversions, error: totalError } = await supabaseAdmin
      .from('onboarding_conversions')
      .select('*', { count: 'exact', head: true })
      .gte('conversion_date', startDate || '2024-01-01')
      .lte('conversion_date', endDate || new Date().toISOString());

    if (totalError) throw totalError;

    // Get conversion sources
    const { data: conversions, error: conversionsError } = await supabaseAdmin
      .from('onboarding_conversions')
      .select('conversion_source, conversion_value, time_to_convert_minutes')
      .gte('conversion_date', startDate || '2024-01-01')
      .lte('conversion_date', endDate || new Date().toISOString());

    if (conversionsError) throw conversionsError;

    // Get total signups for conversion rate calculation
    const { count: totalSignups, error: signupsError } = await supabaseAdmin
      .from('doctor_onboarding_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'signup_completed')
      .gte('created_at', startDate || '2024-01-01')
      .lte('created_at', endDate || new Date().toISOString());

    if (signupsError) throw signupsError;

    // Calculate conversion rate
    const conversionRate = totalSignups > 0 ? (totalConversions / totalSignups) * 100 : 0;

    // Calculate average time to convert
    const avgTimeToConvert = conversions.length > 0 
      ? conversions.reduce((sum, c) => sum + (c.time_to_convert_minutes || 0), 0) / conversions.length
      : 0;

    // Calculate total conversion value
    const conversionValue = conversions.reduce((sum, c) => sum + (c.conversion_value || 0), 0);

    // Get top conversion sources
    const sourceCounts = conversions.reduce((acc, c) => {
      acc[c.conversion_source] = (acc[c.conversion_source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topConversionSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        rate: (count / totalConversions) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalConversions: totalConversions || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTimeToConvert: Math.round(avgTimeToConvert * 100) / 100,
      topConversionSources,
      conversionValue
    };

  } catch (error) {
    console.error('Error getting conversion statistics:', error);
    return {
      totalConversions: 0,
      conversionRate: 0,
      averageTimeToConvert: 0,
      topConversionSources: [],
      conversionValue: 0
    };
  }
}

// Get real-time onboarding metrics
export async function getRealTimeOnboardingMetrics(): Promise<{
  activeSessions: number;
  todaySignups: number;
  todayConversions: number;
  averageSessionTime: number;
  topDropoffStage: string;
  conversionRate: number;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Get active sessions (started today, not completed)
    const { count: activeSessions, error: activeError } = await supabaseAdmin
      .from('onboarding_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', today)
      .is('completed_at', null);

    if (activeError) throw activeError;

    // Get today's signups
    const { count: todaySignups, error: signupsError } = await supabaseAdmin
      .from('doctor_onboarding_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'signup_completed')
      .gte('created_at', today);

    if (signupsError) throw signupsError;

    // Get today's conversions
    const { count: todayConversions, error: conversionsError } = await supabaseAdmin
      .from('onboarding_conversions')
      .select('*', { count: 'exact', head: true })
      .gte('conversion_date', today);

    if (conversionsError) throw conversionsError;

    // Get average session time
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('onboarding_sessions')
      .select('total_time_minutes')
      .not('total_time_minutes', 'is', null)
      .gte('started_at', today);

    if (sessionsError) throw sessionsError;

    const averageSessionTime = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.total_time_minutes || 0), 0) / sessions.length
      : 0;

    // Get top dropoff stage
    const dropoffPoints = await identifyDropoffPoints(today, now);
    const topDropoffStage = dropoffPoints.length > 0 ? dropoffPoints[0].stage_name : 'N/A';

    // Calculate conversion rate
    const conversionRate = todaySignups > 0 ? (todayConversions / todaySignups) * 100 : 0;

    return {
      activeSessions: activeSessions || 0,
      todaySignups: todaySignups || 0,
      todayConversions: todayConversions || 0,
      averageSessionTime: Math.round(averageSessionTime * 100) / 100,
      topDropoffStage,
      conversionRate: Math.round(conversionRate * 100) / 100
    };

  } catch (error) {
    console.error('Error getting real-time onboarding metrics:', error);
    return {
      activeSessions: 0,
      todaySignups: 0,
      todayConversions: 0,
      averageSessionTime: 0,
      topDropoffStage: 'N/A',
      conversionRate: 0
    };
  }
}

// Export analytics data
export async function exportOnboardingAnalytics(
  startDate: string,
  endDate: string,
  format: 'csv' | 'json' = 'json'
): Promise<string> {
  try {
    console.log('📊 Exporting onboarding analytics');

    const [events, sessions, conversions] = await Promise.all([
      supabaseAdmin
        .from('doctor_onboarding_events')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabaseAdmin
        .from('onboarding_sessions')
        .select('*')
        .gte('started_at', startDate)
        .lte('started_at', endDate),
      supabaseAdmin
        .from('onboarding_conversions')
        .select('*')
        .gte('conversion_date', startDate)
        .lte('conversion_date', endDate)
    ]);

    const exportData = {
      events: events.data || [],
      sessions: sessions.data || [],
      conversions: conversions.data || [],
      exported_at: new Date().toISOString(),
      date_range: { startDate, endDate }
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csv = `event_name,doctor_id,email,created_at\n${
        exportData.events.map(e => `${e.event_name},${e.doctor_id},${e.email},${e.created_at}`).join('\n')
      }`;
      return csv;
    }

    return JSON.stringify(exportData, null, 2);

  } catch (error) {
    console.error('Error exporting onboarding analytics:', error);
    throw error;
  }
}
