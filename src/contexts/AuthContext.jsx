import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOutUser } from '../lib/supabase.js';

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
    // Obtener usuario actual al cargar la aplicación
    const getUser = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error) {
          // Only log error if it's not just a missing session (which is normal for logged-out users)
          if (error.message !== 'Auth session missing!' && error.name !== 'AuthSessionMissingError') {
            console.error('Error obteniendo usuario:', error);
          }
          // No user logged in is a valid state, just set user to null
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        // Only log unexpected errors that aren't related to missing sessions
        if (error.message !== 'Auth session missing!' && error.name !== 'AuthSessionMissingError') {
          console.error('Error inesperado obteniendo usuario:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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