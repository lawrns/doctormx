#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Monitor scraper progress
async function monitorScraper() {
  console.log('📊 Doctoralia Scraper Monitor');
  console.log('=============================');
  
  try {
    // Check database count
    const { count: doctorCount, error: doctorError } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true });
    
    if (doctorError) {
      console.error('❌ Error fetching doctor count:', doctorError);
      return;
    }
    
    console.log(`👥 Total doctors in database: ${doctorCount}`);
    
    // Check recent doctors
    const { data: recentDoctors, error: recentError } = await supabase
      .from('doctors')
      .select('full_name, specialties, rating_avg, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      console.error('❌ Error fetching recent doctors:', recentError);
      return;
    }
    
    console.log('\n🆕 Recent doctors added:');
    recentDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.full_name} (${doctor.specialties?.join(', ')}) - Rating: ${doctor.rating_avg}/5`);
    });
    
    // Check images directory
    const imagesDir = path.join('public', 'images', 'doctors');
    if (fs.existsSync(imagesDir)) {
      const countImages = (dir) => {
        let count = 0;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            count += countImages(filePath);
          } else if (file.endsWith('.webp')) {
            count++;
          }
        }
        return count;
      };
      
      const imageCount = countImages(imagesDir);
      console.log(`\n📸 Total images downloaded: ${imageCount}`);
    }
    
    // Check for progress files
    const progressFile = path.join('public', 'data', 'massive_scraping_report.json');
    if (fs.existsSync(progressFile)) {
      const report = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      console.log('\n📈 Scraping Report:');
      console.log(`   Duration: ${report.summary.duration}`);
      console.log(`   Doctors Found: ${report.summary.totalDoctors}`);
      console.log(`   Images Downloaded: ${report.summary.totalImages}`);
      console.log(`   Errors: ${report.summary.totalErrors}`);
      console.log(`   Performance: ${report.performance.doctorsPerSecond} doctors/sec`);
    }
    
    // Check specialties distribution
    const { data: specialtyData, error: specialtyError } = await supabase
      .from('doctors')
      .select('specialties')
      .limit(1000);
    
    if (!specialtyError && specialtyData) {
      const specialtyCounts = {};
      specialtyData.forEach(doctor => {
        if (doctor.specialties) {
          doctor.specialties.forEach(specialty => {
            specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
          });
        }
      });
      
      console.log('\n🏥 Top specialties:');
      Object.entries(specialtyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([specialty, count], index) => {
          console.log(`${index + 1}. ${specialty}: ${count} doctors`);
        });
    }
    
  } catch (error) {
    console.error('❌ Monitor error:', error);
  }
}

// Run monitor
monitorScraper();
