import { supabaseAdmin } from '../lib/supabase.js';

export interface DoctorBadge {
  id: string;
  doctor_id: string;
  badge_type: string;
  badge_level: string;
  badge_title: string;
  badge_description: string;
  badge_icon: string;
  badge_color: string;
  criteria_met: any;
  earned_at: string;
  expires_at?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BadgeCategory {
  id: string;
  category_name: string;
  category_description: string;
  category_color: string;
  category_icon: string;
  display_order: number;
}

export interface BadgeCriteria {
  id: string;
  badge_type: string;
  criteria_name: string;
  criteria_description: string;
  criteria_type: string;
  criteria_value: any;
  is_required: boolean;
  weight: number;
}

// Get doctor badges
export async function getDoctorBadges(doctorId: string): Promise<DoctorBadge[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_badges')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting doctor badges:', error);
    return [];
  }
}

// Calculate and update doctor badges
export async function calculateDoctorBadges(doctorId: string): Promise<DoctorBadge[]> {
  try {
    console.log('🏆 Calculating badges for doctor:', doctorId);

    // Call the database function to calculate badges
    const { data, error } = await supabaseAdmin
      .rpc('calculate_doctor_badges', { doctor_uuid: doctorId });

    if (error) throw error;

    // Update badges in database
    await supabaseAdmin.rpc('update_doctor_badges', { doctor_uuid: doctorId });

    // Return updated badges
    return await getDoctorBadges(doctorId);

  } catch (error) {
    console.error('Error calculating doctor badges:', error);
    return [];
  }
}

// Get all badge categories
export async function getBadgeCategories(): Promise<BadgeCategory[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('badge_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting badge categories:', error);
    return [];
  }
}

// Get badge criteria for a specific badge type
export async function getBadgeCriteria(badgeType: string): Promise<BadgeCriteria[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('badge_criteria')
      .select('*')
      .eq('badge_type', badgeType)
      .order('is_required', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting badge criteria:', error);
    return [];
  }
}

// Create a new badge for a doctor
export async function createDoctorBadge(
  doctorId: string,
  badgeType: string,
  badgeTitle: string,
  badgeDescription: string,
  badgeIcon: string,
  badgeColor: string,
  criteriaMet: any,
  expiresAt?: string
): Promise<DoctorBadge> {
  try {
    console.log('🏆 Creating badge for doctor:', doctorId, badgeType);

    const { data, error } = await supabaseAdmin
      .from('doctor_badges')
      .insert({
        doctor_id: doctorId,
        badge_type: badgeType,
        badge_title: badgeTitle,
        badge_description: badgeDescription,
        badge_icon: badgeIcon,
        badge_color: badgeColor,
        criteria_met: criteriaMet,
        expires_at: expiresAt,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    // Log badge creation
    await supabaseAdmin
      .from('badge_audit_trail')
      .insert({
        doctor_id: doctorId,
        badge_id: data.id,
        action: 'earned',
        new_values: criteriaMet,
        triggered_by: 'system'
      });

    console.log('✅ Badge created:', data.id);

    return data;

  } catch (error) {
    console.error('Error creating doctor badge:', error);
    throw error;
  }
}

// Update an existing badge
export async function updateDoctorBadge(
  badgeId: string,
  updates: Partial<DoctorBadge>
): Promise<DoctorBadge> {
  try {
    console.log('🏆 Updating badge:', badgeId);

    const { data, error } = await supabaseAdmin
      .from('doctor_badges')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', badgeId)
      .select()
      .single();

    if (error) throw error;

    // Log badge update
    await supabaseAdmin
      .from('badge_audit_trail')
      .insert({
        doctor_id: data.doctor_id,
        badge_id: badgeId,
        action: 'updated',
        new_values: updates,
        triggered_by: 'system'
      });

    console.log('✅ Badge updated:', badgeId);

    return data;

  } catch (error) {
    console.error('Error updating doctor badge:', error);
    throw error;
  }
}

// Deactivate a badge
export async function deactivateDoctorBadge(
  badgeId: string,
  reason?: string
): Promise<void> {
  try {
    console.log('🏆 Deactivating badge:', badgeId);

    const { data, error } = await supabaseAdmin
      .from('doctor_badges')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', badgeId)
      .select()
      .single();

    if (error) throw error;

    // Log badge deactivation
    await supabaseAdmin
      .from('badge_audit_trail')
      .insert({
        doctor_id: data.doctor_id,
        badge_id: badgeId,
        action: 'revoked',
        reason: reason,
        triggered_by: 'system'
      });

    console.log('✅ Badge deactivated:', badgeId);

  } catch (error) {
    console.error('Error deactivating doctor badge:', error);
    throw error;
  }
}

// Get badge statistics
export async function getBadgeStatistics(): Promise<{
  totalBadges: number;
  activeBadges: number;
  expiredBadges: number;
  topBadges: Array<{ badge_type: string; count: number; badge_title: string }>;
  recentBadges: number;
}> {
  try {
    // Get total badges
    const { count: totalBadges, error: totalError } = await supabaseAdmin
      .from('doctor_badges')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get active badges
    const { count: activeBadges, error: activeError } = await supabaseAdmin
      .from('doctor_badges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Get expired badges
    const { count: expiredBadges, error: expiredError } = await supabaseAdmin
      .from('doctor_badges')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString());

    if (expiredError) throw expiredError;

    // Get top badges by count
    const { data: topBadges, error: topError } = await supabaseAdmin
      .from('doctor_badges')
      .select('badge_type, badge_title')
      .eq('is_active', true);

    if (topError) throw topError;

    const badgeCounts = topBadges.reduce((acc, badge) => {
      acc[badge.badge_type] = (acc[badge.badge_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topBadgesList = Object.entries(badgeCounts)
      .map(([badge_type, count]) => ({
        badge_type,
        count,
        badge_title: topBadges.find(b => b.badge_type === badge_type)?.badge_title || badge_type
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent badges (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentBadges, error: recentError } = await supabaseAdmin
      .from('doctor_badges')
      .select('*', { count: 'exact', head: true })
      .gte('earned_at', sevenDaysAgo.toISOString());

    if (recentError) throw recentError;

    return {
      totalBadges: totalBadges || 0,
      activeBadges: activeBadges || 0,
      expiredBadges: expiredBadges || 0,
      topBadges: topBadgesList,
      recentBadges: recentBadges || 0
    };

  } catch (error) {
    console.error('Error getting badge statistics:', error);
    return {
      totalBadges: 0,
      activeBadges: 0,
      expiredBadges: 0,
      topBadges: [],
      recentBadges: 0
    };
  }
}

// Get badge audit trail for a doctor
export async function getBadgeAuditTrail(doctorId: string): Promise<Array<{
  id: string;
  action: string;
  old_values: any;
  new_values: any;
  reason: string;
  triggered_by: string;
  created_at: string;
  badge_title: string;
}>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('badge_audit_trail')
      .select(`
        *,
        doctor_badges!badge_audit_trail_badge_id_fkey(badge_title)
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      action: item.action,
      old_values: item.old_values,
      new_values: item.new_values,
      reason: item.reason,
      triggered_by: item.triggered_by,
      created_at: item.created_at,
      badge_title: item.doctor_badges?.badge_title || 'Unknown'
    }));

  } catch (error) {
    console.error('Error getting badge audit trail:', error);
    return [];
  }
}

// Bulk update badges for all doctors
export async function updateAllDoctorBadges(): Promise<{
  updated: number;
  errors: number;
}> {
  try {
    console.log('🏆 Updating badges for all doctors');

    // Get all active doctors
    const { data: doctors, error: doctorsError } = await supabaseAdmin
      .from('doctors')
      .select('user_id')
      .eq('license_status', 'verified');

    if (doctorsError) throw doctorsError;

    let updated = 0;
    let errors = 0;

    for (const doctor of doctors) {
      try {
        await calculateDoctorBadges(doctor.user_id);
        updated++;
      } catch (error) {
        console.error(`Error updating badges for doctor ${doctor.user_id}:`, error);
        errors++;
      }
    }

    console.log(`✅ Badge update completed: ${updated} updated, ${errors} errors`);

    return { updated, errors };

  } catch (error) {
    console.error('Error updating all doctor badges:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function verifyDoctorBadges(doctorId: string): Promise<DoctorBadge[]> {
  try {
    console.log('🏆 Verifying badges for doctor:', doctorId);
    
    // Use the new calculation system
    return await calculateDoctorBadges(doctorId);
    
  } catch (error) {
    console.error('Error verifying doctor badges:', error);
    return [];
  }
}