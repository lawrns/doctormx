import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOutUser } from '../lib/supabase.js';
import { logger } from '@/lib/observability/logger';

interface User {
  id: string;
  email?: string;
  confirmed_at?: string | null;
  isEmailVerified?: boolean;
  [key: string]: any;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const getUser = async () => {
      try {
        const { user: currentUser, error } = await getCurrentUser();
        if (!isMounted) return;
        
        if (error) {
          if (error.message !== 'Auth session missing!' && error.name !== 'AuthSessionMissingError') {
            logger.error('Error obteniendo usuario:', error);
          }
          setUser(null);
        } else if (currentUser) {
          // Add verified state (check email confirmed)
          const verifiedUser: User = {
            ...currentUser,
            isEmailVerified: currentUser.confirmed_at ? true : false
          };
          setUser(verifiedUser);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        if (!isMounted) return;
        if (error.message !== 'Auth session missing!' && error.name !== 'AuthSessionMissingError') {
          logger.error('Error inesperado obteniendo usuario:', error);
        }
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event: string, session: any) => {
          if (!isMounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            const verifiedUser: User = {
              ...session.user,
              isEmailVerified: session.user.confirmed_at ? true : false
            };
            setUser(verifiedUser);
            // Navigate based on user type if needed
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            navigate('/login');
          }
        }
      );
      subscription = data?.subscription;
    } catch (error) {
      logger.error('Error setting up auth state change:', error);
    }

    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const logout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOutUser();
      if (error) {
        logger.error('Error cerrando sesión:', error);
        throw error;
      }
      setUser(null);
      // Redirigir a la landing page después del logout
      navigate('/');
    } catch (error) {
      logger.error('Error inesperado cerrando sesión:', error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    logout,
    isLoggingOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
