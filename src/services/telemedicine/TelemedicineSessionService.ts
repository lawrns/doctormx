import { supabase } from '../../lib/supabase';
import { DoctorAvailabilityService } from './DoctorAvailabilityService';

export interface TelemedicineSession {
  id: string;
  session_code: string;
  doctor_id: string;
  patient_id: string;
  consultation_request_id?: string;
  meeting_link?: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  consultation_fee: number;
  platform_fee: number;
  doctor_earnings: number;
  rating?: number;
  patient_feedback?: string;
  doctor_notes?: string;
  prescription_issued: boolean;
  follow_up_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  id: string;
  name: string;
  type: 'doctor' | 'patient';
  avatar?: string;
  status: 'online' | 'offline';
}

export class TelemedicineSessionService {

  /**
   * Get session by code
   */
  static async getSessionByCode(sessionCode: string): Promise<TelemedicineSession | null> {
    try {
      const { data, error } = await supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('session_code', sessionCode)
        .single();

      if (error) {
        console.error('Session not found:', error);
        return null;
      }

      return data as TelemedicineSession;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId: string): Promise<TelemedicineSession | null> {
    try {
      const { data, error } = await supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Session not found:', error);
        return null;
      }

      return data as TelemedicineSession;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Start a consultation session
   */
  static async startSession(sessionCode: string, userId: string): Promise<boolean> {
    try {
      const session = await this.getSessionByCode(sessionCode);
      if (!session) {
        throw new Error('Session not found');
      }

      // Verify user is participant
      if (session.doctor_id !== userId && session.patient_id !== userId) {
        throw new Error('Unauthorized to join this session');
      }

      // Generate meeting link if needed
      let meetingLink = session.meeting_link;
      if (!meetingLink) {
        meetingLink = await this.generateMeetingLink(sessionCode);
      }

      const updateData: any = {
        status: 'active',
        start_time: new Date().toISOString(),
        meeting_link: meetingLink
      };

      const { error } = await supabase
        .from('telemedicine_sessions')
        .update(updateData)
        .eq('session_code', sessionCode);

      if (error) throw error;

      // Send real-time notification
      await this.notifySessionStart(session);

      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      return false;
    }
  }

  /**
   * Complete a consultation session
   */
  static async completeSession(
    sessionCode: string,
    doctorId: string,
    doctorNotes?: string,
    prescriptionIssued: boolean = false,
    followUpRequired: boolean = false
  ): Promise<boolean> {
    try {
      const session = await this.getSessionByCode(sessionCode);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.doctor_id !== doctorId) {
        throw new Error('Only the doctor can complete the session');
      }

      const endTime = new Date().toISOString();
      const durationMinutes = session.start_time
        ? Math.round((new Date(endTime).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
        : 0;

      const updateData = {
        status: 'completed',
        end_time: endTime,
        duration_minutes: durationMinutes,
        doctor_notes: doctorNotes,
        prescription_issued: prescriptionIssued,
        follow_up_required: followUpRequired
      };

      const { error } = await supabase
        .from('telemedicine_sessions')
        .update(updateData)
        .eq('session_code', sessionCode);

      if (error) throw error;

      // Update doctor capacity
      await DoctorAvailabilityService.updateCapacity(
        doctorId,
        Math.max(0, (session as any).current_capacity - 1)
      );

      // Process next in queue
      setTimeout(() => {
        this.processNextInQueue(doctorId);
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }

  /**
   * Cancel a consultation session
   */
  static async cancelSession(
    sessionCode: string,
    userId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const session = await this.getSessionByCode(sessionCode);
      if (!session) {
        throw new Error('Session not found');
      }

      // Verify user is participant
      if (session.doctor_id !== userId && session.patient_id !== userId) {
        throw new Error('Unauthorized to cancel this session');
      }

      const updateData = {
        status: 'cancelled',
        doctor_notes: reason || 'Session cancelled by user',
        end_time: new Date().toISOString()
      };

      const { error } = await supabase
        .from('telemedicine_sessions')
        .update(updateData)
        .eq('session_code', sessionCode);

      if (error) throw error;

      // If doctor cancelled, update capacity and process queue
      if (session.doctor_id === userId) {
        await DoctorAvailabilityService.updateCapacity(
          userId,
          Math.max(0, (session as any).current_capacity - 1)
        );

        setTimeout(() => {
          this.processNextInQueue(userId);
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error('Error cancelling session:', error);
      return false;
    }
  }

  /**
   * Rate a completed session
   */
  static async rateSession(
    sessionCode: string,
    patientId: string,
    rating: number,
    feedback?: string
  ): Promise<boolean> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const session = await this.getSessionByCode(sessionCode);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.patient_id !== patientId) {
        throw new Error('Only the patient can rate the session');
      }

      if (session.status !== 'completed') {
        throw new Error('Can only rate completed sessions');
      }

      const updateData = {
        rating,
        patient_feedback: feedback
      };

      const { error } = await supabase
        .from('telemedicine_sessions')
        .update(updateData)
        .eq('session_code', sessionCode);

      if (error) throw error;

      // Update doctor's average rating in metrics
      await this.updateDoctorRating(session.doctor_id, rating);

      return true;
    } catch (error) {
      console.error('Error rating session:', error);
      return false;
    }
  }

  /**
   * Get user's sessions (doctor or patient)
   */
  static async getUserSessions(
    userId: string,
    userType: 'doctor' | 'patient',
    status?: TelemedicineSession['status']
  ): Promise<TelemedicineSession[]> {
    try {
      let query = supabase.from('telemedicine_sessions').select('*');

      if (userType === 'doctor') {
        query = query.eq('doctor_id', userId);
      } else {
        query = query.eq('patient_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as TelemedicineSession[];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Get active sessions for a doctor
   */
  static async getDoctorActiveSessions(doctorId: string): Promise<TelemedicineSession[]> {
    try {
      const { data, error } = await supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('doctor_id', doctorId)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TelemedicineSession[];
    } catch (error) {
      console.error('Error fetching doctor active sessions:', error);
      return [];
    }
  }

  /**
   * Get session participants info
   */
  static async getSessionParticipants(sessionCode: string): Promise<SessionParticipant[]> {
    try {
      const session = await this.getSessionByCode(sessionCode);
      if (!session) return [];

      const participants: SessionParticipant[] = [];

      // Get doctor info
      const { data: doctorData } = await supabase
        .from('doctor_profiles')
        .select('nombre_completo, user_id')
        .eq('user_id', session.doctor_id)
        .single();

      if (doctorData) {
        participants.push({
          id: session.doctor_id,
          name: doctorData.nombre_completo,
          type: 'doctor',
          status: 'online' // In real app, check actual online status
        });
      }

      // Get patient info
      const { data: patientData } = await supabase
        .from('auth.users')
        .select('id, email, user_metadata')
        .eq('id', session.patient_id)
        .single();

      if (patientData) {
        participants.push({
          id: session.patient_id,
          name: patientData.user_metadata?.name || patientData.email,
          type: 'patient',
          status: 'online'
        });
      }

      return participants;
    } catch (error) {
      console.error('Error fetching session participants:', error);
      return [];
    }
  }

  /**
   * Subscribe to session updates
   */
  static subscribeToSession(sessionCode: string, callback: (payload: any) => void) {
    return supabase
      .channel(`session-${sessionCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'telemedicine_sessions',
          filter: `session_code=eq.${sessionCode}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to doctor's session updates
   */
  static subscribeToDoctorSessions(doctorId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`doctor-sessions-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telemedicine_sessions',
          filter: `doctor_id=eq.${doctorId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Generate meeting link (placeholder - integrate with video service)
   */
  private static async generateMeetingLink(sessionCode: string): Promise<string> {
    // In a real implementation, this would integrate with:
    // - Jitsi Meet
    // - Agora
    // - WebRTC solution
    // - Zoom SDK
    // For now, return a placeholder
    return `https://meet.doctormx.com/session/${sessionCode}`;
  }

  /**
   * Notify participants of session start
   */
  private static async notifySessionStart(session: TelemedicineSession): Promise<void> {
    try {
      const channel = supabase.channel('session-notifications');
      
      channel.send({
        type: 'broadcast',
        event: 'session-started',
        payload: {
          sessionCode: session.session_code,
          doctorId: session.doctor_id,
          patientId: session.patient_id,
          meetingLink: session.meeting_link
        }
      });

    } catch (error) {
      console.error('Error sending session start notification:', error);
    }
  }

  /**
   * Process next consultation in queue for doctor
   */
  private static async processNextInQueue(doctorId: string): Promise<void> {
    try {
      const { ConsultationMatchingService } = await import('./ConsultationMatchingService');
      await ConsultationMatchingService.processQueue(doctorId);
    } catch (error) {
      console.error('Error processing next in queue:', error);
    }
  }

  /**
   * Update doctor's average rating
   */
  private static async updateDoctorRating(doctorId: string, newRating: number): Promise<void> {
    try {
      // Get current metrics for today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: currentMetrics, error: fetchError } = await supabase
        .from('doctor_metrics')
        .select('average_rating, total_consultations')
        .eq('doctor_id', doctorId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let newAverageRating = newRating;
      
      if (currentMetrics && currentMetrics.total_consultations > 0) {
        // Calculate new average rating
        const totalRating = currentMetrics.average_rating * currentMetrics.total_consultations;
        newAverageRating = (totalRating + newRating) / (currentMetrics.total_consultations + 1);
      }

      // Update metrics
      await supabase
        .from('doctor_metrics')
        .upsert({
          doctor_id: doctorId,
          date: today,
          average_rating: newAverageRating
        }, {
          onConflict: 'doctor_id,date'
        });

    } catch (error) {
      console.error('Error updating doctor rating:', error);
    }
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedToday: number;
    averageRating: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: stats, error } = await supabase
        .from('telemedicine_sessions')
        .select('status, rating, created_at')
        .gte('created_at', `${today}T00:00:00Z`);

      if (error) throw error;

      const totalSessions = stats.length;
      const activeSessions = stats.filter(s => s.status === 'active').length;
      const completedToday = stats.filter(s => s.status === 'completed').length;
      
      const ratingsToday = stats.filter(s => s.rating && s.rating > 0).map(s => s.rating);
      const averageRating = ratingsToday.length > 0
        ? ratingsToday.reduce((sum, rating) => sum + rating, 0) / ratingsToday.length
        : 0;

      return {
        totalSessions,
        activeSessions,
        completedToday,
        averageRating: Math.round(averageRating * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching session stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        completedToday: 0,
        averageRating: 0
      };
    }
  }
}