import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mockDoctors = [
  {
    name: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@test.com',
    phone: '+525512345678',
    cedula: '12345678',
    specialties: ['Medicina General'],
    license_status: 'verified',
    bio: 'Experienced general medicine specialist with 10+ years of practice'
  },
  {
    name: 'Dra. Ana López',
    email: 'ana.lopez@test.com',
    phone: '+525512345679',
    cedula: '87654321',
    specialties: ['Dermatología'],
    license_status: 'verified',
    bio: 'Board-certified dermatologist specializing in skin conditions'
  },
  {
    name: 'Dr. Miguel Torres',
    email: 'miguel.torres@test.com',
    phone: '+525512345680',
    cedula: '11111111',
    specialties: ['Cardiología'],
    license_status: 'verified',
    bio: 'Cardiologist with expertise in heart disease prevention and treatment'
  },
  {
    name: 'Dra. Patricia Ruiz',
    email: 'patricia.ruiz@test.com',
    phone: '+525512345681',
    cedula: '22222222',
    specialties: ['Pediatría'],
    license_status: 'verified',
    bio: 'Pediatrician dedicated to children\'s health and development'
  },
  {
    name: 'Dr. Roberto Silva',
    email: 'roberto.silva@test.com',
    phone: '+525512345682',
    cedula: '33333333',
    specialties: ['Psicología'],
    license_status: 'verified',
    bio: 'Licensed psychologist specializing in mental health and therapy'
  }
];

async function createMockDoctors() {
  console.log('🌱 Creating mock doctors...');

  for (const doctorData of mockDoctors) {
    try {
      // Generate a UUID for the user
      const userId = crypto.randomUUID();
      
      // Insert user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: doctorData.email,
          name: doctorData.name,
          phone: doctorData.phone,
          role: 'patient', // Using 'patient' since 'doctor' enum doesn't exist
          whatsapp_optin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userError) {
        console.error(`Error inserting user for ${doctorData.name}:`, userError);
        continue;
      }

      // Insert doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: userId,
          cedula: doctorData.cedula,
          specialties: doctorData.specialties,
          license_status: doctorData.license_status,
          bio: doctorData.bio,
          rating_avg: 4.0 + Math.random() * 1.0,
          avg_response_sec: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (doctorError) {
        console.error(`Error inserting doctor for ${doctorData.name}:`, doctorError);
        continue;
      }

      console.log(`✅ Created doctor: ${doctorData.name} (${doctorData.specialties.join(', ')})`);
    } catch (error) {
      console.error(`Error processing ${doctorData.name}:`, error);
    }
  }

  console.log('🎉 Mock doctors creation completed!');
}

// Run the creation
createMockDoctors().catch(console.error);

