#!/usr/bin/env node
/**
 * Seed Doctor Availability
 * Create availability slots for doctors
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDoctorAvailability() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Get all doctors
    const doctorsResult = await client.query('SELECT user_id, full_name FROM doctors LIMIT 10');
    console.log(`📊 Found ${doctorsResult.rows.length} doctors\n`);

    // Generate availability for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    for (const doctor of doctorsResult.rows) {
      console.log(`📅 Creating availability for ${doctor.full_name}...`);
      
      const availabilitySlots = [];
      
      // Generate slots for each day
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Skip weekends (optional)
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Generate time slots from 9 AM to 6 PM, every 30 minutes
        for (let hour = 9; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
            const endMinute = minute + 30;
            const endHour = endMinute >= 60 ? hour + 1 : hour;
            const endTimeMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
            const endTime = `${endHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}:00`;
            
            // Randomly make some slots unavailable (30% chance)
            const isAvailable = Math.random() > 0.3;
            
            availabilitySlots.push({
              doctor_id: doctor.user_id,
              date: dateStr,
              start_time: startTime,
              end_time: endTime,
              is_available: isAvailable,
              max_patients: 1,
              current_bookings: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      }
      
      // Insert availability slots for this doctor
      if (availabilitySlots.length > 0) {
        // Insert one by one to avoid complex parameter binding
        for (const slot of availabilitySlots) {
          await client.query(`
            INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available, max_patients, current_bookings, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            slot.doctor_id,
            slot.date,
            slot.start_time,
            slot.end_time,
            slot.is_available,
            slot.max_patients,
            slot.current_bookings,
            slot.created_at,
            slot.updated_at
          ]);
        }
        console.log(`  ✅ Created ${availabilitySlots.length} availability slots`);
      }
    }

    // Check total availability records
    const countResult = await client.query('SELECT COUNT(*) FROM doctor_availability');
    console.log(`\n🎉 Total availability records created: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

seedDoctorAvailability();
