import { supabaseAdmin } from '../config';

export interface DoctorReferral {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  rating: number;
  responseTime: string;
  consultationFee: number;
  availability: 'available' | 'busy' | 'offline';
  nextAvailableSlot?: string;
  location?: string;
  languages: string[];
  verified: boolean;
  trustBadges: string[];
}

export interface ReferralCriteria {
  specialty?: string;
  urgency: 'emergency' | 'urgent' | 'routine';
  location?: string;
  maxFee?: number;
  languages?: string[];
  verifiedOnly?: boolean;
}

export async function findRelevantDoctors(criteria: ReferralCriteria): Promise<DoctorReferral[]> {
  try {
    console.log('🔍 Finding relevant doctors with criteria:', criteria);

    let query = supabaseAdmin
      .from('doctors')
      .select(`
        user_id,
        specialty,
        consultation_fee,
        response_time_avg_minutes,
        location,
        languages,
        verification_status,
        profiles!inner(full_name),
        doctor_stats!inner(average_rating, total_reviews),
        doctor_badges(badge_type)
      `)
      .eq('is_active', true)
      .eq('subscription_status', 'active');

    // Filter by specialty if specified
    if (criteria.specialty) {
      query = query.eq('specialty', criteria.specialty);
    }

    // Filter by location if specified
    if (criteria.location) {
      query = query.ilike('location', `%${criteria.location}%`);
    }

    // Filter by max fee if specified
    if (criteria.maxFee) {
      query = query.lte('consultation_fee', criteria.maxFee);
    }

    // Filter by languages if specified
    if (criteria.languages && criteria.languages.length > 0) {
      query = query.overlaps('languages', criteria.languages);
    }

    // Filter by verification status if required
    if (criteria.verifiedOnly) {
      query = query.eq('verification_status', 'verified');
    }

    const { data: doctors, error } = await query;

    if (error) {
      console.error('❌ Error fetching doctors:', error);
      throw error;
    }

    if (!doctors || doctors.length === 0) {
      console.log('⚠️ No doctors found matching criteria');
      return [];
    }

    // Transform and enrich the data
    const referrals: DoctorReferral[] = doctors.map(doctor => {
      const badges = doctor.doctor_badges?.map((b: any) => b.badge_type) || [];
      
      // Determine availability based on response time and other factors
      let availability: 'available' | 'busy' | 'offline' = 'available';
      if (doctor.response_time_avg_minutes > 60) {
        availability = 'busy';
      } else if (doctor.response_time_avg_minutes > 120) {
        availability = 'offline';
      }

      // Calculate next available slot (simplified)
      const nextAvailableSlot = calculateNextAvailableSlot(availability);

      return {
        id: doctor.user_id,
        doctorId: doctor.user_id,
        doctorName: doctor.profiles?.full_name || 'Dr. Sin Nombre',
        specialty: doctor.specialty,
        rating: doctor.doctor_stats?.average_rating || 0,
        responseTime: formatResponseTime(doctor.response_time_avg_minutes),
        consultationFee: doctor.consultation_fee || 0,
        availability,
        nextAvailableSlot,
        location: doctor.location,
        languages: doctor.languages || ['Español'],
        verified: doctor.verification_status === 'verified',
        trustBadges: badges
      };
    });

    // Sort by relevance
    const sortedReferrals = sortDoctorsByRelevance(referrals, criteria);

    console.log(`✅ Found ${sortedReferrals.length} relevant doctors`);
    return sortedReferrals.slice(0, 5); // Return top 5 matches

  } catch (error) {
    console.error('❌ Error in findRelevantDoctors:', error);
    throw error;
  }
}

export async function getDoctorAvailability(doctorId: string): Promise<{
  isAvailable: boolean;
  nextAvailableSlot?: string;
  responseTime: string;
}> {
  try {
    const { data: doctor, error } = await supabaseAdmin
      .from('doctors')
      .select('response_time_avg_minutes, is_active')
      .eq('user_id', doctorId)
      .single();

    if (error || !doctor) {
      throw new Error('Doctor not found');
    }

    const isAvailable = doctor.is_active && doctor.response_time_avg_minutes < 60;
    const nextAvailableSlot = isAvailable ? 'Disponible ahora' : calculateNextAvailableSlot('busy');

    return {
      isAvailable,
      nextAvailableSlot,
      responseTime: formatResponseTime(doctor.response_time_avg_minutes)
    };

  } catch (error) {
    console.error('❌ Error getting doctor availability:', error);
    throw error;
  }
}

export async function createReferralRequest({
  patientId,
  doctorId,
  symptoms,
  urgency,
  message
}: {
  patientId: string;
  doctorId: string;
  symptoms: string;
  urgency: 'emergency' | 'urgent' | 'routine';
  message?: string;
}): Promise<{ success: boolean; referralId?: string; error?: string }> {
  try {
    console.log('📋 Creating referral request:', { patientId, doctorId, urgency });

    const { data: referral, error } = await supabaseAdmin
      .from('referral_requests')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        symptoms,
        urgency,
        message: message || '',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating referral request:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Referral request created:', referral.id);
    return { success: true, referralId: referral.id };

  } catch (error) {
    console.error('❌ Error in createReferralRequest:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

function sortDoctorsByRelevance(doctors: DoctorReferral[], criteria: ReferralCriteria): DoctorReferral[] {
  return doctors.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Rating score (40% weight)
    scoreA += a.rating * 0.4;
    scoreB += b.rating * 0.4;

    // Response time score (30% weight) - faster is better
    const responseTimeScoreA = Math.max(0, 1 - (a.responseTime.includes('min') ? 
      parseInt(a.responseTime) / 120 : 0.5));
    const responseTimeScoreB = Math.max(0, 1 - (b.responseTime.includes('min') ? 
      parseInt(b.responseTime) / 120 : 0.5));
    scoreA += responseTimeScoreA * 0.3;
    scoreB += responseTimeScoreB * 0.3;

    // Verification bonus (20% weight)
    if (a.verified) scoreA += 0.2;
    if (b.verified) scoreB += 0.2;

    // Trust badges bonus (10% weight)
    scoreA += Math.min(a.trustBadges.length * 0.02, 0.1);
    scoreB += Math.min(b.trustBadges.length * 0.02, 0.1);

    // Urgency adjustment
    if (criteria.urgency === 'emergency') {
      // Prioritize verified doctors with fast response times
      if (a.verified && a.responseTime.includes('min') && parseInt(a.responseTime) < 30) scoreA += 0.5;
      if (b.verified && b.responseTime.includes('min') && parseInt(b.responseTime) < 30) scoreB += 0.5;
    }

    return scoreB - scoreA;
  });
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    return `${Math.round(minutes / 60)} hrs`;
  } else {
    return `${Math.round(minutes / 1440)} días`;
  }
}

function calculateNextAvailableSlot(availability: string): string {
  const now = new Date();
  
  switch (availability) {
    case 'available':
      return 'Disponible ahora';
    case 'busy':
      // Add 2 hours
      const busyTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      return busyTime.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case 'offline':
      // Add 1 day
      const offlineTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return offlineTime.toLocaleDateString('es-MX');
    default:
      return 'Consultar disponibilidad';
  }
}

export async function getSpecialtyRecommendations(symptoms: string): Promise<string[]> {
  // Simple symptom-to-specialty mapping
  const specialtyMap: { [key: string]: string[] } = {
    'dolor de cabeza': ['Neurología', 'Medicina Interna'],
    'fiebre': ['Medicina Interna', 'Infectología'],
    'dolor de pecho': ['Cardiología', 'Medicina Interna'],
    'dolor abdominal': ['Gastroenterología', 'Cirugía General'],
    'problemas de piel': ['Dermatología'],
    'problemas de ojos': ['Oftalmología'],
    'problemas de oídos': ['Otorrinolaringología'],
    'problemas de garganta': ['Otorrinolaringología'],
    'problemas respiratorios': ['Neumología', 'Medicina Interna'],
    'problemas de corazón': ['Cardiología'],
    'problemas digestivos': ['Gastroenterología'],
    'problemas de huesos': ['Ortopedia', 'Reumatología'],
    'problemas de articulaciones': ['Reumatología', 'Ortopedia'],
    'problemas de riñones': ['Nefrología'],
    'problemas de hígado': ['Gastroenterología', 'Hepatología'],
    'problemas de tiroides': ['Endocrinología'],
    'problemas de diabetes': ['Endocrinología', 'Medicina Interna'],
    'problemas de presión': ['Cardiología', 'Medicina Interna'],
    'problemas de ansiedad': ['Psiquiatría', 'Psicología'],
    'problemas de depresión': ['Psiquiatría', 'Psicología'],
    'problemas de sueño': ['Neurología', 'Psiquiatría'],
    'problemas de memoria': ['Neurología', 'Geriatría'],
    'problemas de niños': ['Pediatría'],
    'problemas de mujeres': ['Ginecología'],
    'problemas de hombres': ['Urología'],
    'problemas de embarazo': ['Ginecología', 'Obstetricia'],
    'problemas de cáncer': ['Oncología'],
    'problemas de sangre': ['Hematología'],
    'problemas de alergias': ['Alergología', 'Inmunología'],
    'problemas de inmunidad': ['Inmunología', 'Infectología']
  };

  const symptomsLower = symptoms.toLowerCase();
  const recommendedSpecialties: string[] = [];

  // Find matching specialties
  for (const [symptom, specialties] of Object.entries(specialtyMap)) {
    if (symptomsLower.includes(symptom)) {
      recommendedSpecialties.push(...specialties);
    }
  }

  // Remove duplicates and return top 3
  const uniqueSpecialties = [...new Set(recommendedSpecialties)];
  return uniqueSpecialties.slice(0, 3);
}
