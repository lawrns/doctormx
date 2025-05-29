import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  doctorId: string | null;
  doctorName: string | null;
  doctorSpecialty: string | null;
  doctorProfileImage: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  verifySession: () => Promise<boolean>; // New method to check session validity
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  const isTestAccount = useRef<boolean>(false);

  // Enhanced session check
  const verifySession = async () => {
    try {
      // Skip verification for test accounts
      if (isTestAccount.current) {
        return true;
      }
      
      // Simple session check using getSession
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

  // Check for active session on mount with improved error handling
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        console.log('[Auth] Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Initial session error:', error);
          throw error;
        }
        
        if (isMounted) {
          setUser(session?.user || null);
          
          if (session?.user) {
            await fetchDoctorProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('[Auth] Error checking auth session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
    // Use a clean subscription approach for auth state changes
    const setupAuthSubscription = () => {
      // Clean up any existing subscription
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
      
      try {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[Auth] Auth state changed:', event);
          
          if (isMounted) {
            setUser(session?.user || null);
            
            if (event === 'SIGNED_IN' && session?.user) {
              await fetchDoctorProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
              setDoctorProfile(null);
              isTestAccount.current = false;
            }
            
            setLoading(false);
          }
        });
        
        authSubscription.current = data.subscription;
      } catch (error) {
        console.error('[Auth] Subscription setup error:', error);
      }
    };
    
    setupAuthSubscription();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (authSubscription.current) {
        console.log('[Auth] Cleaning up auth subscription');
        authSubscription.current.unsubscribe();
      }
    };
  }, []);
  
  // Fetch doctor profile
  const fetchDoctorProfile = async (userId: string) => {
    try {
      // In a real implementation, fetch from Supabase
      // For now, use mock data
      const mockDoctorProfile = {
        id: 'dr_123456',
        userId: userId,
        name: 'Dr. Carlos Méndez',
        specialty: 'Medicina Familiar',
        profileImage: '/doctor-profile.jpg',
        email: 'dr.carlos@example.com',
        phone: '+52 55 1234 5678',
        address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
        licenseNumber: 'MED-12345',
        bio: 'Médico familiar con 10 años de experiencia, especializado en atención preventiva y manejo de enfermedades crónicas.',
        education: [
          'Universidad Nacional Autónoma de México (UNAM) - Medicina General',
          'Hospital General de México - Especialidad en Medicina Familiar'
        ],
        languages: ['Español', 'Inglés'],
        appointmentPrice: 800,
        appointmentDuration: 30,
        workingHours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '15:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' }
        }
      };
      
      setDoctorProfile(mockDoctorProfile);
    } catch (error) {
      console.error('[Auth] Error fetching doctor profile:', error);
    }
  };
  
  // Enhanced login with better test account handling
  const login = async (email: string, password: string) => {
    try {
      console.log(`[Auth] Login attempt with ${email}`);
      
      // Special handling for different test accounts
      if ((email === 'testing@test.com' || email === 'test@test.com') && password.length >= 4) {
        console.log('[Auth] Test credentials detected, using mock account');
        
        const isDoctor = email.toLowerCase() === 'testing@test.com';
        
        // Set up a mock user for the test account
        const mockUser = {
          id: 'test-user-id',
          email: email,
          user_metadata: {
            name: isDoctor ? 'Dr. Test User' : 'Patient Test User'
          }
        };
        
        setUser(mockUser);
        isTestAccount.current = true;
        
        // Only set up doctor profile for the doctor test account
        if (isDoctor) {
          console.log('[Auth] Setting up mock doctor profile');
          const mockDoctorProfile = {
            id: 'dr_test123',
            userId: mockUser.id,
            name: 'Dr. Test User',
            specialty: 'Medicina General',
            profileImage: '',
            email: email,
            phone: '+52 55 1234 5678',
            address: 'Av. Test #123, Ciudad de México',
            licenseNumber: 'TEST-12345',
            bio: 'Doctor de prueba para la plataforma.',
            education: [
              'Universidad de Prueba - Medicina General'
            ],
            languages: ['Español', 'Inglés'],
            appointmentPrice: 800,
            appointmentDuration: 30,
            workingHours: {}
          };
          
          setDoctorProfile(mockDoctorProfile);
        } else {
          console.log('[Auth] Setting up regular patient account');
          // Make sure no doctor profile is set for patient accounts
          setDoctorProfile(null);
        }
        
        console.log('[Auth] Mock user set successfully');
        return { success: true };
      }
      
      // Standard Supabase authentication with improved error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión'
      };
    }
  };
  
  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Google login error:', error);
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión con Google'
      };
    }
  };
  
  // Register new user
  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Create doctor profile
      // In a real implementation, we would create a record in the doctor_profiles table
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Registration error:', error);
      return {
        success: false,
        error: error.message || 'Error al registrarse'
      };
    }
  };
  
  // Enhanced logout with proper cleanup
  const logout = async () => {
    try {
      console.log('[Auth] Logout initiated');
      
      // For test accounts, just clear the state
      if (isTestAccount.current) {
        console.log('[Auth] Logging out test account');
        setUser(null);
        setDoctorProfile(null);
        isTestAccount.current = false;
        return;
      }
      
      // For real accounts, use Supabase signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Force clean state even on error
      setUser(null);
      setDoctorProfile(null);
    }
  };
  
  // Password reset request
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar el correo de recuperación'
      };
    }
  };
  
  // Reset password
  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar la contraseña'
      };
    }
  };
  
  // Update profile
  const updateProfile = async (data: any) => {
    try {
      // Update user metadata if provided
      if (data.name || data.phone) {
        const { error: userError } = await supabase.auth.updateUser({
          data: {
            name: data.name,
            phone: data.phone
          }
        });
        
        if (userError) {
          throw userError;
        }
      }
      
      // Update doctor profile
      // In a real implementation, we would update the doctor_profiles table
      
      // Update local state
      setDoctorProfile((prev: any) => ({
        ...prev,
        ...data
      }));
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar el perfil'
      };
    }
  };
  
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut: logout,
    doctorId: doctorProfile?.id || null,
    doctorName: doctorProfile?.name || null,
    doctorSpecialty: doctorProfile?.specialty || null,
    doctorProfileImage: doctorProfile?.profileImage || null,
    login,
    loginWithGoogle,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    verifySession
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