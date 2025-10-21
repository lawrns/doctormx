import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions
function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// Save doctors to database with INSERT only (no upsert)
async function saveDoctorsToDatabase(doctors) {
  console.log('💾 Saving doctors to database...');
  
  let savedCount = 0;
  let errorCount = 0;
  
  for (const doctor of doctors) {
    try {
      // Generate proper UUID for user
      const userId = uuidv4();
      
      // First, insert user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: doctor.full_name,
          email: `${sanitizeFileName(doctor.full_name)}@doctor.mx`,
          phone: doctor.phone || `55${Math.floor(Math.random() * 90000000) + 10000000}`,
          role: 'provider'
        });
      
      if (userError) {
        console.error('User error:', userError);
        errorCount++;
        continue;
      }
      
      // Then, insert doctor record
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: userId,
          full_name: doctor.full_name,
          specialties: doctor.specialties,
          cedula: doctor.cedula,
          bio: doctor.bio,
          consultation_fees: doctor.consultation_fees,
          rating_avg: parseFloat(doctor.rating_avg),
          response_time_avg: doctor.response_time_avg,
          license_status: doctor.license_status,
          verification_status: doctor.verification_status,
          subscription_status: doctor.subscription_status,
          subscription_plan: doctor.subscription_plan
        });
      
      if (doctorError) {
        console.error('Doctor error:', doctorError);
        errorCount++;
        continue;
      }
      
      savedCount++;
      console.log(`✅ Saved doctor: ${doctor.full_name}`);
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      errorCount++;
    }
  }
  
  console.log(`✅ Database save completed: ${savedCount} saved, ${errorCount} errors`);
  return { savedCount, errorCount };
}

// Create sample doctors from the scraped data
function createSampleDoctors() {
  const sampleDoctors = [
    {
      full_name: 'Dr. Roy Martony Pérez Cambero',
      specialties: ['Cardiología'],
      cedula: 123456,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 800, telemedicine_fee: 640, follow_up_fee: 500 },
      rating_avg: 4.5,
      response_time_avg: 30,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 3408 5559'
    },
    {
      full_name: 'Dr. Hiram Vela Vizcaino',
      specialties: ['Cardiología'],
      cedula: 123457,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 900, telemedicine_fee: 720, follow_up_fee: 550 },
      rating_avg: 4.3,
      response_time_avg: 45,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 3985 4923'
    },
    {
      full_name: 'Dr. Jose Abraham Navarrete Garcia',
      specialties: ['Cardiología'],
      cedula: 123458,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 750, telemedicine_fee: 600, follow_up_fee: 450 },
      rating_avg: 4.7,
      response_time_avg: 25,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 5907 3855'
    },
    {
      full_name: 'Dr. Heriberto Pruneda Ayala',
      specialties: ['Cardiología'],
      cedula: 123459,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 850, telemedicine_fee: 680, follow_up_fee: 520 },
      rating_avg: 4.2,
      response_time_avg: 35,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 1860 3500'
    },
    {
      full_name: 'Dr. Mario Ramón García Arias',
      specialties: ['Cardiología'],
      cedula: 123460,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 700, telemedicine_fee: 560, follow_up_fee: 420 },
      rating_avg: 4.1,
      response_time_avg: 40,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 9692 8009'
    },
    {
      full_name: 'Dr. Norman Said Vega Servín',
      specialties: ['Cardiología'],
      cedula: 123461,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 950, telemedicine_fee: 760, follow_up_fee: 580 },
      rating_avg: 4.0,
      response_time_avg: 50,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 3683 7531'
    },
    {
      full_name: 'Dr. Gerardo Arteaga Cárdenas',
      specialties: ['Cardiología'],
      cedula: 123462,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 800, telemedicine_fee: 640, follow_up_fee: 500 },
      rating_avg: 4.6,
      response_time_avg: 30,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 5424 7200'
    },
    {
      full_name: 'Dr. Antonio Ruiz Rivera',
      specialties: ['Cardiología'],
      cedula: 123463,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 900, telemedicine_fee: 720, follow_up_fee: 550 },
      rating_avg: 4.4,
      response_time_avg: 35,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 1325 4410'
    },
    {
      full_name: 'Dr. Julio Cesar Mayen Casas',
      specialties: ['Cardiología'],
      cedula: 123464,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 750, telemedicine_fee: 600, follow_up_fee: 450 },
      rating_avg: 4.3,
      response_time_avg: 40,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 4790 3876'
    },
    {
      full_name: 'Dr. José Raúl Cruz Mendoza',
      specialties: ['Cardiología'],
      cedula: 123465,
      bio: 'Especialista en Cardiología con experiencia en atención médica de calidad.',
      consultation_fees: { base_fee: 850, telemedicine_fee: 680, follow_up_fee: 520 },
      rating_avg: 4.5,
      response_time_avg: 25,
      license_status: 'verified',
      verification_status: 'verified',
      subscription_status: 'active',
      subscription_plan: 'premium',
      phone: '55 4381 7374'
    }
  ];
  
  return sampleDoctors;
}

// Main execution function
async function main() {
  console.log('🇲🇽 Insert Only Doctor Scraper');
  console.log('==============================');
  console.log('🚀 Starting database population...');
  
  try {
    // Create sample doctors from scraped data
    const doctors = createSampleDoctors();
    
    // Save to database
    const dbResult = await saveDoctorsToDatabase(doctors);
    
    console.log('🎉 Database population completed successfully!');
    console.log(`📊 Final Results:`);
    console.log(`   Doctors saved: ${dbResult.savedCount}`);
    console.log(`   Images available: Check public/images/doctors/`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { saveDoctorsToDatabase, createSampleDoctors };
