// Care Team API - Supabase implementation

import { supabase } from '../supabaseClient';
import { getPatientId } from '../auth/utils';

// Types
export interface CareTeamMember {
  id: number;
  name: string;
  specialty: string;
  imageUrl?: string;
  lastAppointment?: string;
  nextAppointment?: string;
}

// Get the patient's care team
export const getPatientCareTeam = async (): Promise<CareTeamMember[]> => {
  try {
    const patientId = await getPatientId();
    
    // Get doctor IDs that the patient has a relationship with
    const { data: relationships, error: relationshipsError } = await supabase
      .from('doctor_patient_relationships')
      .select('doctor_id')
      .eq('patient_id', patientId)
      .eq('status', 'active');
      
    if (relationshipsError) throw relationshipsError;
    
    if (!relationships || relationships.length === 0) {
      return [];
    }
    
    const doctorIds = relationships.map(rel => rel.doctor_id);
    
    // Get doctors' information
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select(`
        id,
        name,
        specialty,
        image
      `)
      .in('id', doctorIds);
      
    if (doctorsError) throw doctorsError;
    
    // Get past appointments with these doctors
    const { data: pastAppointments, error: pastApptsError } = await supabase
      .from('appointments')
      .select('doctor_id, scheduled_for')
      .eq('patient_id', patientId)
      .in('doctor_id', doctorIds)
      .lt('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: false })
      .limit(1);
      
    if (pastApptsError) throw pastApptsError;
    
    // Get upcoming appointments with these doctors
    const { data: upcomingAppointments, error: upcomingApptsError } = await supabase
      .from('appointments')
      .select('doctor_id, scheduled_for')
      .eq('patient_id', patientId)
      .in('doctor_id', doctorIds)
      .gt('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(1);
      
    if (upcomingApptsError) throw upcomingApptsError;
    
    // Build care team with appointment info
    return doctors.map(doctor => {
      const lastAppt = pastAppointments?.find(appt => appt.doctor_id === doctor.id);
      const nextAppt = upcomingAppointments?.find(appt => appt.doctor_id === doctor.id);
      
      return {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        imageUrl: doctor.image,
        lastAppointment: lastAppt?.scheduled_for,
        nextAppointment: nextAppt?.scheduled_for
      };
    });
  } catch (error) {
    console.error('Error fetching care team:', error);
    throw error;
  }
};
