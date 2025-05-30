import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { getSupabaseClient } from '../lib/supabase';

const supabase = getSupabaseClient();
import { User } from '@supabase/supabase-js';
import { anonymousConsultationTracker } from '../services/AnonymousConsultationTracker';
import { subscriptionService } from '../services/SubscriptionService';

interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: any;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

interface DoctorProfile {
  id: string;
  auth_user_id: string;
  license_number: string;
  specialty: string;
  subspecialty?: string;
  medical_school?: string;
  years_experience: number;
  languages: string[];
  certifications: any[];
  consultation_fee?: number;
  accepts_insurance: boolean;
  office_address?: any;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  rating: number;
  total_reviews: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  doctorProfile: DoctorProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  createDoctorProfile: (data: Partial<DoctorProfile>) => Promise<{ success: boolean; error?: string }>;
  verifySession: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;

  // Legacy compatibility (for existing components)
  doctorId: string | null;
  doctorName: string | null;
  doctorSpecialty: string | null;
  doctorProfileImage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  // Create or update user profile
  const createUserProfile = async (authUser: User, additionalData?: any): Promise<UserProfile | null> => {
    try {
      const profileData = {
        auth_user_id: authUser.id,
        email: authUser.email!,
        full_name: additionalData?.full_name || authUser.user_metadata?.full_name || '',
        phone: additionalData?.phone || authUser.user_metadata?.phone || '',
        preferences: {
          language: 'es',
          notifications: true,
          ...additionalData?.preferences
        }
      };

      // Try to get existing profile first
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('auth_user_id', authUser.id)
          .select()
          .single();

        if (error) throw error;
        return updatedProfile;
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single();

        if (error) throw error;
        return newProfile;
      }
    } catch (error) {
      console.error('[Auth] Error creating/updating user profile:', error);
      return null;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, this is expected for new users
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[Auth] Error fetching user profile:', error);
      return null;
    }
  };

  // Fetch doctor profile
  const fetchDoctorProfile = async (userId: string): Promise<DoctorProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Doctor profile doesn't exist
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[Auth] Error fetching doctor profile:', error);
      return null;
    }
  };

  // Fetch admin profile
  const fetchAdminProfile = async (userId: string): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Admin profile doesn't exist
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[Auth] Error fetching admin profile:', error);
      return null;
    }
  };

  // Refresh all profiles
  const refreshProfile = async () => {
    if (!user) return;

    const userProf = await fetchUserProfile(user.id);
    const doctorProf = await fetchDoctorProfile(user.id);
    const adminProf = await fetchAdminProfile(user.id);

    setUserProfile(userProf);
    setDoctorProfile(doctorProf);
    setAdminProfile(adminProf);
  };

  // Enhanced session verification
  const verifySession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[Auth] Session verification error:', error);
        return false;
      }

      return !!session;
    } catch (error) {
      console.error('[Auth] Session verification error:', error);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Handle anonymous consultation transition for existing users
      if (data.user) {
        const anonymousUsage = anonymousConsultationTracker.getUsageData();
        if (anonymousUsage.used > 0) {
          await subscriptionService.handleAnonymousToAuthenticatedTransition(
            data.user.id,
            anonymousUsage.used
          );
          // Clear anonymous consultation data
          await anonymousConsultationTracker.mergeWithAuthenticatedUser(data.user.id);
        }
      }

      // Profiles will be loaded by the auth state change handler
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await createUserProfile(data.user, { full_name: name });

        // Handle anonymous consultation transition
        const anonymousUsage = anonymousConsultationTracker.getUsageData();
        if (anonymousUsage.used > 0) {
          await subscriptionService.handleAnonymousToAuthenticatedTransition(
            data.user.id,
            anonymousUsage.used
          );
          // Clear anonymous consultation data
          await anonymousConsultationTracker.mergeWithAuthenticatedUser(data.user.id);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setDoctorProfile(null);
      setAdminProfile(null);
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  };

  const signOut = logout;

  // Forgot password
  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Forgot password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user || !userProfile) {
        throw new Error('No user logged in');
      }

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(updatedProfile);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  // Create doctor profile
  const createDoctorProfile = async (data: Partial<DoctorProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user || !userProfile) {
        throw new Error('No user logged in');
      }

      const doctorData = {
        auth_user_id: user.id,
        user_profile_id: userProfile.id,
        ...data
      };

      const { data: newDoctorProfile, error } = await supabase
        .from('doctor_profiles')
        .insert([doctorData])
        .select()
        .single();

      if (error) throw error;

      setDoctorProfile(newDoctorProfile);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Create doctor profile error:', error);
      return { success: false, error: error.message };
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing authentication...');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Initial session error:', error);
          throw error;
        }

        if (isMounted && session?.user) {
          setUser(session.user);

          // Load user profile
          const userProf = await fetchUserProfile(session.user.id);
          if (userProf) {
            setUserProfile(userProf);
          } else {
            // Create profile if it doesn't exist
            const newProfile = await createUserProfile(session.user);
            setUserProfile(newProfile);
          }

          // Load doctor profile if exists
          const doctorProf = await fetchDoctorProfile(session.user.id);
          setDoctorProfile(doctorProf);

          // Load admin profile if exists
          const adminProf = await fetchAdminProfile(session.user.id);
          setAdminProfile(adminProf);
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event);

      if (isMounted) {
        if (session?.user) {
          setUser(session.user);

          if (event === 'SIGNED_IN') {
            // Load or create profiles
            let userProf = await fetchUserProfile(session.user.id);
            if (!userProf) {
              userProf = await createUserProfile(session.user);
            }
            setUserProfile(userProf);

            const doctorProf = await fetchDoctorProfile(session.user.id);
            setDoctorProfile(doctorProf);

            const adminProf = await fetchAdminProfile(session.user.id);
            setAdminProfile(adminProf);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setDoctorProfile(null);
          setAdminProfile(null);
        }

        setLoading(false);
      }
    });

    authSubscription.current = { unsubscribe: subscription.unsubscribe };

    return () => {
      isMounted = false;
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, []);

  // Computed values
  const isAuthenticated = !!user;
  const isDoctor = !!doctorProfile;
  const isAdmin = !!adminProfile;

  // Legacy compatibility properties
  const doctorId = doctorProfile?.id || null;
  const doctorName = userProfile?.full_name || null;
  const doctorSpecialty = doctorProfile?.specialty || null;
  const doctorProfileImage = null; // To be implemented when image storage is added

  const value: AuthContextType = {
    user,
    userProfile,
    doctorProfile,
    loading,
    isAuthenticated,
    isDoctor,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    logout,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    createDoctorProfile,
    verifySession,
    refreshProfile,

    // Legacy compatibility
    doctorId,
    doctorName,
    doctorSpecialty,
    doctorProfileImage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;