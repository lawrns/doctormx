// Care Team API - Supabase implementation

import { supabase } from '../supabaseClient';
import { getUserId } from '../auth/utils';

// Types
export interface CareTeamMember {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  lastAppointment?: string;
  nextAppointment?: string;
}

// Get the patient's care team
export const getPatientCareTeam = async (): Promise<CareTeamMember[]> => {
  try {
    const patientId = await getUserId();
    
    // Get doctor IDs that the patient has a relationship with
    const { data: relationships, error: relationshipsError } = await supabase
      .from('doctor_patient_relationships')
      .select('doctorId')
      .eq('patientId', patientId)
      .eq('status', 'active');
      
    if (relationshipsError) throw relationshipsError;
    
    if (!relationships || relationships.length === 0) {
      return [];
    }
    
    const doctorIds = relationships.map(rel => rel.doctorId);
    
    // Get doctors' information
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select(`
        id,
        firstName,
        lastName,
        specialty,
        profileImageUrl
      `)
      .in('id', doctorIds);
      
    if (doctorsError) throw doctorsError;
    
    // Get past appointments with these doctors
    const { data: pastAppointments, error: pastApptsError } = await supabase
      .from('appointments')
      .select('doctorId, scheduledFor')
      .eq('patientId', patientId)
      .in('doctorId', doctorIds)
      .lt('scheduledFor', new Date().toISOString())
      .order('scheduledFor', { ascending: false })
      .limit(1);
      
    if (pastApptsError) throw pastApptsError;
    
    // Get upcoming appointments with these doctors
    const { data: upcomingAppointments, error: upcomingApptsError } = await supabase
      .from('appointments')
      .select('doctorId, scheduledFor')
      .eq('patientId', patientId)
      .in('doctorId', doctorIds)
      .gt('scheduledFor', new Date().toISOString())
      .order('scheduledFor', { ascending: true })
      .limit(1);
      
    if (upcomingApptsError) throw upcomingApptsError;
    
    // Build care team with appointment info
    return doctors.map(doctor => {
      const lastAppt = pastAppointments?.find(appt => appt.doctorId === doctor.id);
      const nextAppt = upcomingAppointments?.find(appt => appt.doctorId === doctor.id);
      
      return {
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialty: doctor.specialty,
        imageUrl: doctor.profileImageUrl,
        lastAppointment: lastAppt?.scheduledFor,
        nextAppointment: nextAppt?.scheduledFor
      };
    });
  } catch (error) {
    console.error('Error fetching care team:', error);
    throw error;
  }
};
