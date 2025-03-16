import { supabase } from '../supabaseClient';

// Get the current user auth ID (UUID)
export const getUserAuthId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    throw new Error('Not authenticated');
  }
  
  return data.session.user.id;
};

// Get the doctor ID (bigint) for the current user
export const getDoctorId = async (): Promise<number> => {
  const userAuthId = await getUserAuthId();
  
  const { data, error } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userAuthId)
    .single();
    
  if (error || !data) {
    throw new Error('User is not a doctor');
  }
  
  return data.id;
};

// Get the patient ID (bigint) for the current user
export const getPatientId = async (): Promise<number> => {
  const userAuthId = await getUserAuthId();
  
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userAuthId)
    .single();
    
  if (error || !data) {
    throw new Error('User is not a patient');
  }
  
  return data.id;
};

// Check if the current user is a doctor
export const isDoctor = async (): Promise<boolean> => {
  try {
    const userAuthId = await getUserAuthId();
    
    const { data, error } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', userAuthId)
      .single();
      
    return !error && !!data;
  } catch (error) {
    return false;
  }
};

// Check if the current user is a patient
export const isPatient = async (): Promise<boolean> => {
  try {
    const userAuthId = await getUserAuthId();
    
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userAuthId)
      .single();
      
    return !error && !!data;
  } catch (error) {
    return false;
  }
};
