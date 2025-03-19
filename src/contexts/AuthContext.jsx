import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      try {
        // Replace with your actual auth check logic
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Validate token and get user data
          const userData = await fetchUserData(token);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      // Replace with actual login API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      // Replace with actual register API call
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to fetch user data
  const fetchUserData = async (token) => {
    const response = await fetch('/api/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;