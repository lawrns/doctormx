// Broadcasts API using Supabase

import { supabase } from '../supabaseClient';
import { getDoctorId, getPatientId } from '../auth/utils';

// Types
export interface Broadcast {
  id: string;
  title: string;
  content: string;
  broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  targetAudience: any;
  category?: string;
  publishedAt: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  doctorId: number;
  analytics: {
    total: number;
    read: number;
    readRate: number;
    likes: number;
  };
}

export interface BroadcastCreateParams {
  title: string;
  content: string;
  broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  targetAudience: any;
  category?: string;
  scheduledFor?: string;
}

// Get all broadcasts for the current doctor
export const getDoctorBroadcasts = async (): Promise<Broadcast[]> => {
  try {
    const doctorId = await getDoctorId();
    
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our interface
    return data.map(broadcast => ({
      id: broadcast.id,
      title: broadcast.title,
      content: broadcast.content,
      broadcastType: broadcast.broadcast_type,
      isUrgent: broadcast.is_urgent,
      targetAudience: broadcast.target_audience,
      category: broadcast.category,
      publishedAt: broadcast.published_at,
      scheduledFor: broadcast.scheduled_for,
      createdAt: broadcast.created_at,
      updatedAt: broadcast.updated_at,
      doctorId: broadcast.doctor_id,
      analytics: broadcast.analytics || {
        total: 0,
        read: 0,
        readRate: 0,
        likes: 0
      }
    }));
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    throw error;
  }
};

// Create a new broadcast
export const createBroadcast = async (params: BroadcastCreateParams): Promise<Broadcast> => {
  try {
    const doctorId = await getDoctorId();
    const now = new Date().toISOString();
    
    const newBroadcast = {
      id: crypto.randomUUID(),
      title: params.title,
      content: params.content,
      broadcast_type: params.broadcastType,
      is_urgent: params.isUrgent,
      target_audience: params.targetAudience,
      category: params.category,
      doctor_id: doctorId,
      published_at: params.scheduledFor ? null : now,
      scheduled_for: params.scheduledFor || null,
      created_at: now,
      updated_at: now,
      analytics: {
        total: 0,
        read: 0,
        readRate: 0,
        likes: 0
      }
    };
    
    const { data, error } = await supabase
      .from('broadcasts')
      .insert([newBroadcast])
      .select()
      .single();
      
    if (error) throw error;
    
    // After creating the broadcast, if it's not scheduled for later, send to patients
    if (!params.scheduledFor) {
      await sendBroadcastToPatients(data.id, params.targetAudience);
    }
    
    // Transform to match our interface
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      broadcastType: data.broadcast_type,
      isUrgent: data.is_urgent,
      targetAudience: data.target_audience,
      category: data.category,
      publishedAt: data.published_at,
      scheduledFor: data.scheduled_for,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      doctorId: data.doctor_id,
      analytics: data.analytics
    };
  } catch (error) {
    console.error('Error creating broadcast:', error);
    throw error;
  }
};

// Delete a broadcast
export const deleteBroadcast = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('broadcasts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    throw error;
  }
};

// Helper function to send broadcasts to patients (this would be implemented as a Supabase function or edge function)
const sendBroadcastToPatients = async (broadcastId: string, targetAudience: any): Promise<void> => {
  try {
    // In a production environment, this would likely be a server-side function
    // that handles the targeting logic and delivery to patients
    
    // For now, we'll simulate this by creating patient_broadcasts records
    const doctorId = await getDoctorId();
    
    // Get the patients based on the target audience criteria
    let patientsQuery = supabase
      .from('doctor_patient_relationships')
      .select('patient_id')
      .eq('doctor_id', doctorId);
      
    // Apply additional filters based on targetAudience
    if (targetAudience.type === 'appointments') {
      // Logic to filter patients with appointments in the date range
      const { startDate, endDate } = targetAudience.data;
      // This would join with appointments table to find matching patients
    } else if (targetAudience.type === 'conditions') {
      // Logic to filter patients by condition
      const { condition } = targetAudience.data;
      // This would join with patient_conditions table to find matching patients
    }
    
    const { data: patients, error } = await patientsQuery;
    
    if (error) throw error;
    
    // Create patient_broadcast records for each patient
    const patientBroadcasts = patients.map(patient => ({
      id: crypto.randomUUID(),
      broadcast_id: broadcastId,
      patient_id: patient.patient_id,
      read: false,
      liked: false,
      created_at: new Date().toISOString()
    }));
    
    if (patientBroadcasts.length > 0) {
      const { error: insertError } = await supabase
        .from('patient_broadcasts')
        .insert(patientBroadcasts);
        
      if (insertError) throw insertError;
      
      // Update the broadcast analytics with the total count
      await supabase
        .from('broadcasts')
        .update({
          analytics: {
            total: patientBroadcasts.length,
            read: 0,
            readRate: 0,
            likes: 0
          }
        })
        .eq('id', broadcastId);
    }
  } catch (error) {
    console.error('Error sending broadcast to patients:', error);
    throw error;
  }
};

// Get broadcasts for a patient
export const getPatientBroadcasts = async (): Promise<any[]> => {
  try {
    const patientId = await getPatientId();
    
    const { data, error } = await supabase
      .from('patient_broadcasts')
      .select(`
        id,
        read,
        liked,
        created_at,
        broadcasts:broadcast_id (
          id,
          title,
          content,
          broadcast_type,
          is_urgent,
          category,
          published_at,
          doctors:doctor_id (
            id,
            name,
            specialty
          )
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to the format expected by the ProviderUpdates component
    return data.map(item => ({
      id: item.broadcasts.id,
      title: item.broadcasts.title,
      content: item.broadcasts.content,
      type: item.broadcasts.broadcast_type,
      isUrgent: item.broadcasts.is_urgent,
      providerName: item.broadcasts.doctors.name,
      providerSpecialty: item.broadcasts.doctors.specialty,
      publishedAt: item.broadcasts.published_at,
      liked: item.liked,
      read: item.read,
      patientBroadcastId: item.id
    }));
  } catch (error) {
    console.error('Error fetching patient broadcasts:', error);
    throw error;
  }
};

// Mark a broadcast as read
export const markBroadcastAsRead = async (patientBroadcastId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('patient_broadcasts')
      .update({ read: true })
      .eq('id', patientBroadcastId);
      
    if (error) throw error;
    
    // The update_broadcast_analytics trigger will handle updating the analytics
  } catch (error) {
    console.error('Error marking broadcast as read:', error);
    throw error;
  }
};

// Toggle like on a broadcast
export const toggleBroadcastLike = async (patientBroadcastId: string, liked: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('patient_broadcasts')
      .update({ liked })
      .eq('id', patientBroadcastId);
      
    if (error) throw error;
    
    // The update_broadcast_analytics trigger will handle updating the analytics
  } catch (error) {
    console.error('Error toggling broadcast like:', error);
    throw error;
  }
};
