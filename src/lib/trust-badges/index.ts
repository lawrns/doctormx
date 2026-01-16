/**
 * Trust Badges System for Doctor.mx
 * Manages doctor trust badges based on various criteria
 */

import { createClient } from '@/lib/supabase/server'

export interface Badge {
  id: string;
  doctor_id: string;
  badge_type: string;
  badge_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  badge_title: string;
  badge_description: string;
  badge_icon: string;
  badge_color: string;
  criteria_met: Record<string, unknown>;
  earned_at: string;
  expires_at: string | null;
  is_active: boolean;
  display_order: number;
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
  type: string;
  title: string;
  description: string;
  icon: string;
  levels: {
    bronze: { threshold: number; description: string };
    silver: { threshold: number; description: string };
    gold: { threshold: number; description: string };
    platinum: { threshold: number; description: string };
  };
  category: string;
  color: string;
}

// Badge definitions
export const BADGE_DEFINITIONS: BadgeCriteria[] = [
  {
    type: 'verified_credentials',
    title: 'Credenciales Verificadas',
    description: 'Cédula profesional verificada por la SEP',
    icon: 'shield-check',
    category: 'verification',
    color: '#10B981',
    levels: {
      bronze: { threshold: 1, description: 'Cédula verificada' },
      silver: { threshold: 1, description: 'Cédula y especialidad verificadas' },
      gold: { threshold: 1, description: 'Verificación completa con institución' },
      platinum: { threshold: 1, description: 'Verificación premium con historial' },
    }
  },
  {
    type: 'experience_years',
    title: 'Experiencia Profesional',
    description: 'Años de experiencia en práctica médica',
    icon: 'clock',
    category: 'experience',
    color: '#3B82F6',
    levels: {
      bronze: { threshold: 2, description: '2+ años de experiencia' },
      silver: { threshold: 5, description: '5+ años de experiencia' },
      gold: { threshold: 10, description: '10+ años de experiencia' },
      platinum: { threshold: 20, description: '20+ años de experiencia' },
    }
  },
  {
    type: 'patient_rating',
    title: 'Calificación de Pacientes',
    description: 'Promedio de calificaciones de pacientes',
    icon: 'star',
    category: 'ratings',
    color: '#F59E0B',
    levels: {
      bronze: { threshold: 4.0, description: '4.0+ estrellas' },
      silver: { threshold: 4.3, description: '4.3+ estrellas' },
      gold: { threshold: 4.6, description: '4.6+ estrellas' },
      platinum: { threshold: 4.9, description: '4.9+ estrellas' },
    }
  },
  {
    type: 'consultation_count',
    title: 'Consultas Realizadas',
    description: 'Número total de consultas completadas',
    icon: 'users',
    category: 'engagement',
    color: '#8B5CF6',
    levels: {
      bronze: { threshold: 10, description: '10+ consultas' },
      silver: { threshold: 50, description: '50+ consultas' },
      gold: { threshold: 200, description: '200+ consultas' },
      platinum: { threshold: 1000, description: '1000+ consultas' },
    }
  },
  {
    type: 'response_time',
    title: 'Respuesta Rápida',
    description: 'Tiempo promedio de respuesta a pacientes',
    icon: 'zap',
    category: 'engagement',
    color: '#EC4899',
    levels: {
      bronze: { threshold: 24, description: 'Responde en <24h' },
      silver: { threshold: 12, description: 'Responde en <12h' },
      gold: { threshold: 4, description: 'Responde en <4h' },
      platinum: { threshold: 1, description: 'Responde en <1h' },
    }
  },
  {
    type: 'profile_complete',
    title: 'Perfil Completo',
    description: 'Completitud del perfil profesional',
    icon: 'user-check',
    category: 'verification',
    color: '#06B6D4',
    levels: {
      bronze: { threshold: 50, description: '50% del perfil completo' },
      silver: { threshold: 75, description: '75% del perfil completo' },
      gold: { threshold: 90, description: '90% del perfil completo' },
      platinum: { threshold: 100, description: 'Perfil 100% completo' },
    }
  },
];

/**
 * Calculate badge level based on value and criteria
 */
function calculateBadgeLevel(
  value: number,
  criteria: BadgeCriteria
): 'bronze' | 'silver' | 'gold' | 'platinum' | null {
  const { levels } = criteria;
  
  // For response_time, lower is better
  if (criteria.type === 'response_time') {
    if (value <= levels.platinum.threshold) return 'platinum';
    if (value <= levels.gold.threshold) return 'gold';
    if (value <= levels.silver.threshold) return 'silver';
    if (value <= levels.bronze.threshold) return 'bronze';
    return null;
  }
  
  // For other metrics, higher is better
  if (value >= levels.platinum.threshold) return 'platinum';
  if (value >= levels.gold.threshold) return 'gold';
  if (value >= levels.silver.threshold) return 'silver';
  if (value >= levels.bronze.threshold) return 'bronze';
  return null;
}

/**
 * Get level color gradient
 */
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
  };
  return colors[level] || colors.bronze;
}

/**
 * Calculate all badges for a doctor
 */
export async function calculateDoctorBadges(doctorId: string): Promise<Badge[]> {
  const supabase = await createClient();
  
  // Fetch doctor data
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('*, profiles!inner(full_name)')
    .eq('id', doctorId)
    .single();
  
  if (doctorError || !doctor) {
    console.error('Error fetching doctor:', doctorError);
    return [];
  }
  
  // Fetch consultation count
  const { count: consultationCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .eq('status', 'completed');
  
  // Fetch verification status
  const { data: verification } = await supabase
    .from('doctor_verifications')
    .select('*')
    .eq('doctor_id', doctorId)
    .single();
  
  // Calculate profile completeness
  const profileFields = ['bio', 'license_number', 'years_experience', 'city', 'state', 'price_cents'];
  const filledFields = profileFields.filter(field => doctor[field] != null && doctor[field] !== '');
  const profileCompleteness = Math.round((filledFields.length / profileFields.length) * 100);
  
  // Metrics for badge calculation
  const metrics: Record<string, number> = {
    verified_credentials: verification?.sep_verified ? 1 : 0,
    experience_years: doctor.years_experience || 0,
    patient_rating: parseFloat(doctor.rating_avg) || 0,
    consultation_count: consultationCount || 0,
    response_time: 12, // Default, would be calculated from actual response times
    profile_complete: profileCompleteness,
  };
  
  const badges: Badge[] = [];
  
  for (const criteria of BADGE_DEFINITIONS) {
    const value = metrics[criteria.type];
    if (value === undefined) continue;
    
    const level = calculateBadgeLevel(value, criteria);
    if (!level) continue;
    
    const levelInfo = criteria.levels[level];
    
    badges.push({
      id: `${doctorId}-${criteria.type}`,
      doctor_id: doctorId,
      badge_type: criteria.type,
      badge_level: level,
      badge_title: criteria.title,
      badge_description: levelInfo.description,
      badge_icon: criteria.icon,
      badge_color: criteria.color,
      criteria_met: { value, threshold: levelInfo.threshold },
      earned_at: new Date().toISOString(),
      expires_at: null,
      is_active: true,
      display_order: BADGE_DEFINITIONS.indexOf(criteria),
    });
  }
  
  return badges;
}

/**
 * Update badges in database for a doctor
 */
export async function updateDoctorBadges(doctorId: string): Promise<Badge[]> {
  const supabase = await createClient();
  const badges = await calculateDoctorBadges(doctorId);
  
  for (const badge of badges) {
    // Upsert badge
    const { error } = await supabase
      .from('doctor_badges')
      .upsert({
        doctor_id: badge.doctor_id,
        badge_type: badge.badge_type,
        badge_level: badge.badge_level,
        badge_title: badge.badge_title,
        badge_description: badge.badge_description,
        badge_icon: badge.badge_icon,
        badge_color: badge.badge_color,
        criteria_met: badge.criteria_met,
        earned_at: badge.earned_at,
        expires_at: badge.expires_at,
        is_active: badge.is_active,
        display_order: badge.display_order,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'doctor_id,badge_type'
      });
    
    if (error) {
      console.error('Error upserting badge:', error);
    }
  }
  
  // Log audit trail
  await supabase.from('badge_audit_trail').insert({
    doctor_id: doctorId,
    action: 'badges_recalculated',
    new_values: { badges_count: badges.length, badges: badges.map(b => b.badge_type) },
    triggered_by: 'system',
  });
  
  return badges;
}

/**
 * Get badges for a doctor
 */
export async function getDoctorBadges(doctorId: string): Promise<Badge[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('doctor_badges')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('is_active', true)
    .order('display_order');
  
  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get badge categories
 */
export async function getBadgeCategories(): Promise<BadgeCategory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('badge_categories')
    .select('*')
    .order('display_order');
  
  if (error) {
    console.error('Error fetching badge categories:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get public badges for display on doctor profile
 */
export async function getPublicDoctorBadges(doctorId: string): Promise<{
  badges: Badge[];
  summary: {
    total: number;
    byLevel: Record<string, number>;
    topBadge: Badge | null;
  };
}> {
  const badges = await getDoctorBadges(doctorId);
  
  const byLevel: Record<string, number> = {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  };
  
  badges.forEach(badge => {
    byLevel[badge.badge_level] = (byLevel[badge.badge_level] || 0) + 1;
  });
  
  // Find top badge (platinum > gold > silver > bronze)
  const levelOrder = ['platinum', 'gold', 'silver', 'bronze'];
  let topBadge: Badge | null = null;
  
  for (const level of levelOrder) {
    const badge = badges.find(b => b.badge_level === level);
    if (badge) {
      topBadge = badge;
      break;
    }
  }
  
  return {
    badges,
    summary: {
      total: badges.length,
      byLevel,
      topBadge,
    }
  };
}
