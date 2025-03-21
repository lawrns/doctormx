import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Debug component to monitor auth state when troubleshooting
 * - Add this to your app during development/testing to monitor auth state
 * - Remove or disable in production
 */
const AuthDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
          return;
        }
        
        setSessionInfo({
          hasSession: !!data.session,
          expiresAt: data.session?.expires_at,
          user: data.session?.user?.email || 'No User',
          storage: Object.keys(localStorage)
            .filter(key => key.includes('supabase') || key.includes('doctor'))
            .reduce((obj, key) => {
              obj[key] = localStorage.getItem(key);
              return obj;
            }, {} as Record<string, string | null>)
        });
      } catch (e: any) {
        setError(e.message);
      }
    };
    
    checkSession();
    
    // Recheck every 30 seconds
    const interval = setInterval(checkSession, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!import.meta.env.DEV) {
    return null; // Only show in development mode
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white text-xs rounded-full p-2 shadow-lg"
      >
        {isVisible ? 'Hide Auth Debug' : 'Auth Debug'}
      </button>
      
      {isVisible && (
        <div className="mt-2 p-4 bg-white rounded shadow-xl border border-gray-200 max-w-md text-xs overflow-auto max-h-80">
          <h3 className="font-bold text-sm mb-2">Auth Session Debug</h3>
          
          {error ? (
            <div className="text-red-600 mb-2">{error}</div>
          ) : null}
          
          {sessionInfo ? (
            <div>
              <div className="mb-2">
                <span className="font-semibold">Session:</span> {sessionInfo.hasSession ? 'Active' : 'None'}
              </div>
              
              {sessionInfo.hasSession && (
                <div className="mb-2">
                  <span className="font-semibold">Expires:</span>{' '}
                  {new Date(sessionInfo.expiresAt * 1000).toLocaleString()}
                  {' '}
                  ({Math.floor((sessionInfo.expiresAt - Date.now() / 1000) / 60)} min)
                </div>
              )}
              
              <div className="mb-2">
                <span className="font-semibold">User:</span> {sessionInfo.user}
              </div>
              
              <div>
                <span className="font-semibold">Storage Keys:</span>
                <pre className="mt-1 overflow-x-auto">
                  {JSON.stringify(sessionInfo.storage, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div>Loading session info...</div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                  setSessionInfo(null);
                  alert('Signed out');
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              Force Logout
            </button>
            
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.refreshSession();
                  if (error) {
                    setError(error.message);
                    return;
                  }
                  alert('Session refreshed');
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              Refresh Token
            </button>
            
            <button
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
              onClick={() => {
                localStorage.clear();
                alert('Local storage cleared');
              }}
            >
              Clear Storage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;