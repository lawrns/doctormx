import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test inserting a few doctors
const testDoctors = [
  {
    user_id: randomUUID(),
    cedula: 'TEST001',
    specialties: ['Medicina General'],
    license_status: 'verified',
    bio: 'Test doctor 1',
    rating_avg: 4.5,
    avg_response_sec: 600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: randomUUID(),
    cedula: 'TEST002', 
    specialties: ['Cardiología'],
    license_status: 'verified',
    bio: 'Test doctor 2',
    rating_avg: 4.8,
    avg_response_sec: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const testUsers = testDoctors.map(doctor => ({
  id: doctor.user_id,
  email: `test-${Date.now()}-${Math.random()}@doctor.mx`,
  role: 'provider',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

async function testInsert() {
  try {
    console.log('Testing user insert...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(testUsers)
      .select();
    
    if (userError) {
      console.error('User insert error:', userError);
      return;
    }
    
    console.log('Users inserted successfully');
    
    console.log('Testing doctor insert...');
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert(testDoctors)
      .select();
    
    if (doctorError) {
      console.error('Doctor insert error:', doctorError);
    } else {
      console.log('Doctors inserted successfully:', doctorData.length);
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

testInsert();
