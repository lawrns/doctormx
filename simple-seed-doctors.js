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
  console.log('🌱 Seeding mock doctors directly to database...');

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
          role: 'patient',
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
          bio: `Experienced ${doctorData.specialties.join(', ')} specialist`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (doctorError) {
        console.error(`Error inserting doctor for ${doctorData.name}:`, doctorError);
        continue;
      }

      // Create doctor subscription
      const { error: subscriptionError } = await supabase
        .from('doctor_subscriptions')
        .insert({
          doctor_id: userId,
          subscription_id: doctorData.subscription_id,
          plan_type: 'professional',
          status: doctorData.subscription_status,
          start_date: doctorData.subscription_start_date,
          end_date: doctorData.subscription_end_date,
          payment_provider: doctorData.payment_provider,
          last_payment_date: doctorData.last_payment_date,
          amount: 49900, // $499 MXN in cents
          currency: 'MXN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.error(`Error creating subscription for ${doctorData.name}:`, subscriptionError);
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
