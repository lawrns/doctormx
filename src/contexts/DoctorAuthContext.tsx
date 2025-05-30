import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

const supabase = getSupabaseClient();
import { User, Session } from '@supabase/supabase-js';

interface DoctorProfile {
  id: string;
  user_id: string;
  nombre_completo: string;
  especialidad: string;
  cedula_profesional: string;
  telefono: string;
  email: string;
  anos_experiencia: string;
  institucion: string;
  status: 'pending' | 'approved' | 'rejected';
  verificado: boolean;
  created_at: string;
  updated_at: string;
}

interface DoctorAuthContextType {
  user: User | null;
  doctorProfile: DoctorProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, doctorData: Omit<DoctorProfile, 'id' | 'user_id' | 'status' | 'verificado' | 'created_at' | 'updated_at'>) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateDoctorProfile: (updates: Partial<DoctorProfile>) => Promise<{ error: any }>;
  clearError: () => void;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

export const useDoctorAuth = () => {
  const context = useContext(DoctorAuthContext);
  if (context === undefined) {
    throw new Error('useDoctorAuth must be used within a DoctorAuthProvider');
  }
  return context;
};

interface DoctorAuthProviderProps {
  children: React.ReactNode;
}

export const DoctorAuthProvider: React.FC<DoctorAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctor profile from Supabase
  const fetchDoctorProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching doctor profile:', error);
        return null;
      }

      return data as DoctorProfile;
    } catch (err) {
      console.error('Error in fetchDoctorProfile:', err);
      return null;
    }
  };

  // Sign up new doctor
  const signUp = async (
    email: string,
    password: string,
    doctorData: Omit<DoctorProfile, 'id' | 'user_id' | 'status' | 'verificado' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'doctor',
            nombre_completo: doctorData.nombre_completo
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return { user: null, error: authError };
      }

      if (authData.user) {
        // Create doctor profile
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .insert([
            {
              user_id: authData.user.id,
              ...doctorData,
              status: 'pending',
              verificado: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          setError('Error creating doctor profile: ' + profileError.message);
          return { user: null, error: profileError };
        }
      }

      return { user: authData.user, error: null };
    } catch (err: any) {
      setError(err.message);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign in doctor
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (err: any) {
      setError(err.message);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
        setDoctorProfile(null);
        setSession(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  // Update doctor profile
  const updateDoctorProfile = async (updates: Partial<DoctorProfile>) => {
    try {
      if (!user) {
        const error = new Error('No user authenticated');
        setError(error.message);
        return { error };
      }

      const { error } = await supabase
        .from('doctor_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
        return { error };
      }

      // Refresh the profile
      const updatedProfile = await fetchDoctorProfile(user.id);
      if (updatedProfile) {
        setDoctorProfile(updatedProfile);
      }

      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchDoctorProfile(session.user.id).then(profile => {
          setDoctorProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchDoctorProfile(session.user.id);
          setDoctorProfile(profile);
        } else {
          setDoctorProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: DoctorAuthContextType = {
    user,
    doctorProfile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateDoctorProfile,
    clearError
  };

  return (
    <DoctorAuthContext.Provider value={value}>
      {children}
    </DoctorAuthContext.Provider>
  );
};

export default DoctorAuthContext;