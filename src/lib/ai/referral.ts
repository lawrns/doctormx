import { createServiceClient } from '@/lib/supabase/server';
import { discoverDoctors } from '@/lib/discovery';
import { structuredAnalysis } from './client';
import { SMART_MATCHING_PROMPT } from './prompts';

// Define the shape of the doctor object returned by discoverDoctors
interface DiscoveryDoctor {
  id: string;
  status: string;
  bio: string | null;
  languages: string[];
  years_experience: number | null;
  city: string | null;
  state: string | null;
  country: string;
  price_cents: number;
  currency: string;
  rating_avg: number;
  rating_count: number;
  profile: {
    id: string;
    full_name: string;
    photo_url: string | null;
  } | null;
  specialties: Array<{
    id: string;
    name: string | undefined;
    slug: string | undefined;
  }>;
}

export type DoctorMatch = {
  doctorId: string;
  score: number;
  reasons: string[];
  doctor?: {
    id: string;
    profile: {
      full_name: string;
      photo_url: string | null;
    } | null;
    specialties: Array<{
      id: string;
      name: string | undefined;
      slug: string | undefined;
    }>;
    rating_avg: number;
    price_cents: number;
    city: string | null;
  };
};

export async function matchDoctorsForReferral(params: {
  symptoms: string[];
  urgency: string;
  specialty: string;
  sessionId: string;
  patientId?: string;
}) {
  const supabase = await createServiceClient();
  
  // 1. Fetch relevant doctors based on suggested specialty
  const doctorsData = await discoverDoctors({
    specialtySlug: params.specialty.toLowerCase().replace(/\s+/g, '-'),
  });

  const doctors = (Array.isArray(doctorsData) ? doctorsData : []) as unknown as DiscoveryDoctor[];

  if (doctors.length === 0) {
    return [];
  }

  // 2. Format doctors for AI analysis
  const doctorContext = doctors.slice(0, 5).map((d) => ({
    id: d.id,
    name: d.profile?.full_name,
    specialties: d.specialties.map((s) => s.name),
    rating: d.rating_avg,
    price: d.price_cents / 100,
    city: d.city,
  }));

  // 3. Use AI to rank and select top matches
  const analysis = await structuredAnalysis<{ matches: DoctorMatch[] }>({
    systemPrompt: 'Eres un experto en asignación médica.',
    userPrompt: SMART_MATCHING_PROMPT
      .replace('{symptoms}', params.symptoms.join(', '))
      .replace('{urgency}', params.urgency)
      .replace('{location}', 'México')
      .replace('{budget}', 'Cualquiera')
      .replace('{preferences}', 'Atención inmediata')
      .replace('{doctors}', JSON.stringify(doctorContext)),
  });

  const matches = analysis.matches || [];

  // 4. Persist referrals in DB
  if (matches.length > 0) {
    const referrals = matches.map((m) => ({
      session_id: params.sessionId,
      patient_id: params.patientId === 'anonymous' ? null : params.patientId,
      doctor_id: m.doctorId,
      specialty_matched: params.specialty,
      reasons: m.reasons,
      referral_context: { urgency: params.urgency, symptoms: params.symptoms },
      status: 'suggested'
    }));

    await supabase.from('ai_doctor_referrals').insert(referrals);
  }

  return matches.map((m) => {
    const doctor = doctors.find((d) => d.id === m.doctorId);
    return {
      ...m,
      doctor: doctor ? {
        id: doctor.id,
        profile: doctor.profile,
        specialties: doctor.specialties,
        rating_avg: doctor.rating_avg,
        price_cents: doctor.price_cents,
        city: doctor.city
      } : undefined
    };
  });
}
