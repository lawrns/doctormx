import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { logger } from '@/lib/observability/logger';

interface RequestBody {
  specialty: string;
  urgencyLevel?: 'emergency' | 'urgent' | 'moderate' | 'routine';
  consultationId?: string;
  limit?: number;
  city?: string;
  state?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const {
      specialty,
      urgencyLevel = 'moderate',
      consultationId,
      limit = 3,
      city,
      state,
    } = body;

    const supabase = createServiceClient();

    // Build query for doctors matching specialty
    let query = supabase
      .from('doctors')
      .select(
        `
        id,
        price_cents,
        rating_avg,
        rating_count,
        years_experience,
        city,
        state,
        status,
        profiles!inner(
          full_name,
          photo_url
        ),
        doctor_specialties!inner(
          specialties(
            name_es
          )
        ),
        doctor_subscriptions!left(
          current_period_end,
          status
        )
      `
      )
      .eq('status', 'approved')
      .eq('doctor_specialties.specialties.name_es', specialty);

    // Filter by location if provided
    if (city) {
      query = query.eq('city', city);
    }
    if (state) {
      query = query.eq('state', state);
    }

    // Execute query
    const { data: doctorsData, error } = await query;

    if (error) {
      logger.error('Error fetching recommended doctors:', { error });
      return NextResponse.json(
        { error: 'Failed to fetch doctors' },
        { status: 500 }
      );
    }

    // Filter for active subscriptions
    const activeDoctors = (doctorsData || []).filter((doc) => {
      const subscription = doc.doctor_subscriptions?.[0];
      if (!subscription) return false;

      const isActive =
        subscription.status === 'active' &&
        new Date(subscription.current_period_end) > new Date();

      return isActive;
    });

    // Transform and enrich doctor data
    const doctors = await Promise.all(
      activeDoctors.slice(0, limit).map(async (doc) => {
        // Fetch next available slot
        const nextAvailable = await getNextAvailableSlot(doc.id);

        // Handle profiles - may be array or single object depending on Supabase join
        const profile = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles;

        // Handle specialties - extract name safely
        const doctorSpecialty = doc.doctor_specialties?.[0];
        const specialtyData = doctorSpecialty?.specialties as any;
        const specialtyName = Array.isArray(specialtyData)
          ? specialtyData[0]?.name_es
          : specialtyData?.name_es;

        return {
          id: doc.id,
          name: profile?.full_name || 'Doctor',
          specialty: specialtyName || specialty,
          photo: profile?.photo_url || null,
          rating: doc.rating_avg || 0,
          reviewCount: doc.rating_count || 0,
          yearsExperience: doc.years_experience || 0,
          priceCents: doc.price_cents,
          city: doc.city,
          state: doc.state,
          nextAvailable,
          videoConsultation: true, // All approved doctors support video
          verified: doc.status === 'approved',
        };
      })
    );

    // Sort by priority based on urgency
    const sortedDoctors = sortByPriority(doctors, urgencyLevel);

    // Log AI referral for analytics
    if (consultationId) {
      await logAIReferral(consultationId, sortedDoctors.map((d) => d.id));
    }

    return NextResponse.json({
      doctors: sortedDoctors,
      specialty,
      urgencyLevel,
      consultationId,
    });
  } catch (error) {
    logger.error('Unexpected error in recommended doctors API:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get next available time slot for a doctor
 */
async function getNextAvailableSlot(doctorId: string): Promise<string | null> {
  try {
    const supabase = createServiceClient();

    // Fetch doctor's availability for next 7 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const { data: availability, error } = await supabase
      .from('doctor_availability')
      .select('day_of_week, start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('is_available', true);

    if (error || !availability || availability.length === 0) {
      return null;
    }

    // Fetch existing appointments to exclude booked slots
    const { data: appointments } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('doctor_id', doctorId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString())
      .in('status', ['scheduled', 'confirmed']);

    const bookedSlots = new Set(
      (appointments || []).map((apt) => apt.scheduled_at)
    );

    // Find next available slot
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + i);
      const dayOfWeek = checkDate.getDay();

      const dayAvailability = availability.filter(
        (avail) => avail.day_of_week === dayOfWeek
      );

      for (const slot of dayAvailability) {
        const slotTime = new Date(checkDate);
        const [hours, minutes] = slot.start_time.split(':');
        slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Skip if in the past
        if (slotTime < new Date()) continue;

        // Skip if booked
        if (bookedSlots.has(slotTime.toISOString())) continue;

        // Format return string
        const isToday = i === 0;
        const isTomorrow = i === 1;

        let dateStr = '';
        if (isToday) {
          dateStr = 'Hoy';
        } else if (isTomorrow) {
          dateStr = 'Mañana';
        } else {
          dateStr = checkDate.toLocaleDateString('es-MX', {
            weekday: 'short',
            day: 'numeric',
          });
        }

        const timeStr = slotTime.toLocaleTimeString('es-MX', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        return `${dateStr} ${timeStr}`;
      }
    }

    return null;
  } catch (error) {
    logger.error('Error fetching next available slot:', { error, doctorId });
    return null;
  }
}

/**
 * Sort doctors by priority based on urgency level
 */
function sortByPriority(
  doctors: any[],
  urgencyLevel: string
): any[] {
  return doctors.sort((a, b) => {
    // For urgent cases, prioritize by availability
    if (urgencyLevel === 'urgent' || urgencyLevel === 'emergency') {
      if (a.nextAvailable && !b.nextAvailable) return -1;
      if (!a.nextAvailable && b.nextAvailable) return 1;
    }

    // Then by rating
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }

    // Then by experience
    if (a.yearsExperience !== b.yearsExperience) {
      return b.yearsExperience - a.yearsExperience;
    }

    // Finally by price (cheaper first for accessibility)
    return a.priceCents - b.priceCents;
  });
}

/**
 * Log AI referral for analytics
 */
async function logAIReferral(
  consultationId: string,
  doctorIds: string[]
): Promise<void> {
  try {
    const supabase = createServiceClient();

    await supabase.from('ai_referrals').insert({
      consultation_id: consultationId,
      recommended_doctor_ids: doctorIds,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error logging AI referral:', { error });
    // Non-critical, don't throw
  }
}
