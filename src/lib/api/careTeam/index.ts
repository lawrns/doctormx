import { supabase } from '../../supabase';
import { Doctor } from '../../types';

export interface CareTeamMember extends Doctor {
  careTeamId: string;
  status: 'active' | 'pending' | 'removed';
  lastInteractionAt?: string;
  upcomingAppointment?: string;
  hasNewUpdates?: boolean;
}

/**
 * Get the current user's care team members
 */
export async function getCareTeamMembers(): Promise<CareTeamMember[]> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get the user's care team members
  const { data, error } = await supabase
    .from('care_team_members')
    .select(`
      id,
      status,
      last_interaction_at,
      doctors:doctor_id (
        id,
        user_id,
        name,
        specialty,
        image,
        bio,
        address,
        is_verified
      )
    `)
    .eq('patient_id', authData.user.id)
    .eq('status', 'active')
    .order('last_interaction_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching care team:', error);
    throw error;
  }
  
  // Get upcoming appointments for these doctors
  const doctorIds = data.map(member => member.doctors.id);
  
  let upcomingAppointments = [];
  if (doctorIds.length > 0) {
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('doctor_id, date')
      .eq('patient_id', authData.user.id)
      .eq('status', 'upcoming')
      .in('doctor_id', doctorIds)
      .gt('date', new Date().toISOString())
      .order('date', { ascending: true });
    
    if (!appointmentsError) {
      upcomingAppointments = appointmentsData || [];
    }
  }
  
  // Check for unread broadcasts from these doctors
  let unreadBroadcasts = [];
  if (doctorIds.length > 0) {
    const { data: broadcastsData, error: broadcastsError } = await supabase
      .from('broadcast_recipients')
      .select(`
        broadcast_id,
        provider_broadcasts:broadcast_id (
          doctor_id
        )
      `)
      .eq('patient_id', authData.user.id)
      .is('read_at', null)
      .is('dismissed_at', null);
    
    if (!broadcastsError) {
      unreadBroadcasts = broadcastsData || [];
    }
  }
  
  // Format the care team members with additional information
  return data.map(member => {
    const doctor = member.doctors;
    
    // Find upcoming appointment for this doctor
    const upcomingAppointment = upcomingAppointments.find(
      app => app.doctor_id === doctor.id
    );
    
    // Check if there are unread broadcasts from this doctor
    const hasNewUpdates = unreadBroadcasts.some(
      broadcast => broadcast.provider_broadcasts.doctor_id === doctor.id
    );
    
    return {
      careTeamId: member.id,
      id: doctor.id,
      userId: doctor.user_id,
      name: doctor.name,
      specialty: doctor.specialty,
      image: doctor.image,
      bio: doctor.bio,
      address: doctor.address,
      verified: doctor.is_verified,
      status: member.status,
      lastInteractionAt: member.last_interaction_at,
      upcomingAppointment: upcomingAppointment?.date,
      hasNewUpdates
    };
  });
}

/**
 * Add a doctor to the current user's care team
 */
export async function addToCareTeam(doctorId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Check if the doctor is already in the care team
  const { data: existingData, error: existingError } = await supabase
    .from('care_team_members')
    .select('id, status')
    .eq('patient_id', authData.user.id)
    .eq('doctor_id', doctorId)
    .maybeSingle();
  
  if (existingError) {
    console.error('Error checking existing care team member:', existingError);
    throw existingError;
  }
  
  if (existingData) {
    // If already exists but removed, update to active
    if (existingData.status === 'removed') {
      const { error: updateError } = await supabase
        .from('care_team_members')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
      
      if (updateError) {
        console.error('Error updating care team member:', updateError);
        throw updateError;
      }
      
      return true;
    }
    
    // Already exists and active
    return true;
  }
  
  // Add new care team member
  const { error: insertError } = await supabase
    .from('care_team_members')
    .insert({
      patient_id: authData.user.id,
      doctor_id: doctorId,
      status: 'active'
    });
  
  if (insertError) {
    console.error('Error adding to care team:', insertError);
    throw insertError;
  }
  
  return true;
}

/**
 * Remove a doctor from the current user's care team
 */
export async function removeFromCareTeam(careTeamId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Update the status to 'removed'
  const { error } = await supabase
    .from('care_team_members')
    .update({
      status: 'removed',
      updated_at: new Date().toISOString()
    })
    .eq('id', careTeamId)
    .eq('patient_id', authData.user.id);
  
  if (error) {
    console.error('Error removing from care team:', error);
    throw error;
  }
  
  return true;
}

/**
 * Message a doctor in the care team
 * This is a placeholder that would integrate with your messaging system
 */
export async function messageDoctor(doctorId: string, message: string): Promise<boolean> {
  // This would integrate with your actual messaging system
  console.log(`Sending message to doctor ${doctorId}: ${message}`);
  
  // Update the last interaction time
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('care_team_members')
    .update({
      last_interaction_at: new Date().toISOString()
    })
    .eq('patient_id', authData.user.id)
    .eq('doctor_id', doctorId);
  
  if (error) {
    console.error('Error updating last interaction:', error);
    // Don't throw, as the message might have been sent
  }
  
  return true;
}
