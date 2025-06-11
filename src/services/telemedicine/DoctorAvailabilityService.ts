import { supabase } from '../../lib/supabase';

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  is_available: boolean;
  consultation_price: number;
  current_capacity: number;
  max_concurrent_consults: number;
  average_response_time: number;
  specialties: string[];
  availability_hours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  last_online: string;
  created_at: string;
  updated_at: string;
}

export class DoctorAvailabilityService {
  
  /**
   * Get doctor's availability status
   */
  static async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability | null> {
    try {
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, create default availability
          return await this.createDefaultAvailability(doctorId);
        }
        throw error;
      }

      return data as DoctorAvailability;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return null;
    }
  }

  /**
   * Create default availability record for new doctor
   */
  static async createDefaultAvailability(doctorId: string): Promise<DoctorAvailability> {
    const defaultAvailability = {
      doctor_id: doctorId,
      is_available: false,
      consultation_price: 50.00,
      current_capacity: 0,
      max_concurrent_consults: 3,
      average_response_time: 120,
      specialties: [],
      availability_hours: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: { start: '10:00', end: '16:00' }
      }
    };

    const { data, error } = await supabase
      .from('doctor_availability')
      .insert([defaultAvailability])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as DoctorAvailability;
  }

  /**
   * Toggle doctor availability status
   */
  static async toggleAvailability(doctorId: string, isAvailable: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('doctor_availability')
        .update({ 
          is_available: isAvailable,
          last_online: new Date().toISOString()
        })
        .eq('doctor_id', doctorId);

      if (error) throw error;

      // If going offline, update any active sessions
      if (!isAvailable) {
        await this.handleDoctorGoingOffline(doctorId);
      }

      return true;
    } catch (error) {
      console.error('Error toggling availability:', error);
      return false;
    }
  }

  /**
   * Update doctor's consultation capacity
   */
  static async updateCapacity(doctorId: string, currentCapacity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('doctor_availability')
        .update({ 
          current_capacity: currentCapacity,
          last_online: new Date().toISOString()
        })
        .eq('doctor_id', doctorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating capacity:', error);
      return false;
    }
  }

  /**
   * Get all available doctors for consultation matching
   */
  static async getAvailableDoctors(specialty?: string): Promise<DoctorAvailability[]> {
    try {
      let query = supabase
        .from('doctor_availability')
        .select(`
          *,
          doctor_profiles!inner(
            nombre_completo,
            especialidad,
            anos_experiencia,
            status,
            verificado
          )
        `)
        .eq('is_available', true)
        .lt('current_capacity', supabase.raw('max_concurrent_consults'))
        .eq('doctor_profiles.status', 'approved')
        .eq('doctor_profiles.verificado', true);

      if (specialty) {
        query = query.contains('specialties', [specialty]);
      }

      const { data, error } = await query.order('average_response_time', { ascending: true });

      if (error) throw error;
      return data as DoctorAvailability[];
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      return [];
    }
  }

  /**
   * Find best available doctor for patient request
   */
  static async findBestAvailableDoctor(
    specialty?: string,
    urgencyLevel: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<DoctorAvailability | null> {
    try {
      const availableDoctors = await this.getAvailableDoctors(specialty);
      
      if (availableDoctors.length === 0) {
        return null;
      }

      // Score doctors based on various factors
      const scoredDoctors = availableDoctors.map(doctor => {
        let score = 100;
        
        // Preference for specialty match
        if (specialty && doctor.specialties.includes(specialty)) {
          score += 50;
        }
        
        // Preference for lower capacity (less busy)
        score -= doctor.current_capacity * 10;
        
        // Preference for faster response time
        score -= doctor.average_response_time / 10;
        
        // Urgency factor
        if (urgencyLevel === 'high') {
          score += (5 - doctor.current_capacity) * 20;
        }

        return { doctor, score };
      });

      // Sort by score and return best match
      scoredDoctors.sort((a, b) => b.score - a.score);
      return scoredDoctors[0].doctor;
    } catch (error) {
      console.error('Error finding best available doctor:', error);
      return null;
    }
  }

  /**
   * Update doctor's availability hours
   */
  static async updateAvailabilityHours(
    doctorId: string, 
    availabilityHours: DoctorAvailability['availability_hours']
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('doctor_availability')
        .update({ availability_hours: availabilityHours })
        .eq('doctor_id', doctorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating availability hours:', error);
      return false;
    }
  }

  /**
   * Check if doctor is within their availability hours
   */
  static isWithinAvailabilityHours(availability: DoctorAvailability): boolean {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

    const daySchedule = availability.availability_hours[dayOfWeek];
    if (!daySchedule) return false;

    return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
  }

  /**
   * Subscribe to real-time availability changes
   */
  static subscribeToAvailabilityChanges(
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('doctor-availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_availability'
        },
        callback
      )
      .subscribe();
  }

  /**
   * Handle doctor going offline - clean up sessions
   */
  private static async handleDoctorGoingOffline(doctorId: string): Promise<void> {
    try {
      // Cancel any waiting sessions
      await supabase
        .from('telemedicine_sessions')
        .update({ status: 'cancelled' })
        .eq('doctor_id', doctorId)
        .eq('status', 'waiting');

      // Update consultation queue
      await supabase
        .from('consultation_queue')
        .update({ status: 'expired' })
        .eq('doctor_id', doctorId)
        .eq('status', 'queued');

    } catch (error) {
      console.error('Error handling doctor going offline:', error);
    }
  }

  /**
   * Get doctor availability statistics
   */
  static async getDoctorStats(doctorId: string): Promise<{
    totalConsultations: number;
    averageRating: number;
    onlineHours: number;
    earnings: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('doctor_metrics')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalConsultations: 0,
          averageRating: 0,
          onlineHours: 0,
          earnings: 0
        };
      }

      const stats = data.reduce((acc, day) => ({
        totalConsultations: acc.totalConsultations + day.total_consultations,
        averageRating: acc.averageRating + day.average_rating,
        onlineHours: acc.onlineHours + day.online_hours,
        earnings: acc.earnings + parseFloat(day.total_earnings)
      }), {
        totalConsultations: 0,
        averageRating: 0,
        onlineHours: 0,
        earnings: 0
      });

      stats.averageRating = stats.averageRating / data.length;

      return stats;
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
      return null;
    }
  }
}