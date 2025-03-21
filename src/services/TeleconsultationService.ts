// Do not import context hooks directly in a service
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Consultation types
export interface ConsultationRequest {
  doctorId: string;
  patientId: string;
  notes?: string;
  symptoms?: string[];
}

export interface FollowUpRequest {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  type: 'in_person' | 'telemedicine';
  notes?: string;
}

class TeleconsultationService {
  /**
   * Start a teleconsultation with a doctor
   * @param request The consultation request details
   * @returns Promise with the consultation details
   */
  async startConsultation(request: ConsultationRequest) {
    try {
      
      // Check if doctor is available for teleconsultation
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id, telemedicine_available')
        .eq('id', request.doctorId)
        .single();
      
      if (doctorError) throw doctorError;
      
      if (!doctor.telemedicine_available) {
        throw new Error('Este médico no está disponible para telemedicina');
      }
      
      // Create a consultation record
      const meetingId = this.generateMeetingId();
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          doctor_id: request.doctorId,
          patient_id: request.patientId,
          status: 'pending',
          type: 'telemedicine',
          meeting_id: meetingId,
          notes: request.notes || '',
          symptoms: request.symptoms || [],
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (consultationError) throw consultationError;
      
      // Generate a meeting URL
      const meetingUrl = `/telemedicina/consulta/${meetingId}?doctorId=${request.doctorId}`;
      
      // Return the consultation with the meeting URL
      return {
        ...consultation,
        meetingUrl
      };
    } catch (error) {
      console.error('Error starting consultation:', error);
      throw error;
    }
  }
  
  /**
   * Schedule a follow-up appointment with a doctor
   * @param request The follow-up request details
   * @returns Promise with the appointment details
   */
  async scheduleFollowUp(request: FollowUpRequest) {
    try {
      
      // Format the appointment date and time
      const appointmentDateTime = new Date(`${request.date}T${request.time}`);
      const endDateTime = new Date(appointmentDateTime.getTime() + 30 * 60 * 1000); // 30 minutes later
      
      // Create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: request.doctorId,
          patient_id: request.patientId,
          title: `Cita de seguimiento - ${request.type === 'in_person' ? 'Presencial' : 'Telemedicina'}`,
          description: request.notes || 'Cita de seguimiento',
          start_time: appointmentDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: 'scheduled',
          appointment_type: 'follow_up',
          location_type: request.type,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;
      
      return appointment;
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }
  
  /**
   * Get active consultations for a user
   * @param userId The user ID
   * @param isDoctor Whether the user is a doctor
   * @returns Promise with the active consultations
   */
  async getActiveConsultations(userId: string, isDoctor: boolean = false) {
    try {
      
      // Query based on whether the user is a doctor or patient
      const field = isDoctor ? 'doctor_id' : 'patient_id';
      
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*, doctor:doctor_id(*), patient:patient_id(*)')
        .eq(field, userId)
        .in('status', ['pending', 'active'])
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      
      return consultations;
    } catch (error) {
      console.error('Error getting active consultations:', error);
      throw error;
    }
  }
  
  /**
   * Generate a unique meeting ID for teleconsultation
   * @returns A unique meeting ID
   */
  private generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 7) + 
           Math.random().toString(36).substring(2, 7);
  }
}

export default new TeleconsultationService();