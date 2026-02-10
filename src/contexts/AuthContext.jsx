import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOutUser } from '../lib/supabase.js';
import { logger } from '@/lib/observability/logger';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error) {
          if (error.message !== 'Auth session missing!' && error.name !== 'AuthSessionMissingError') {
            console.error('Error obteniendo usuario:', error);
          }
          setUser(null);
        } else {
          // Add verified state (check email confirmed)
          const verifiedUser = {
            ...user,
            isEmailVerified: user.confirmed_at ? true : false
          };
          setUser(verifiedUser);
        }
      } catch (error) {
        if (error.message !== 'Auth session missing!' && error.name !== 'AuthSessionMissingError') {
          console.error('Error inesperado obteniendo usuario:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          const verifiedUser = {
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

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error('Error cerrando sesión:', error);
        throw error;
      }
      setUser(null);
      // Redirigir a la landing page después del logout
      navigate('/');
    } catch (error) {
      console.error('Error inesperado cerrando sesión:', error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value = {
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