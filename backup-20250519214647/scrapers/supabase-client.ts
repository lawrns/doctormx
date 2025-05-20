import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Read values from .env file directly if process.env is not populated
let supabaseUrl: string;
let supabaseAnonKey: string;

// First, try to get from process.env
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  supabaseUrl = process.env.VITE_SUPABASE_URL;
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
} else {
  // If not available in process.env, read directly from .env file
  try {
    const envPath = path.join(__dirname, '../../../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = dotenv.parse(envContent);
    
    supabaseUrl = envVars.VITE_SUPABASE_URL;
    supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key not found in .env file');
    }
  } catch (error) {
    console.error('Error reading .env file:', error);
    throw error;
  }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized for scraper');
