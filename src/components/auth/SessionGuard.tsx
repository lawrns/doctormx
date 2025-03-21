import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SessionGuardProps {
  children: React.ReactNode;
}

/**
 * Component that verifies the auth session before rendering its children
 * This helps prevent UI components from rendering with an invalid session
 */
const SessionGuard: React.FC<SessionGuardProps> = ({ children }) => {
  const { verifySession, user, logout } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  // Verify session on initial render and set up periodic checks
  useEffect(() => {
    let intervalId: number;
    
    const checkSession = async () => {
      if (!user) {
        return; // No need to verify if no user
      }
      
      setIsVerifying(true);
      try {
        const isValid = await verifySession();
        setSessionValid(isValid);
        
        if (!isValid) {
          console.warn('[SessionGuard] Invalid session detected, logging out');
          await logout();
          // No need to redirect, auth system will handle it
        }
      } catch (error) {
        console.error('[SessionGuard] Session verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };
    
    // Check on component mount
    checkSession();
    
    // Set up periodic checks (every 5 minutes)
    // This helps catch session issues before they cause problems
    if (user) {
      intervalId = window.setInterval(checkSession, 5 * 60 * 1000);
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [user, verifySession, logout]);

  if (isVerifying) {
    // You could return a loading indicator here if verification takes time
    return null;
  }

  // Only render children if the session is valid
  return sessionValid ? <>{children}</> : null;
};

export default SessionGuard;