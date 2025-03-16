import { supabase } from '../../supabase';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
};

export type MedicalRecord = {
  id: string;
  user_id: string;
  allergies?: any[];
  medications?: any[];
  conditions?: any[];
  surgeries?: any[];
  family_history?: any[];
  created_at?: string;
  updated_at?: string;
};

export type InsuranceInfo = {
  id: string;
  user_id: string;
  provider: string;
  policy_number: string;
  group_number?: string;
  coverage_details?: any;
  created_at?: string;
  updated_at?: string;
};

/**
 * Get the currently authenticated user's profile
 */
export async function getCurrentUserProfile() {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('No authenticated user found');
  }
  
  // Get user metadata from auth.users table
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData) {
    throw userError || new Error('User data not found');
  }
  
  // Create a formatted user profile object
  const userProfile: UserProfile = {
    id: userData.user.id,
    name: userData.user.user_metadata?.name || '',
    email: userData.user.email || '',
    phone: userData.user.phone || userData.user.user_metadata?.phone,
    birthdate: userData.user.user_metadata?.birthdate,
    gender: userData.user.user_metadata?.gender,
    address: userData.user.user_metadata?.address,
    created_at: userData.user.created_at,
    updated_at: userData.user.updated_at
  };
  
  return userProfile;
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(profileData: Partial<UserProfile>) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error('No authenticated user found');
  }
  
  // Update user metadata
  const { data, error } = await supabase.auth.updateUser({
    data: {
      name: profileData.name,
      phone: profileData.phone,
      birthdate: profileData.birthdate,
      gender: profileData.gender,
      address: profileData.address
    }
  });
  
  if (error) {
    throw error;
  }
  
  // Return the updated profile
  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || '',
    email: data.user.email || '',
    phone: data.user.phone || data.user.user_metadata?.phone,
    birthdate: data.user.user_metadata?.birthdate,
    gender: data.user.user_metadata?.gender,
    address: data.user.user_metadata?.address,
    created_at: data.user.created_at,
    updated_at: data.user.updated_at
  } as UserProfile;
}

/**
 * Get the user's medical records
 */
export async function getUserMedicalRecords() {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is fine for a new user
    throw error;
  }
  
  return data as MedicalRecord || null;
}

/**
 * Update the user's medical records
 */
export async function updateMedicalRecords(medicalData: Partial<MedicalRecord>) {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('No authenticated user found');
  }

  // Check if medical record exists first
  const { data: existingRecord } = await supabase
    .from('medical_records')
    .select('id')
    .eq('user_id', authData.user.id)
    .single();
  
  let result;
  
  if (existingRecord) {
    // Update existing record
    const { data, error } = await supabase
      .from('medical_records')
      .update(medicalData)
      .eq('user_id', authData.user.id)
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        ...medicalData,
        user_id: authData.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  }
  
  return result as MedicalRecord;
}

/**
 * Get the user's insurance information
 */
export async function getUserInsurance() {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('insurance_info')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is fine for a new user
    throw error;
  }
  
  return data as InsuranceInfo || null;
}

/**
 * Update the user's insurance information
 */
export async function updateInsurance(insuranceData: Partial<InsuranceInfo>) {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    throw new Error('No authenticated user found');
  }

  // Check if insurance info exists first
  const { data: existingRecord } = await supabase
    .from('insurance_info')
    .select('id')
    .eq('user_id', authData.user.id)
    .single();
  
  let result;
  
  if (existingRecord) {
    // Update existing record
    const { data, error } = await supabase
      .from('insurance_info')
      .update(insuranceData)
      .eq('user_id', authData.user.id)
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('insurance_info')
      .insert({
        ...insuranceData,
        user_id: authData.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  }
  
  return result as InsuranceInfo;
}