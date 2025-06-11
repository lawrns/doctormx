import { supabase } from '../../lib/supabase';
import { DoctorAvailabilityService, DoctorAvailability } from './DoctorAvailabilityService';

export interface ConsultationRequest {
  id: string;
  patient_id: string;
  urgency_level: 'low' | 'medium' | 'high';
  symptoms: string[];
  description: string;
  preferred_specialty?: string;
  max_wait_time: number;
  status: 'pending' | 'matched' | 'cancelled' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface ConsultationMatch {
  request: ConsultationRequest;
  doctor: DoctorAvailability;
  estimatedWaitTime: number;
  sessionCode: string;
}

export class ConsultationMatchingService {
  
  /**
   * Create a new consultation request
   */
  static async createConsultationRequest(
    patientId: string,
    symptoms: string[],
    description: string,
    urgencyLevel: 'low' | 'medium' | 'high' = 'medium',
    preferredSpecialty?: string,
    maxWaitTime: number = 600
  ): Promise<ConsultationRequest | null> {
    try {
      const requestData = {
        patient_id: patientId,
        urgency_level: urgencyLevel,
        symptoms,
        description,
        preferred_specialty: preferredSpecialty,
        max_wait_time: maxWaitTime,
        status: 'pending',
        expires_at: new Date(Date.now() + maxWaitTime * 1000).toISOString()
      };

      const { data, error } = await supabase
        .from('consultation_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) throw error;

      // Try to match immediately
      const match = await this.findConsultationMatch(data.id);
      if (match) {
        await this.processMatch(match);
      }

      return data as ConsultationRequest;
    } catch (error) {
      console.error('Error creating consultation request:', error);
      return null;
    }
  }

  /**
   * Find the best doctor match for a consultation request
   */
  static async findConsultationMatch(requestId: string): Promise<ConsultationMatch | null> {
    try {
      // Get the consultation request
      const { data: request, error: requestError } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'pending')
        .single();

      if (requestError || !request) {
        console.error('Consultation request not found or not pending:', requestError);
        return null;
      }

      // Find best available doctor
      const doctor = await DoctorAvailabilityService.findBestAvailableDoctor(
        request.preferred_specialty,
        request.urgency_level
      );

      if (!doctor) {
        // Add to queue for next available doctor
        await this.addToQueue(request);
        return null;
      }

      // Calculate estimated wait time
      const estimatedWaitTime = this.calculateWaitTime(doctor, request.urgency_level);

      // Generate session code
      const sessionCode = this.generateSessionCode();

      return {
        request: request as ConsultationRequest,
        doctor,
        estimatedWaitTime,
        sessionCode
      };
    } catch (error) {
      console.error('Error finding consultation match:', error);
      return null;
    }
  }

  /**
   * Process a successful match
   */
  static async processMatch(match: ConsultationMatch): Promise<boolean> {
    try {
      // Start a transaction-like operation
      const { error: updateRequestError } = await supabase
        .from('consultation_requests')
        .update({ status: 'matched' })
        .eq('id', match.request.id);

      if (updateRequestError) throw updateRequestError;

      // Update doctor capacity
      await DoctorAvailabilityService.updateCapacity(
        match.doctor.doctor_id,
        match.doctor.current_capacity + 1
      );

      // Create telemedicine session
      const sessionData = {
        session_code: match.sessionCode,
        doctor_id: match.doctor.doctor_id,
        patient_id: match.request.patient_id,
        consultation_request_id: match.request.id,
        status: 'waiting',
        consultation_fee: match.doctor.consultation_price,
        platform_fee: match.doctor.consultation_price * 0.1,
        doctor_earnings: match.doctor.consultation_price * 0.9
      };

      const { error: sessionError } = await supabase
        .from('telemedicine_sessions')
        .insert([sessionData]);

      if (sessionError) throw sessionError;

      // Send real-time notifications
      await this.notifyParticipants(match);

      return true;
    } catch (error) {
      console.error('Error processing match:', error);
      // Rollback - mark request as pending again
      await supabase
        .from('consultation_requests')
        .update({ status: 'pending' })
        .eq('id', match.request.id);
      return false;
    }
  }

  /**
   * Add consultation request to queue
   */
  static async addToQueue(request: ConsultationRequest): Promise<void> {
    try {
      // Find best potential doctors (even if busy)
      const potentialDoctors = await DoctorAvailabilityService.getAvailableDoctors(
        request.preferred_specialty
      );

      if (potentialDoctors.length === 0) {
        return;
      }

      // Add to queue for the best potential doctor
      const bestDoctor = potentialDoctors[0];
      const queuePosition = await this.getQueuePosition(bestDoctor.doctor_id);
      const estimatedWaitTime = this.calculateQueueWaitTime(bestDoctor, queuePosition);

      await supabase
        .from('consultation_queue')
        .insert([{
          consultation_request_id: request.id,
          doctor_id: bestDoctor.doctor_id,
          queue_position: queuePosition,
          estimated_wait_time: estimatedWaitTime,
          status: 'queued'
        }]);

    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }

  /**
   * Get current queue position for a doctor
   */
  static async getQueuePosition(doctorId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('consultation_queue')
        .select('queue_position')
        .eq('doctor_id', doctorId)
        .eq('status', 'queued')
        .order('queue_position', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data.length > 0 ? data[0].queue_position + 1 : 1;
    } catch (error) {
      console.error('Error getting queue position:', error);
      return 1;
    }
  }

  /**
   * Process queue when doctor becomes available
   */
  static async processQueue(doctorId: string): Promise<void> {
    try {
      // Get next in queue
      const { data: queueItem, error } = await supabase
        .from('consultation_queue')
        .select(`
          *,
          consultation_requests (*)
        `)
        .eq('doctor_id', doctorId)
        .eq('status', 'queued')
        .order('queue_position', { ascending: true })
        .limit(1)
        .single();

      if (error || !queueItem) return;

      const request = queueItem.consultation_requests;
      if (!request || request.status !== 'pending') {
        // Clean up expired queue item
        await supabase
          .from('consultation_queue')
          .update({ status: 'expired' })
          .eq('id', queueItem.id);
        return;
      }

      // Try to create a match
      const doctor = await DoctorAvailabilityService.getDoctorAvailability(doctorId);
      if (!doctor || !doctor.is_available) return;

      const match: ConsultationMatch = {
        request: request as ConsultationRequest,
        doctor,
        estimatedWaitTime: 0,
        sessionCode: this.generateSessionCode()
      };

      const success = await this.processMatch(match);
      if (success) {
        // Update queue item
        await supabase
          .from('consultation_queue')
          .update({ status: 'matched' })
          .eq('id', queueItem.id);
      }

    } catch (error) {
      console.error('Error processing queue:', error);
    }
  }

  /**
   * Cancel consultation request
   */
  static async cancelConsultationRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      // Clean up queue items
      await supabase
        .from('consultation_queue')
        .update({ status: 'expired' })
        .eq('consultation_request_id', requestId);

      return true;
    } catch (error) {
      console.error('Error cancelling consultation request:', error);
      return false;
    }
  }

  /**
   * Get patient's active consultation requests
   */
  static async getPatientRequests(patientId: string): Promise<ConsultationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('patient_id', patientId)
        .in('status', ['pending', 'matched'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ConsultationRequest[];
    } catch (error) {
      console.error('Error fetching patient requests:', error);
      return [];
    }
  }

  /**
   * Get estimated wait time for patient
   */
  static async getEstimatedWaitTime(
    specialty?: string,
    urgencyLevel: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<number> {
    try {
      const availableDoctors = await DoctorAvailabilityService.getAvailableDoctors(specialty);
      
      if (availableDoctors.length === 0) {
        return 1800; // 30 minutes default if no doctors available
      }

      const avgResponseTime = availableDoctors.reduce(
        (sum, doctor) => sum + doctor.average_response_time,
        0
      ) / availableDoctors.length;

      // Adjust based on urgency
      const urgencyMultiplier = {
        'high': 0.5,
        'medium': 1.0,
        'low': 1.5
      };

      return Math.round(avgResponseTime * urgencyMultiplier[urgencyLevel]);
    } catch (error) {
      console.error('Error calculating estimated wait time:', error);
      return 300; // 5 minutes fallback
    }
  }

  /**
   * Subscribe to consultation matching events
   */
  static subscribeToMatching(patientId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`consultation-matching-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultation_requests',
          filter: `patient_id=eq.${patientId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Calculate wait time based on doctor availability
   */
  private static calculateWaitTime(doctor: DoctorAvailability, urgency: string): number {
    let baseTime = doctor.average_response_time;
    
    // Add time based on current capacity
    baseTime += doctor.current_capacity * 60; // 1 minute per active consultation
    
    // Adjust for urgency
    if (urgency === 'high') {
      baseTime *= 0.7;
    } else if (urgency === 'low') {
      baseTime *= 1.3;
    }
    
    return Math.round(baseTime);
  }

  /**
   * Calculate queue wait time
   */
  private static calculateQueueWaitTime(doctor: DoctorAvailability, queuePosition: number): number {
    const avgConsultationTime = 15 * 60; // 15 minutes average
    return doctor.average_response_time + (queuePosition * avgConsultationTime);
  }

  /**
   * Generate unique session code
   */
  private static generateSessionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Send notifications to matched participants
   */
  private static async notifyParticipants(match: ConsultationMatch): Promise<void> {
    try {
      // In a real implementation, this would send push notifications
      // For now, we'll use Supabase real-time channels
      
      const channel = supabase.channel('consultation-notifications');
      
      // Notify doctor
      channel.send({
        type: 'broadcast',
        event: 'new-consultation',
        payload: {
          doctorId: match.doctor.doctor_id,
          sessionCode: match.sessionCode,
          patientSymptoms: match.request.symptoms,
          urgency: match.request.urgency_level
        }
      });

      // Notify patient
      channel.send({
        type: 'broadcast',
        event: 'consultation-matched',
        payload: {
          patientId: match.request.patient_id,
          sessionCode: match.sessionCode,
          doctorName: match.doctor.doctor_id, // In real app, get doctor name
          estimatedWaitTime: match.estimatedWaitTime
        }
      });

    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  /**
   * Clean up expired requests (should be run periodically)
   */
  static async cleanupExpiredRequests(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Mark expired requests
      await supabase
        .from('consultation_requests')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', now);

      // Clean up expired queue items
      await supabase
        .from('consultation_queue')
        .update({ status: 'expired' })
        .eq('status', 'queued')
        .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // 30 minutes old

    } catch (error) {
      console.error('Error cleaning up expired requests:', error);
    }
  }
}