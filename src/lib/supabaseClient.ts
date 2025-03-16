import { createClient } from '@supabase/supabase-js';

// Read environment variables or use default values for local development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
