import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { AdminUser, AdminSession } from '../lib/types/admin';
import { jwtDecode } from 'jwt-decode';

interface AdminAuthContextType {
  admin: AdminUser | null;
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check Supabase session
      const { data: { session: supaSession } } = await supabase.auth.getSession();
      
      if (supaSession) {
        // Fetch admin data
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('auth_id', supaSession.user.id)
          .single();

        if (adminError) throw adminError;
        if (adminData) {
          setAdmin(adminData);
          setSession({
            id: supaSession.user.id,
            adminId: adminData.id,
            token: supaSession.access_token,
            expiresAt: new Date(supaSession.expires_at!),
            createdAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Get admin user data
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (adminError || !adminData) {
        throw new Error('Unauthorized access');
      }

      setAdmin(adminData);
      setSession({
        id: authData.session!.user.id,
        adminId: adminData.id,
        token: authData.session!.access_token,
        expiresAt: new Date(authData.session!.expires_at!),
        createdAt: new Date()
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAdmin(null);
      setSession(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    admin,
    session,
    isAuthenticated: !!admin && !!session,
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}