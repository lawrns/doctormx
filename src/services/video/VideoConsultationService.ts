import { supabase } from '../../lib/supabase';

export interface ConsultationType {
  id: string;
  name: string;
  duration_minutes: number;
  price_mxn: number;
  description: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  cedula_profesional: string;
  especialidad: string;
  universidad?: string;
  anos_experiencia: number;
  tarifa_consulta: number;
  disponibilidad: any;
  verificado: boolean;
  full_name?: string;
  profile_image?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_consulta: string;
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada';
  precio: number;
  agora_channel_id?: string;
  notas_medicas?: string;
  created_at: string;
}

export interface AgoraTokenResponse {
  token: string;
  appId: string;
  channelName: string;
  uid: string;
  expirationTime: number;
  role: string;
}

export class VideoConsultationService {
  
  /**
   * Get available consultation types
   */
  static async getConsultationTypes(): Promise<ConsultationType[]> {
    // For now, return hardcoded types based on your plan
    return [
      {
        id: 'urgente',
        name: 'Consulta Urgente',
        duration_minutes: 15,
        price_mxn: 500,
        description: 'Consulta médica urgente para casos que requieren atención inmediata'
      },
      {
        id: 'programada',
        name: 'Consulta Programada',
        duration_minutes: 30,
        price_mxn: 800,
        description: 'Consulta médica programada con tiempo completo para evaluación'
      },
      {
        id: 'seguimiento',
        name: 'Consulta de Seguimiento',
        duration_minutes: 45,
        price_mxn: 600,
        description: 'Consulta de seguimiento para pacientes con tratamiento en curso'
      }
    ];
  }

  /**
   * Get available doctors
   */
  static async getAvailableDoctors(): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles:user_id (
            full_name,
            profile_image
          )
        `)
        .eq('verificado', true);

      if (error) {
        console.error('[VideoConsultation] Error fetching doctors:', error);
        throw new Error('Failed to fetch available doctors');
      }

      return data || [];
    } catch (error) {
      console.error('[VideoConsultation] Error in getAvailableDoctors:', error);
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: {
    doctor_id: string;
    fecha_hora: string;
    tipo_consulta: string;
    duracion_minutos: number;
    precio: number;
  }): Promise<Appointment> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Generate unique channel ID for Agora
      const channelId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: appointmentData.doctor_id,
          fecha_hora: appointmentData.fecha_hora,
          duracion_minutos: appointmentData.duracion_minutos,
          tipo_consulta: appointmentData.tipo_consulta,
          precio: appointmentData.precio,
          agora_channel_id: channelId,
          estado: 'programada'
        })
        .select()
        .single();

      if (error) {
        console.error('[VideoConsultation] Error creating appointment:', error);
        throw new Error('Failed to create appointment');
      }

      return data;
    } catch (error) {
      console.error('[VideoConsultation] Error in createAppointment:', error);
      throw error;
    }
  }

  /**
   * Get user's appointments
   */
  static async getUserAppointments(userId?: string): Promise<Appointment[]> {
    try {
      // Get current user if userId not provided
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors (
            cedula_profesional,
            especialidad,
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq('patient_id', targetUserId)
        .order('fecha_hora', { ascending: true });

      if (error) {
        console.error('[VideoConsultation] Error fetching appointments:', error);
        throw new Error('Failed to fetch appointments');
      }

      return data || [];
    } catch (error) {
      console.error('[VideoConsultation] Error in getUserAppointments:', error);
      throw error;
    }
  }

  /**
   * Get doctor's appointments
   */
  static async getDoctorAppointments(doctorId?: string): Promise<Appointment[]> {
    try {
      // Get current user if doctorId not provided
      let targetDoctorId = doctorId;
      if (!targetDoctorId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }

        // Get doctor profile for current user
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorError || !doctorData) {
          throw new Error('Doctor profile not found');
        }

        targetDoctorId = doctorData.id;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey (
            full_name
          )
        `)
        .eq('doctor_id', targetDoctorId)
        .order('fecha_hora', { ascending: true });

      if (error) {
        console.error('[VideoConsultation] Error fetching doctor appointments:', error);
        throw new Error('Failed to fetch doctor appointments');
      }

      return data || [];
    } catch (error) {
      console.error('[VideoConsultation] Error in getDoctorAppointments:', error);
      throw error;
    }
  }

  /**
   * Generate Agora token for video call
   */
  static async generateAgoraToken(
    channelName: string, 
    uid: string, 
    role: 'publisher' | 'audience' = 'publisher'
  ): Promise<AgoraTokenResponse> {
    try {
      const response = await fetch('/.netlify/functions/generate-agora-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          uid,
          role,
          expirationTimeInSeconds: 3600 // 1 hour
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video token');
      }

      const tokenData = await response.json();
      return tokenData;
    } catch (error) {
      console.error('[VideoConsultation] Error generating Agora token:', error);
      throw error;
    }
  }

  /**
   * Start a video consultation
   */
  static async startConsultation(appointmentId: string): Promise<{
    appointment: Appointment;
    tokenData: AgoraTokenResponse;
  }> {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        throw new Error('Appointment not found');
      }

      // Update appointment status to 'en_curso'
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ estado: 'en_curso' })
        .eq('id', appointmentId);

      if (updateError) {
        console.error('[VideoConsultation] Error updating appointment status:', updateError);
      }

      // Generate Agora token
      const tokenData = await this.generateAgoraToken(
        appointment.agora_channel_id,
        appointment.patient_id
      );

      return {
        appointment,
        tokenData
      };
    } catch (error) {
      console.error('[VideoConsultation] Error starting consultation:', error);
      throw error;
    }
  }

  /**
   * End a video consultation
   */
  static async endConsultation(appointmentId: string, medicalNotes?: string): Promise<void> {
    try {
      const updateData: any = { estado: 'completada' };
      if (medicalNotes) {
        updateData.notas_medicas = medicalNotes;
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) {
        console.error('[VideoConsultation] Error ending consultation:', error);
        throw new Error('Failed to end consultation');
      }
    } catch (error) {
      console.error('[VideoConsultation] Error in endConsultation:', error);
      throw error;
    }
  }
}

export default VideoConsultationService;
