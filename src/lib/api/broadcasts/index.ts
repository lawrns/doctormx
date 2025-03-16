import { supabase } from '../../supabase';

export interface ProviderBroadcast {
  id: string;
  title: string;
  content: string;
  broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  publishedAt: string;
  author: {
    id: string;
    name: string;
    specialty: string;
    image?: string;
    verified: boolean;
  };
  category?: string;
  appointmentId?: string;
  appointmentDate?: string;
  isRead: boolean;
  isDismissed: boolean;
  isLiked: boolean;
  likesCount: number;
}

export interface BroadcastCreateParams {
  title: string;
  content: string;
  broadcastType: 'broadcast' | 'health_tip' | 'appointment_reminder' | 'practice_update';
  isUrgent: boolean;
  targetAudience: {
    type: 'all' | 'appointments' | 'conditions' | 'custom';
    data?: any;
  };
  scheduledFor?: string | null;
  category?: string;
  appointmentId?: string;
}

/**
 * Get broadcasts for the current user
 */
export async function getUserBroadcasts(): Promise<ProviderBroadcast[]> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get broadcasts for the current user
  const { data, error } = await supabase
    .from('broadcast_recipients')
    .select(`
      id,
      broadcast_id,
      read_at,
      dismissed_at,
      liked,
      provider_broadcasts:broadcast_id (
        id,
        title,
        content,
        broadcast_type,
        is_urgent,
        published_at,
        doctor_id,
        target_audience
      )
    `)
    .eq('patient_id', authData.user.id)
    .is('dismissed_at', null)
    .order('provider_broadcasts.published_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching broadcasts:', error);
    throw error;
  }
  
  // Get doctor information for each broadcast
  const doctorIds = [...new Set(data.map(item => item.provider_broadcasts.doctor_id))];
  
  let doctors = [];
  if (doctorIds.length > 0) {
    const { data: doctorsData, error: doctorsError } = await supabase
      .from('doctors')
      .select('id, name, specialty, image, is_verified')
      .in('id', doctorIds);
    
    if (doctorsError) {
      console.error('Error fetching doctors:', doctorsError);
    } else {
      doctors = doctorsData || [];
    }
  }
  
  // Count likes for each broadcast
  const broadcastIds = data.map(item => item.broadcast_id);
  let likeCounts = {};
  
  if (broadcastIds.length > 0) {
    const { data: likesData, error: likesError } = await supabase
      .from('broadcast_recipients')
      .select('broadcast_id, count')
      .in('broadcast_id', broadcastIds)
      .eq('liked', true)
      .group('broadcast_id');
    
    if (!likesError && likesData) {
      likeCounts = likesData.reduce((acc, item) => ({
        ...acc,
        [item.broadcast_id]: item.count
      }), {});
    }
  }
  
  // Format the broadcasts
  return data.map(item => {
    const broadcast = item.provider_broadcasts;
    const doctor = doctors.find(doc => doc.id === broadcast.doctor_id) || {
      id: broadcast.doctor_id,
      name: 'Unknown Doctor',
      specialty: 'Unknown Specialty',
      is_verified: false
    };
    
    // Parse target audience for category and appointment info
    let category = undefined;
    let appointmentId = undefined;
    let appointmentDate = undefined;
    
    if (broadcast.target_audience) {
      try {
        const targetAudience = JSON.parse(broadcast.target_audience);
        if (targetAudience.type === 'conditions' && targetAudience.data) {
          category = targetAudience.data.condition;
        } else if (targetAudience.type === 'appointments' && targetAudience.data) {
          appointmentId = targetAudience.data.appointmentId;
          appointmentDate = targetAudience.data.date;
        }
      } catch (e) {
        console.error('Error parsing target audience:', e);
      }
    }
    
    return {
      id: broadcast.id,
      title: broadcast.title,
      content: broadcast.content,
      broadcastType: broadcast.broadcast_type,
      isUrgent: broadcast.is_urgent,
      publishedAt: broadcast.published_at,
      author: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        image: doctor.image,
        verified: doctor.is_verified
      },
      category,
      appointmentId,
      appointmentDate,
      isRead: !!item.read_at,
      isDismissed: !!item.dismissed_at,
      isLiked: !!item.liked,
      likesCount: likeCounts[broadcast.id] || 0
    };
  });
}

/**
 * Create a new broadcast (for doctors)
 */
export async function createBroadcast(params: BroadcastCreateParams): Promise<string> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get the doctor id for the current user
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', authData.user.id)
    .single();
  
  if (doctorError) {
    console.error('Error fetching doctor:', doctorError);
    throw new Error('User is not a doctor');
  }
  
  // Create the broadcast
  const { data, error } = await supabase
    .from('provider_broadcasts')
    .insert({
      doctor_id: doctorData.id,
      title: params.title,
      content: params.content,
      broadcast_type: params.broadcastType,
      is_urgent: params.isUrgent,
      target_audience: params.targetAudience,
      scheduled_for: params.scheduledFor,
      published_at: params.scheduledFor ? null : new Date().toISOString()
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating broadcast:', error);
    throw error;
  }
  
  // Get patients for this broadcast based on target audience
  let patientIds: string[] = [];
  
  if (params.targetAudience.type === 'all') {
    // Get all patients who have this doctor in their care team
    const { data: patientsData, error: patientsError } = await supabase
      .from('care_team_members')
      .select('patient_id')
      .eq('doctor_id', doctorData.id)
      .eq('status', 'active');
    
    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
    } else {
      patientIds = patientsData.map(p => p.patient_id);
    }
  } else if (params.targetAudience.type === 'appointments' && params.targetAudience.data) {
    // Get patients with appointments in the given date range
    const { startDate, endDate } = params.targetAudience.data;
    
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', doctorData.id)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
    } else {
      patientIds = [...new Set(appointmentsData.map(a => a.patient_id))];
    }
  } else if (params.targetAudience.type === 'conditions' && params.targetAudience.data) {
    // This would require a more complex query involving medical records
    // For simplicity, we'll target all patients in the care team
    const { data: patientsData, error: patientsError } = await supabase
      .from('care_team_members')
      .select('patient_id')
      .eq('doctor_id', doctorData.id)
      .eq('status', 'active');
    
    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
    } else {
      patientIds = patientsData.map(p => p.patient_id);
    }
  } else if (params.targetAudience.type === 'custom' && params.targetAudience.data) {
    // Custom list of patient IDs
    patientIds = params.targetAudience.data.patientIds || [];
  }
  
  // Create broadcast recipients
  if (patientIds.length > 0 && !params.scheduledFor) {
    const recipients = patientIds.map(patientId => ({
      broadcast_id: data.id,
      patient_id: patientId
    }));
    
    const { error: recipientsError } = await supabase
      .from('broadcast_recipients')
      .insert(recipients);
    
    if (recipientsError) {
      console.error('Error creating broadcast recipients:', recipientsError);
      // Don't throw, as the broadcast was created
    }
  }
  
  return data.id;
}

/**
 * Mark a broadcast as read
 */
export async function markBroadcastRead(broadcastId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get the broadcast recipient
  const { data: recipientData, error: recipientError } = await supabase
    .from('broadcast_recipients')
    .select('id')
    .eq('broadcast_id', broadcastId)
    .eq('patient_id', authData.user.id)
    .maybeSingle();
  
  if (recipientError) {
    console.error('Error fetching broadcast recipient:', recipientError);
    throw recipientError;
  }
  
  if (!recipientData) {
    return false; // Broadcast not found for this user
  }
  
  // Update the read_at timestamp
  const { error } = await supabase
    .from('broadcast_recipients')
    .update({
      read_at: new Date().toISOString()
    })
    .eq('id', recipientData.id);
  
  if (error) {
    console.error('Error marking broadcast as read:', error);
    throw error;
  }
  
  return true;
}

/**
 * Dismiss a broadcast
 */
export async function dismissBroadcast(broadcastId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get the broadcast recipient
  const { data: recipientData, error: recipientError } = await supabase
    .from('broadcast_recipients')
    .select('id')
    .eq('broadcast_id', broadcastId)
    .eq('patient_id', authData.user.id)
    .maybeSingle();
  
  if (recipientError) {
    console.error('Error fetching broadcast recipient:', recipientError);
    throw recipientError;
  }
  
  if (!recipientData) {
    return false; // Broadcast not found for this user
  }
  
  // Update the dismissed_at timestamp
  const { error } = await supabase
    .from('broadcast_recipients')
    .update({
      dismissed_at: new Date().toISOString()
    })
    .eq('id', recipientData.id);
  
  if (error) {
    console.error('Error dismissing broadcast:', error);
    throw error;
  }
  
  return true;
}

/**
 * Like or unlike a broadcast
 */
export async function toggleBroadcastLike(broadcastId: string, liked: boolean): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get the broadcast recipient
  const { data: recipientData, error: recipientError } = await supabase
    .from('broadcast_recipients')
    .select('id')
    .eq('broadcast_id', broadcastId)
    .eq('patient_id', authData.user.id)
    .maybeSingle();
  
  if (recipientError) {
    console.error('Error fetching broadcast recipient:', recipientError);
    throw recipientError;
  }
  
  if (!recipientData) {
    return false; // Broadcast not found for this user
  }
  
  // Update the liked status
  const { error } = await supabase
    .from('broadcast_recipients')
    .update({
      liked
    })
    .eq('id', recipientData.id);
  
  if (error) {
    console.error('Error updating broadcast like:', error);
    throw error;
  }
  
  return true;
}

/**
 * Get broadcasts created by a doctor
 */
export async function getDoctorBroadcasts(): Promise<any[]> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('User not authenticated');
  }
  
  // Get the doctor id for the current user
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', authData.user.id)
    .single();
  
  if (doctorError) {
    console.error('Error fetching doctor:', doctorError);
    throw new Error('User is not a doctor');
  }
  
  // Get broadcasts created by this doctor
  const { data, error } = await supabase
    .from('provider_broadcasts')
    .select(`
      id,
      title,
      content,
      broadcast_type,
      is_urgent,
      target_audience,
      scheduled_for,
      published_at,
      created_at
    `)
    .eq('doctor_id', doctorData.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching doctor broadcasts:', error);
    throw error;
  }
  
  // For each broadcast, get analytics
  const result = await Promise.all(data.map(async (broadcast) => {
    // Get recipient counts
    const { count: totalCount, error: totalError } = await supabase
      .from('broadcast_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('broadcast_id', broadcast.id);
    
    const { count: readCount, error: readError } = await supabase
      .from('broadcast_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('broadcast_id', broadcast.id)
      .not('read_at', 'is', null);
    
    const { count: likeCount, error: likeError } = await supabase
      .from('broadcast_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('broadcast_id', broadcast.id)
      .eq('liked', true);
    
    let targetAudienceDescription = 'All patients';
    
    if (broadcast.target_audience) {
      try {
        const targetAudience = JSON.parse(broadcast.target_audience);
        if (targetAudience.type === 'appointments') {
          targetAudienceDescription = 'Patients with upcoming appointments';
        } else if (targetAudience.type === 'conditions') {
          targetAudienceDescription = `Patients with ${targetAudience.data?.condition || 'specific conditions'}`;
        } else if (targetAudience.type === 'custom') {
          targetAudienceDescription = 'Custom patient selection';
        }
      } catch (e) {
        console.error('Error parsing target audience:', e);
      }
    }
    
    return {
      id: broadcast.id,
      title: broadcast.title,
      content: broadcast.content,
      broadcastType: broadcast.broadcast_type,
      isUrgent: broadcast.is_urgent,
      scheduledFor: broadcast.scheduled_for,
      publishedAt: broadcast.published_at,
      createdAt: broadcast.created_at,
      targetAudience: targetAudienceDescription,
      analytics: {
        total: totalCount || 0,
        read: readCount || 0,
        readRate: totalCount ? ((readCount || 0) / totalCount) * 100 : 0,
        likes: likeCount || 0
      }
    };
  }));
  
  return result;
}
