import { supabase } from '../../supabase';

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  duration_minutes: number;
  type: 'telemedicine' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  reason?: string;
  notes?: string;
  cancel_reason?: string;
  address?: string;
  meeting_link?: string;
  created_at?: string;
  updated_at?: string;
  // Joined doctor data
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    image?: string;
  };
};

/**
 * Get appointments for the authenticated user
 */
export async function getUserAppointments() {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        name,
        specialty,
        image
      )
    `)
    .eq('patient_id', user.user?.id);
  
  if (error) {
    throw error;
  }
  
  return data as Appointment[];
}

/**
 * Get a specific appointment by ID
 */
export async function getAppointment(appointmentId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        name,
        specialty,
        image
      )
    `)
    .eq('id', appointmentId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Appointment;
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointmentData,
      patient_id: user.user?.id
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Appointment;
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(appointmentId: string, updates: Partial<Appointment>) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Appointment;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string, cancelReason?: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancel_reason: cancelReason
    })
    .eq('id', appointmentId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Appointment;
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(appointmentId: string, newDate: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      date: newDate,
      status: 'rescheduled'
    })
    .eq('id', appointmentId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Appointment;
}

/**
 * Mark an appointment as completed
 */
export async function completeAppointment(appointmentId: string, notes?: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'completed',
      notes: notes
    })
    .eq('id', appointmentId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Appointment;
}

/**
 * Get upcoming appointments for the authenticated user
 */
export async function getUpcomingAppointments() {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        name,
        specialty,
        image
      )
    `)
    .eq('patient_id', user.user?.id)
    .eq('status', 'upcoming')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  return data as Appointment[];
}

/**
 * Get past appointments for the authenticated user
 */
export async function getPastAppointments() {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id,
        name,
        specialty,
        image
      )
    `)
    .eq('patient_id', user.user?.id)
    .in('status', ['completed', 'cancelled', 'no-show'])
    .order('date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data as Appointment[];
}

/**
 * Subscribe to real-time changes for a user's appointments
 */
export function subscribeToUserAppointments(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('appointments-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `patient_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}