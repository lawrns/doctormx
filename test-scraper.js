import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test inserting a single doctor with proper UUID
const userId = randomUUID();
const testDoctor = {
  user_id: userId,
  cedula: 'TEST123456',
  specialties: ['Medicina General'],
  license_status: 'verified',
  bio: 'Test doctor',
  rating_avg: 4.5,
  avg_response_sec: 600,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const testUser = {
  id: userId,
  email: `test-${Date.now()}@doctor.mx`,
  role: 'patient', // Try patient first to see if enum works
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function testInsert() {
  try {
    console.log('Testing user insert...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (userError) {
      console.error('User insert error:', userError);
      return;
    }
    
    console.log('User inserted successfully');
    
    console.log('Testing doctor insert...');
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert(testDoctor)
      .select();
    
    if (doctorError) {
      console.error('Doctor insert error:', doctorError);
    } else {
      console.log('Doctor inserted successfully');
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

testInsert();
