#!/usr/bin/env node

/**
 * Sample Doctor Creator
 * 
 * Creates a small sample of high-quality doctors for the directory
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample doctors data
const sampleDoctors = [
  {
    name: 'Dr. María Elena Rodríguez García',
    specialty: 'Medicina General',
    city: 'Ciudad de México',
    state: 'Ciudad de México',
    email: 'maria.rodriguez@doctor.mx',
    phone: '+52 55 1234 5678',
    experience: 15,
    rating: 4.8,
    price: 800,
    bio: 'Especialista en medicina general con más de 15 años de experiencia. Graduada de la UNAM, se especializa en medicina preventiva y atención integral del paciente.',
    university: 'UNAM',
    graduationYear: 2008,
    languages: ['Español', 'Inglés'],
    cedula: '12345678',
    isAvailable: true
  },
  {
    name: 'Dr. Carlos Alberto Martínez López',
    specialty: 'Cardiología',
    city: 'Guadalajara',
    state: 'Jalisco',
    email: 'carlos.martinez@doctor.mx',
    phone: '+52 33 9876 5432',
    experience: 12,
    rating: 4.9,
    price: 1200,
    bio: 'Cardiólogo certificado con especialización en intervencionismo cardíaco. Más de 12 años de experiencia en el tratamiento de enfermedades cardiovasculares.',
    university: 'ITESM',
    graduationYear: 2011,
    languages: ['Español', 'Inglés', 'Francés'],
    cedula: '87654321',
    isAvailable: true
  },
  {
    name: 'Dra. Ana Patricia Hernández Ruiz',
    specialty: 'Dermatología',
    city: 'Monterrey',
    state: 'Nuevo León',
    email: 'ana.hernandez@doctor.mx',
    phone: '+52 81 5555 1234',
    experience: 8,
    rating: 4.7,
    price: 1000,
    bio: 'Dermatóloga especializada en dermatología estética y oncológica. Experiencia en tratamientos láser y cirugía dermatológica.',
    university: 'UANL',
    graduationYear: 2015,
    languages: ['Español', 'Inglés'],
    cedula: '11223344',
    isAvailable: true
  },
  {
    name: 'Dr. Roberto José González Pérez',
    specialty: 'Pediatría',
    city: 'Puebla',
    state: 'Puebla',
    email: 'roberto.gonzalez@doctor.mx',
    phone: '+52 222 7777 8888',
    experience: 20,
    rating: 4.9,
    price: 700,
    bio: 'Pediatra con más de 20 años de experiencia en atención infantil. Especialista en neonatología y medicina del adolescente.',
    university: 'BUAP',
    graduationYear: 2003,
    languages: ['Español'],
    cedula: '55667788',
    isAvailable: true
  },
  {
    name: 'Dra. Laura Beatriz Morales Cruz',
    specialty: 'Ginecología',
    city: 'Tijuana',
    state: 'Baja California',
    email: 'laura.morales@doctor.mx',
    phone: '+52 664 9999 1111',
    experience: 10,
    rating: 4.6,
    price: 900,
    bio: 'Ginecóloga especializada en obstetricia de alto riesgo y cirugía ginecológica mínimamente invasiva.',
    university: 'UABC',
    graduationYear: 2013,
    languages: ['Español', 'Inglés'],
    cedula: '99887766',
    isAvailable: true
  },
  {
    name: 'Dr. Miguel Ángel Torres Sánchez',
    specialty: 'Neurología',
    city: 'Ciudad de México',
    state: 'Ciudad de México',
    email: 'miguel.torres@doctor.mx',
    phone: '+52 55 4444 5555',
    experience: 18,
    rating: 4.8,
    price: 1500,
    bio: 'Neurólogo especializado en epilepsia y trastornos del movimiento. Experiencia en neurofisiología clínica.',
    university: 'IPN',
    graduationYear: 2005,
    languages: ['Español', 'Inglés'],
    cedula: '33445566',
    isAvailable: false
  },
  {
    name: 'Dra. Carmen Elena Vásquez Díaz',
    specialty: 'Oftalmología',
    city: 'Mérida',
    state: 'Yucatán',
    email: 'carmen.vasquez@doctor.mx',
    phone: '+52 999 3333 2222',
    experience: 14,
    rating: 4.7,
    price: 1100,
    bio: 'Oftalmóloga especializada en cirugía de catarata y retina. Experiencia en cirugía refractiva con láser.',
    university: 'UADY',
    graduationYear: 2009,
    languages: ['Español', 'Inglés'],
    cedula: '77889900',
    isAvailable: true
  },
  {
    name: 'Dr. Fernando Luis Jiménez Mendoza',
    specialty: 'Traumatología',
    city: 'León',
    state: 'Guanajuato',
    email: 'fernando.jimenez@doctor.mx',
    phone: '+52 477 6666 7777',
    experience: 16,
    rating: 4.9,
    price: 1300,
    bio: 'Traumatólogo especializado en cirugía de columna y artroscopia. Experiencia en medicina deportiva.',
    university: 'UG',
    graduationYear: 2007,
    languages: ['Español', 'Inglés'],
    cedula: '44556677',
    isAvailable: true
  }
];

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create sample doctors
async function createSampleDoctors() {
  console.log('🏥 Creating sample doctors...');
  
  try {
    for (const doctorData of sampleDoctors) {
      const userId = generateUUID();
      
      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: doctorData.email,
          role: 'provider',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userError) {
        console.error(`❌ Error creating user for ${doctorData.name}:`, userError);
        continue;
      }

      // Create doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: userId,
          cedula: doctorData.cedula,
          specialties: [doctorData.specialty],
          specializations: [doctorData.specialty],
          license_status: 'verified',
          full_name: doctorData.name,
          bio: doctorData.bio,
          consultation_fees: {
            base_fee: doctorData.price,
            currency: 'MXN',
            telemedicine_fee: Math.floor(doctorData.price * 0.8),
            in_person_fee: doctorData.price
          },
          insurance_providers: ['Particular', 'Seguro Popular'],
          rating_avg: doctorData.rating,
          ratings: Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => ({
            rating: Math.floor(Math.random() * 2) + 4,
            review: 'Excelente atención médica',
            patient_name: `Paciente ${i + 1}`,
            date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
          })),
          avg_response_sec: Math.floor(Math.random() * 3600) + 300,
          response_time_avg: Math.floor(Math.random() * 24) + 1,
          availability_slots: doctorData.isAvailable ? [
            { day: 'monday', start_time: '09:00', end_time: '17:00', available: true },
            { day: 'tuesday', start_time: '09:00', end_time: '17:00', available: true },
            { day: 'wednesday', start_time: '09:00', end_time: '17:00', available: true },
            { day: 'thursday', start_time: '09:00', end_time: '17:00', available: true },
            { day: 'friday', start_time: '09:00', end_time: '17:00', available: true }
          ] : [],
          subscription_status: 'active',
          subscription_plan: 'premium',
          sep_verification_details: {
            university: doctorData.university,
            graduation_year: doctorData.graduationYear,
            specialty_certification: doctorData.specialty,
            additional_certifications: doctorData.languages.includes('Inglés') ? ['Certificación Internacional'] : []
          },
          sep_verified_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (doctorError) {
        console.error(`❌ Error creating doctor for ${doctorData.name}:`, doctorError);
        continue;
      }

      // Create doctor specialties
      const { error: specialtyError } = await supabase
        .from('doctor_specialties')
        .insert({
          doctor_id: userId,
          specialty: doctorData.specialty,
          is_primary: true,
          years_experience: doctorData.experience,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (specialtyError) {
        console.error(`❌ Error creating specialty for ${doctorData.name}:`, specialtyError);
      }

      console.log(`✅ Created doctor: ${doctorData.name} - ${doctorData.specialty} in ${doctorData.city}`);
    }

    console.log('🎉 Sample doctors created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample doctors:', error);
  }
}

// Run the script
createSampleDoctors();
