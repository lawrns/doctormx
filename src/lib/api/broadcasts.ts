// Broadcasts API using Supabase

import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { getUserId } from '../auth/utils';

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
  doctorId: string;
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
    const doctorId = await getUserId();
    
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('doctorId', doctorId)
      .order('createdAt', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our interface
    return data.map(broadcast => ({
      ...broadcast,
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
    const doctorId = await getUserId();
    const now = new Date().toISOString();
    
    const newBroadcast = {
      id: uuidv4(),
      ...params,
      doctorId,
      publishedAt: params.scheduledFor ? null : now,
      scheduledFor: params.scheduledFor || null,
      createdAt: now,
      updatedAt: now,
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
    
    return data;
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
    const doctorId = await getUserId();
    
    // Get the patients based on the target audience criteria
    let patientsQuery = supabase
      .from('doctor_patient_relationships')
      .select('patientId')
      .eq('doctorId', doctorId);
      
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
      id: uuidv4(),
      broadcastId,
      patientId: patient.patientId,
      read: false,
      liked: false,
      createdAt: new Date().toISOString()
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
    const patientId = await getUserId();
    
    const { data, error } = await supabase
      .from('patient_broadcasts')
      .select(`
        id,
        read,
        liked,
        createdAt,
        broadcasts (
          id,
          title,
          content,
          broadcastType,
          isUrgent,
          category,
          publishedAt,
          doctors (
            id,
            firstName,
            lastName,
            specialty
          )
        )
      `)
      .eq('patientId', patientId)
      .order('createdAt', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to the format expected by the ProviderUpdates component
    return data.map(item => ({
      id: item.broadcasts.id,
      title: item.broadcasts.title,
      content: item.broadcasts.content,
      type: item.broadcasts.broadcastType,
      isUrgent: item.broadcasts.isUrgent,
      providerName: `${item.broadcasts.doctors.firstName} ${item.broadcasts.doctors.lastName}`,
      providerSpecialty: item.broadcasts.doctors.specialty,
      publishedAt: item.broadcasts.publishedAt,
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
    
    // This would trigger a Supabase function to update analytics
    await updateBroadcastAnalytics(patientBroadcastId);
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
    
    // This would trigger a Supabase function to update analytics
    await updateBroadcastAnalytics(patientBroadcastId);
  } catch (error) {
    console.error('Error toggling broadcast like:', error);
    throw error;
  }
};

// Helper function to update broadcast analytics
const updateBroadcastAnalytics = async (patientBroadcastId: string): Promise<void> => {
  try {
    // In a production environment, this would be a database trigger or function
    // that calculates and updates the broadcast analytics
    
    // Get the broadcast ID from the patient broadcast
    const { data: patientBroadcast, error } = await supabase
      .from('patient_broadcasts')
      .select('broadcastId')
      .eq('id', patientBroadcastId)
      .single();
      
    if (error) throw error;
    
    // Get analytics data for this broadcast
    const { data: stats, error: statsError } = await supabase
      .from('patient_broadcasts')
      .select('read, liked')
      .eq('broadcastId', patientBroadcast.broadcastId);
      
    if (statsError) throw statsError;
    
    // Calculate new analytics
    const total = stats.length;
    const read = stats.filter(item => item.read).length;
    const likes = stats.filter(item => item.liked).length;
    const readRate = total > 0 ? (read / total) * 100 : 0;
    
    // Update the broadcast analytics
    const { error: updateError } = await supabase
      .from('broadcasts')
      .update({
        analytics: {
          total,
          read,
          readRate,
          likes
        }
      })
      .eq('id', patientBroadcast.broadcastId);
      
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating broadcast analytics:', error);
    throw error;
  }
};
