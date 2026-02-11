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
    rating_count: number;
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
  location?: string;
  budget?: string;
  language?: string;
}) {
  const supabase = await createServiceClient();

  // 1. Enhanced doctor discovery with multiple filters
  const doctorsData = await discoverDoctors({
    specialtySlug: params.specialty.toLowerCase().replace(/\s+/g, '-'),
    city: params.location || undefined,
    minRating: 4.0, // Only show quality doctors
  });

  const doctors = (Array.isArray(doctorsData) ? doctorsData : []) as unknown as DiscoveryDoctor[];

  if (doctors.length === 0) {
    return [];
  }

  // 2. Enhanced scoring algorithm
  const scoredDoctors = doctors.map((doctor) => {
    let score = 0;
    const reasons: string[] = [];

    // Rating score (30%)
    if (doctor.rating_avg >= 4.5) {
      score += 30;
      reasons.push('Excelente reputación');
    } else if (doctor.rating_avg >= 4.0) {
      score += 20;
      reasons.push('Buena reputación');
    }

    // Experience score (20%)
    if (doctor.years_experience && doctor.years_experience >= 10) {
      score += 20;
      reasons.push('Más de 10 años de experiencia');
    } else if (doctor.years_experience && doctor.years_experience >= 5) {
      score += 10;
      reasons.push('Experiencia consolidada');
    }

    // Language match (15%)
    if (params.language === 'es' && doctor.languages.includes('Español')) {
      score += 15;
      reasons.push('Habla español');
    }

    // Price-value score (15%)
    const avgPrice = doctors.reduce((sum, d) => sum + (d.price_cents / 100), 0) / doctors.length;
    if (doctor.price_cents / 100 <= avgPrice * 0.8) {
      score += 15;
      reasons.push('Precio competitivo');
    }

    // Recent activity score (10%) - would need appointment data
    // For now, random small boost
    score += Math.random() * 10;

    // Urgency match (10%)
    if (params.urgency === 'high' && doctor.status === 'available') {
      score += 10;
      reasons.push('Disponible inmediatamente');
    }

    return { doctor, score, reasons };
  });

  // 3. Sort by score and take top matches
  const topMatches = scoredDoctors
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // 4. Persist referrals in DB with enhanced context
  if (topMatches.length > 0) {
    const referrals = topMatches.map((m) => ({
      session_id: params.sessionId,
      patient_id: params.patientId === 'anonymous' ? null : params.patientId,
      doctor_id: m.doctor.id,
      specialty_matched: params.specialty,
      match_score: m.score,
      reasons: m.reasons,
      referral_context: {
        urgency: params.urgency,
        symptoms: params.symptoms,
        location: params.location,
        budget: params.budget,
      },
      status: 'suggested'
    }));

    await supabase.from('ai_doctor_referrals').insert(referrals);

    // Track matching quality
    await supabase.from('ai_match_analytics').insert({
      session_id: params.sessionId,
      specialty: params.specialty,
      urgency: params.urgency,
      doctors_available: doctors.length,
      doctors_matched: topMatches.length,
      avg_score: topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length,
      timestamp: new Date().toISOString(),
    });
  }

  return topMatches.map((m) => ({
    doctorId: m.doctor.id,
    score: m.score,
    reasons: m.reasons,
    doctor: {
      id: m.doctor.id,
      profile: m.doctor.profile,
      specialties: m.doctor.specialties,
      rating_avg: m.doctor.rating_avg,
      rating_count: m.doctor.rating_count,
      price_cents: m.doctor.price_cents,
      city: m.doctor.city,
    },
  }));
}

