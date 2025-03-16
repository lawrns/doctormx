import { supabase } from '../../supabase';

export type Doctor = {
  id: string;
  user_id?: string;
  name: string;
  specialty: string;
  image?: string;
  bio?: string;
  credentials?: any[];
  education?: any[];
  languages?: string[];
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  is_verified: boolean;
  is_accepting_patients: boolean;
  consultation_fee?: number;
  telemedicine_available: boolean;
  in_person_available: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Get all verified doctors
 */
export async function getAllDoctors(options: {
  page?: number;
  limit?: number;
  specialty?: string;
  searchTerm?: string;
} = {}) {
  const {
    page = 1,
    limit = 10,
    specialty,
    searchTerm
  } = options;
  
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('doctors')
    .select('*')
    .eq('is_verified', true)
    .range(offset, offset + limit - 1);
  
  if (specialty) {
    query = query.eq('specialty', specialty);
  }
  
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data as Doctor[];
}

/**
 * Get a specific doctor by ID
 */
export async function getDoctor(doctorId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', doctorId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Doctor;
}

/**
 * Get available appointment slots for a doctor
 */
export async function getDoctorAvailableSlots(doctorId: string, date: string) {
  // In a real implementation, this would query a scheduling system
  // For now, we'll return mock slots
  const slots = [];
  const baseDate = new Date(date);
  
  // Generate slots every 30 minutes from 9am to 5pm
  for (let hour = 9; hour < 17; hour++) {
    for (let minute of [0, 30]) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(hour, minute, 0, 0);
      
      slots.push({
        time: slotDate.toISOString(),
        available: Math.random() > 0.3 // 70% chance of being available
      });
    }
  }
  
  return slots;
}

/**
 * Search for doctors by name, specialty, or location
 */
export async function searchDoctors(searchTerm: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_verified', true)
    .or(`name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
    .limit(20);
  
  if (error) {
    throw error;
  }
  
  return data as Doctor[];
}

/**
 * Get doctors by specialty
 */
export async function getDoctorsBySpecialty(specialty: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_verified', true)
    .eq('specialty', specialty)
    .limit(20);
  
  if (error) {
    throw error;
  }
  
  return data as Doctor[];
}

/**
 * Create or update a doctor profile
 */
export async function updateDoctorProfile(doctorId: string, profileData: Partial<Doctor>) {
  const { data, error } = await supabase
    .from('doctors')
    .update(profileData)
    .eq('id', doctorId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Doctor;
}

/**
 * Get all specialties (to use in filters)
 */
export async function getAllSpecialties() {
  const { data, error } = await supabase
    .from('doctors')
    .select('specialty')
    .eq('is_verified', true)
    .order('specialty');
  
  if (error) {
    throw error;
  }
  
  // Extract unique specialties
  const specialties = [...new Set(data.map(d => d.specialty))];
  return specialties;
}