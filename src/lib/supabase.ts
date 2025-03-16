import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Try to use environment variables first, fallback to hardcoded values if not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

// Ensure we have values for both URL and key
if (!supabaseUrl) {
  console.error('Supabase URL is missing! Check environment variables or config.');
}

if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing! Check environment variables or config.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);