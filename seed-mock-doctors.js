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
    subscription_status: 'active',
    subscription_id: 'sub_test_123',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_provider: 'stripe',
    last_payment_date: new Date().toISOString(),
    failed_payment_count: 0
  },
  {
    name: 'Dra. Ana López',
    email: 'ana.lopez@test.com',
    phone: '+525512345679',
    cedula: '87654321',
    specialties: ['Dermatología'],
    license_status: 'verified',
    subscription_status: 'active',
    subscription_id: 'sub_test_456',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_provider: 'stripe',
    last_payment_date: new Date().toISOString(),
    failed_payment_count: 0
  },
  {
    name: 'Dr. Miguel Torres',
    email: 'miguel.torres@test.com',
    phone: '+525512345680',
    cedula: '11111111',
    specialties: ['Cardiología'],
    license_status: 'verified',
    subscription_status: 'active',
    subscription_id: 'sub_test_789',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_provider: 'stripe',
    last_payment_date: new Date().toISOString(),
    failed_payment_count: 0
  },
  {
    name: 'Dra. Patricia Ruiz',
    email: 'patricia.ruiz@test.com',
    phone: '+525512345681',
    cedula: '22222222',
    specialties: ['Pediatría'],
    license_status: 'verified',
    subscription_status: 'active',
    subscription_id: 'sub_test_101',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_provider: 'stripe',
    last_payment_date: new Date().toISOString(),
    failed_payment_count: 0
  },
  {
    name: 'Dr. Roberto Silva',
    email: 'roberto.silva@test.com',
    phone: '+525512345682',
    cedula: '33333333',
    specialties: ['Psicología'],
    license_status: 'verified',
    subscription_status: 'active',
    subscription_id: 'sub_test_102',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_provider: 'stripe',
    last_payment_date: new Date().toISOString(),
    failed_payment_count: 0
  }
];

async function seedMockDoctors() {
  console.log('🌱 Seeding mock doctors...');

  for (const doctorData of mockDoctors) {
    try {
      // Try to create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: doctorData.email,
        password: 'TestPassword123',
        email_confirm: true,
        user_metadata: {
          name: doctorData.name,
          phone: doctorData.phone,
          role: 'doctor'
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`User ${doctorData.name} already exists, skipping...`);
          continue;
        }
        console.error(`Error creating user for ${doctorData.name}:`, authError);
        continue;
      }

      // Insert user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: doctorData.email,
          name: doctorData.name,
          phone: doctorData.phone,
          role: 'doctor',
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
          user_id: authData.user.id,
          cedula: doctorData.cedula,
          specialties: doctorData.specialties,
          license_status: doctorData.license_status,
          subscription_status: doctorData.subscription_status,
          subscription_id: doctorData.subscription_id,
          subscription_start_date: doctorData.subscription_start_date,
          subscription_end_date: doctorData.subscription_end_date,
          payment_provider: doctorData.payment_provider,
          last_payment_date: doctorData.last_payment_date,
          failed_payment_count: doctorData.failed_payment_count,
          created_at: new Date().toISOString()
        });

      if (doctorError) {
        console.error(`Error inserting doctor for ${doctorData.name}:`, doctorError);
        continue;
      }

      // Create doctor stats
      const { error: statsError } = await supabase
        .from('doctor_stats')
        .insert({
          doctor_id: authData.user.id,
          total_reviews: Math.floor(Math.random() * 50) + 10,
          average_rating: 4.0 + Math.random() * 1.0,
          five_star_count: Math.floor(Math.random() * 30) + 5,
          four_star_count: Math.floor(Math.random() * 20) + 3,
          three_star_count: Math.floor(Math.random() * 10) + 1,
          two_star_count: Math.floor(Math.random() * 5),
          one_star_count: Math.floor(Math.random() * 3),
          total_consultations: Math.floor(Math.random() * 100) + 20,
          response_time_avg_minutes: Math.floor(Math.random() * 30) + 5,
          professionalism_avg: 4.0 + Math.random() * 1.0,
          clarity_avg: 4.0 + Math.random() * 1.0,
          response_time_avg: 4.0 + Math.random() * 1.0,
          updated_at: new Date().toISOString()
        });

      if (statsError) {
        console.error(`Error creating stats for ${doctorData.name}:`, statsError);
      }

      console.log(`✅ Created doctor: ${doctorData.name} (${doctorData.specialties.join(', ')})`);
    } catch (error) {
      console.error(`Error processing ${doctorData.name}:`, error);
    }
  }

  console.log('🎉 Mock doctors seeding completed!');
}

// Run the seeding
seedMockDoctors().catch(console.error);
