import { createClient } from '@supabase/supabase-js';
import { doctorReply } from './openai';

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

export interface ReferralCriteria {
  symptoms: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  specialty: string;
  location?: string;
  insurance?: string;
  preferences?: {
    gender?: 'male' | 'female' | 'any';
    language?: string[];
    experience?: 'junior' | 'senior' | 'any';
    availability?: 'immediate' | 'within_week' | 'flexible';
  };
}

export interface DoctorMatch {
  doctor_id: string;
  match_score: number;
  reasons: string[];
  availability: {
    next_available: string;
    time_slots: string[];
  };
  estimated_wait_time: string;
  consultation_fee: number;
  insurance_accepted: boolean;
}

export interface ReferralResult {
  referral_id: string;
  patient_id: string;
  ai_analysis: {
    recommended_specialty: string;
    urgency_level: string;
    reasoning: string;
    red_flags: string[];
  };
  matched_doctors: DoctorMatch[];
  referral_message: string;
  created_at: string;
}

/**
 * Analyze patient symptoms and determine if referral is needed
 */
export async function analyzeReferralNeed(
  symptoms: string,
  patientId: string,
  additionalInfo?: string
): Promise<{
  needsReferral: boolean;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  recommendedSpecialty: string;
  reasoning: string;
  redFlags: string[];
}> {
  try {
    const analysisPrompt = `
Como médico IA, analiza los siguientes síntomas y determina si el paciente necesita ser referido a un especialista:

Síntomas: ${symptoms}
Información adicional: ${additionalInfo || 'No proporcionada'}

Responde en formato JSON con:
{
  "needsReferral": boolean,
  "urgency": "low" | "medium" | "high" | "emergency",
  "recommendedSpecialty": "especialidad recomendada",
  "reasoning": "explicación detallada",
  "redFlags": ["banderas rojas si las hay"]
}

Considera:
- Síntomas que requieren evaluación especializada
- Signos de alarma que requieren atención inmediata
- Especialidad más apropiada para los síntomas
- Urgencia basada en la gravedad de los síntomas

Especialidades disponibles:
- Cardiología
- Neurología
- Gastroenterología
- Endocrinología
- Dermatología
- Oftalmología
- Otorrinolaringología
- Ginecología
- Urología
- Ortopedia
- Psiquiatría
- Pediatría
- Medicina Interna
- Neumología
- Nefrología
- Reumatología
- Oncología
- Cirugía General
- Anestesiología
- Radiología
`;

    const response = await doctorReply(analysisPrompt);
    
    try {
      const analysis = JSON.parse(response);
      return analysis;
    } catch (parseError) {
      // Fallback analysis if JSON parsing fails
      return {
        needsReferral: true,
        urgency: 'medium',
        recommendedSpecialty: 'Medicina Interna',
        reasoning: 'Se recomienda evaluación médica especializada',
        redFlags: []
      };
    }
  } catch (error) {
    console.error('Error analyzing referral need:', error);
    throw new Error('Error al analizar necesidad de referencia');
  }
}

/**
 * Find matching doctors based on referral criteria
 */
export async function findMatchingDoctors(
  criteria: ReferralCriteria,
  limit: number = 5
): Promise<DoctorMatch[]> {
  try {
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users:user_id (
          name,
          email,
          phone
        ),
        specialties,
        availability_slots,
        consultation_fees,
        insurance_providers,
        ratings,
        response_time_avg
      `)
      .eq('verification_status', 'verified')
      .eq('license_status', 'verified')
      .overlaps('specialties', [criteria.specialty]);

    if (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Error al buscar doctores');
    }

    if (!doctors || doctors.length === 0) {
      return [];
    }

    // Score and rank doctors
    const scoredDoctors = doctors.map(doctor => {
      let score = 0;
      const reasons: string[] = [];

      // Base score for verified doctors
      score += 20;
      reasons.push('Doctor verificado');

      // Specialty match
      if (doctor.specialties && doctor.specialties.includes(criteria.specialty)) {
        score += 30;
        reasons.push('Especialidad exacta');
      }

      // Rating score
      if (doctor.ratings && doctor.ratings.length > 0) {
        const avgRating = doctor.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / doctor.ratings.length;
        score += avgRating * 5;
        reasons.push(`Calificación alta (${avgRating.toFixed(1)})`);
      }

      // Response time score
      if (doctor.response_time_avg) {
        if (doctor.response_time_avg < 2) {
          score += 15;
          reasons.push('Respuesta rápida');
        } else if (doctor.response_time_avg < 6) {
          score += 10;
          reasons.push('Respuesta moderada');
        }
      }

      // Availability score
      if (doctor.availability_slots && doctor.availability_slots.length > 0) {
        const availableSlots = doctor.availability_slots.filter((slot: any) => 
          new Date(slot.start_time) > new Date()
        );
        if (availableSlots.length > 0) {
          score += 10;
          reasons.push('Disponibilidad inmediata');
        }
      }

      // Insurance match
      if (criteria.insurance && doctor.insurance_providers?.includes(criteria.insurance)) {
        score += 15;
        reasons.push('Acepta tu seguro');
      }

      return {
        doctor_id: doctor.user_id,
        match_score: Math.min(score, 100),
        reasons,
        availability: {
          next_available: doctor.availability_slots?.[0]?.start_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          time_slots: doctor.availability_slots?.slice(0, 5).map((slot: any) => slot.start_time) || []
        },
        estimated_wait_time: doctor.response_time_avg ? `${doctor.response_time_avg} horas` : '24 horas',
        consultation_fee: doctor.consultation_fees?.base_fee || 500,
        insurance_accepted: doctor.insurance_providers?.length > 0
      };
    });

    // Sort by score and return top matches
    return scoredDoctors
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error finding matching doctors:', error);
    throw new Error('Error al encontrar doctores compatibles');
  }
}

/**
 * Create a referral from AI analysis
 */
export async function createAIReferral(
  patientId: string,
  symptoms: string,
  additionalInfo?: string
): Promise<ReferralResult> {
  try {
    // Analyze if referral is needed
    const analysis = await analyzeReferralNeed(symptoms, patientId, additionalInfo);
    
    if (!analysis.needsReferral) {
      throw new Error('No se requiere referencia médica');
    }

    // Find matching doctors
    const criteria: ReferralCriteria = {
      symptoms: symptoms.split(',').map(s => s.trim()),
      urgency: analysis.urgency,
      specialty: analysis.recommendedSpecialty
    };

    const matchedDoctors = await findMatchingDoctors(criteria);

    if (matchedDoctors.length === 0) {
      throw new Error('No se encontraron doctores disponibles para esta especialidad');
    }

    // Create referral record
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const referralData = {
      id: referralId,
      patient_id: patientId,
      ai_analysis: analysis,
      matched_doctors: matchedDoctors,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('ai_referrals')
      .insert(referralData);

    if (insertError) {
      console.error('Error creating referral:', insertError);
      throw new Error('Error al crear referencia');
    }

    // Generate referral message
    const referralMessage = generateReferralMessage(analysis, matchedDoctors);

    return {
      referral_id: referralId,
      patient_id: patientId,
      ai_analysis: analysis,
      matched_doctors: matchedDoctors,
      referral_message: referralMessage,
      created_at: referralData.created_at
    };
  } catch (error) {
    console.error('Error creating AI referral:', error);
    throw error;
  }
}

/**
 * Generate a human-readable referral message
 */
function generateReferralMessage(
  analysis: any,
  matchedDoctors: DoctorMatch[]
): string {
  const urgencyText = {
    low: 'no urgente',
    medium: 'moderada',
    high: 'alta',
    emergency: 'emergencia'
  };

  let message = `📋 **Análisis de Referencia Médica**\n\n`;
  message += `**Especialidad recomendada:** ${analysis.recommendedSpecialty}\n`;
  message += `**Nivel de urgencia:** ${urgencyText[analysis.urgency as keyof typeof urgencyText]}\n\n`;
  
  if (analysis.reasoning) {
    message += `**Razón de la referencia:**\n${analysis.reasoning}\n\n`;
  }

  if (analysis.redFlags && analysis.redFlags.length > 0) {
    message += `⚠️ **Señales de alarma detectadas:**\n`;
    analysis.redFlags.forEach((flag: string) => {
      message += `• ${flag}\n`;
    });
    message += `\n`;
  }

  message += `**Doctores recomendados:**\n\n`;

  matchedDoctors.forEach((doctor, index) => {
    message += `${index + 1}. **Doctor ${doctor.doctor_id}**\n`;
    message += `   • Puntuación de compatibilidad: ${doctor.match_score}/100\n`;
    message += `   • Tiempo de respuesta estimado: ${doctor.estimated_wait_time}\n`;
    message += `   • Tarifa de consulta: $${doctor.consultation_fee} MXN\n`;
    message += `   • Razones: ${doctor.reasons.join(', ')}\n\n`;
  });

  message += `💡 **Próximos pasos:**\n`;
  message += `1. Revisa los doctores recomendados\n`;
  message += `2. Selecciona el que mejor se adapte a tus necesidades\n`;
  message += `3. Agenda tu cita directamente\n`;
  message += `4. Si tienes síntomas de emergencia, acude inmediatamente a urgencias\n\n`;

  message += `⚠️ **Importante:** Esta es una referencia basada en IA. Siempre consulta con un médico profesional para diagnóstico y tratamiento.`;

  return message;
}

/**
 * Get referral history for a patient
 */
export async function getPatientReferrals(patientId: string): Promise<ReferralResult[]> {
  try {
    const { data: referrals, error } = await supabase
      .from('ai_referrals')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      throw new Error('Error al obtener referencias');
    }

    return referrals || [];
  } catch (error) {
    console.error('Error getting patient referrals:', error);
    throw error;
  }
}

/**
 * Update referral status
 */
export async function updateReferralStatus(
  referralId: string,
  status: 'pending' | 'accepted' | 'rejected' | 'completed',
  doctorId?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (doctorId) {
      updateData.selected_doctor_id = doctorId;
    }

    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient
      .from('ai_referrals')
      .update(updateData)
      .eq('id', referralId);

    if (error) {
      console.error('Error updating referral status:', error);
      throw new Error('Error al actualizar estado de referencia');
    }
  } catch (error) {
    console.error('Error updating referral status:', error);
    throw error;
  }
}

export async function getAIReferrals(doctorId: string): Promise<any[]> {
  try {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('ai_referrals')
      .select('*')
      .eq('selected_doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting AI referrals:', error);
    throw error;
  }
}

export async function getDoctorAvailability(doctorId: string): Promise<any[]> {
  try {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting doctor availability:', error);
    throw error;
  }
}

export async function createAppointmentBooking({
  referralId,
  doctorId,
  patientId,
  appointmentTime,
  notes
}: {
  referralId: string;
  doctorId: string;
  patientId: string;
  appointmentTime: string;
  notes?: string;
}): Promise<any> {
  try {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('appointment_bookings')
      .insert({
        referral_id: referralId,
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_time: appointmentTime,
        status: 'confirmed',
        notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating appointment booking:', error);
    throw error;
  }
}
