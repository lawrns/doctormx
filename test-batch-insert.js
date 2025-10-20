import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test inserting a small batch like the scraper does
const testDoctors = [
  {
    user_id: randomUUID(),
    cedula: 'BATCH001',
    specialties: ['Medicina General'],
    license_status: 'verified',
    full_name: 'Dr. Test Batch 1',
    bio: 'Test doctor for batch testing',
    rating_avg: 4.5,
    avg_response_sec: 600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: randomUUID(),
    cedula: 'BATCH002', 
    specialties: ['Cardiología'],
    license_status: 'verified',
    full_name: 'Dr. Test Batch 2',
    bio: 'Test doctor for batch testing',
    rating_avg: 4.8,
    avg_response_sec: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const testUsers = testDoctors.map(doctor => ({
  id: doctor.user_id,
  email: `${doctor.user_id}@doctor.mx`,
  name: doctor.full_name,
  role: 'provider',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

async function testBatchInsert() {
  try {
    console.log('Testing batch user insert...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(testUsers)
      .select();
    
    if (userError) {
      console.error('User insert error:', userError);
      return;
    }
    
    console.log('Users inserted successfully:', userData.length);
    
    console.log('Testing batch doctor insert...');
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert(testDoctors)
      .select();
    
    if (doctorError) {
      console.error('Doctor insert error:', doctorError);
    } else {
      console.log('Doctors inserted successfully:', doctorData.length);
    }
    
    // Check if they appear in the API
    console.log('Checking API response...');
    const response = await fetch('http://localhost:3001/api/doctors?limit=2000');
    const data = await response.json();
    const batchDoctors = data.doctors.filter(d => d.cedula.startsWith('BATCH'));
    console.log('Batch doctors in API:', batchDoctors.length);
    batchDoctors.forEach(d => {
      console.log(`- ${d.users.name}: ${d.specialties[0]} (${d.cedula})`);
    });
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

testBatchInsert();
