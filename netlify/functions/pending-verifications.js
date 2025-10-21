import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gets all pending verifications
 */
async function getPendingVerifications() {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        user_id,
        cedula,
        verification_status,
        created_at,
        subscription_plan,
        specialties,
        users!inner(name, email)
      `)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending verifications:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    throw error;
  }
}

export async function handler(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  try {
    console.log('📋 Getting pending verifications');
    
    const pendingVerifications = await getPendingVerifications();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: pendingVerifications
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };

  } catch (error) {
    console.error('❌ Error fetching pending verifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}
