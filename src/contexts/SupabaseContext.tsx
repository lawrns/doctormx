import { createContext, useContext, ReactNode } from 'react';
import { getSupabaseClient } from '../lib/supabase';

const supabase = getSupabaseClient();

type SupabaseContextType = {
  supabase: typeof supabase;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}