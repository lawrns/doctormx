import { supabaseAdmin } from '../lib/supabase.js';

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
        specialties,
        consultation_fees,
        response_time_avg,
        full_name,
        rating_avg,
        license_status,
        verification_status,
        users!inner(
          id,
          name,
          email
        )
      `)
      .eq('license_status', 'verified');

    // Filter by specialty if specified
    if (criteria.specialty) {
      query = query.contains('specialties', [criteria.specialty]);
    }

    // Filter by max fee if specified
    if (criteria.maxFee) {
      query = query.lte('consultation_fees.base_fee', criteria.maxFee);
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
      // Determine availability based on response time and other factors
      let availability: 'available' | 'busy' | 'offline' = 'available';
      const responseTimeMinutes = doctor.response_time_avg || 30;
      if (responseTimeMinutes > 60) {
        availability = 'busy';
      } else if (responseTimeMinutes > 120) {
        availability = 'offline';
      }

      // Calculate next available slot (simplified)
      const nextAvailableSlot = calculateNextAvailableSlot(availability);

      return {
        id: doctor.user_id,
        doctorId: doctor.user_id,
        doctorName: doctor.full_name || doctor.users?.name || 'Dr. Sin Nombre',
        specialty: doctor.specialties?.[0] || 'Medicina General',
        rating: doctor.rating_avg || 4.5,
        responseTime: formatResponseTime(responseTimeMinutes),
        consultationFee: doctor.consultation_fees?.base_fee || 800,
        availability,
        nextAvailableSlot,
        location: 'Ciudad de México', // Default location
        languages: ['Español'],
        verified: doctor.license_status === 'verified',
        trustBadges: ['verified', 'sep_verified']
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
      .select('response_time_avg, license_status')
      .eq('user_id', doctorId)
      .single();

    if (error || !doctor) {
      throw new Error('Doctor not found');
    }

    const responseTimeMinutes = doctor.response_time_avg || 30;
    const isAvailable = doctor.license_status === 'verified' && responseTimeMinutes < 60;
    const nextAvailableSlot = isAvailable ? 'Disponible ahora' : calculateNextAvailableSlot('busy');

    return {
      isAvailable,
      nextAvailableSlot,
      responseTime: formatResponseTime(responseTimeMinutes)
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

export async function getSpecialtyRecommendations(symptoms: string | string[]): Promise<string[]> {
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

  const symptomsArray = Array.isArray(symptoms) ? symptoms : [symptoms];
  const symptomsLower = symptomsArray.join(' ').toLowerCase();
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
