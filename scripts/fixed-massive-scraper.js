import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive Mexican states and major cities
const LOCATIONS = [
  { state: 'Ciudad de México', cities: ['ciudad-de-mexico', 'alvaro-obregon', 'benito-juarez', 'coyoacan', 'cuauhtemoc', 'gustavo-a-madero', 'iztacalco', 'iztapalapa', 'miguel-hidalgo', 'tlalpan'] },
  { state: 'Jalisco', cities: ['guadalajara', 'zapopan', 'tlaquepaque', 'tonala', 'puerto-vallarta', 'tepatitlan'] },
  { state: 'Nuevo León', cities: ['monterrey', 'guadalupe', 'san-nicolas', 'apodaca', 'escobedo', 'santa-catarina'] },
  { state: 'Puebla', cities: ['puebla', 'tehuacan', 'san-martin-texmelucan', 'cholula'] },
  { state: 'Guanajuato', cities: ['leon', 'guanajuato', 'irapuato', 'celaya', 'salamanca', 'san-miguel-de-allende'] },
  { state: 'Veracruz', cities: ['xalapa', 'veracruz', 'coatzacoalcos', 'poza-rica', 'cordoba'] },
  { state: 'Yucatán', cities: ['merida', 'valladolid', 'progreso'] },
  { state: 'Quintana Roo', cities: ['cancun', 'playa-del-carmen', 'chetumal', 'cozumel'] },
  { state: 'Baja California', cities: ['tijuana', 'mexicali', 'ensenada', 'rosarito'] },
  { state: 'Chihuahua', cities: ['chihuahua', 'juarez', 'cuauhtemoc', 'delicias'] },
  { state: 'Sonora', cities: ['hermosillo', 'ciudad-obregon', 'nogales', 'guaymas'] },
  { state: 'Coahuila', cities: ['saltillo', 'torreon', 'monclova', 'piedras-negras'] },
  { state: 'Tamaulipas', cities: ['tampico', 'reynosa', 'matamoros', 'nuevo-laredo'] },
  { state: 'Sinaloa', cities: ['culiacan', 'mazatlan', 'los-mochis', 'guasave'] },
  { state: 'Michoacán', cities: ['morelia', 'uruapan', 'zamora', 'apatzingan'] },
  { state: 'Oaxaca', cities: ['oaxaca', 'tuxtepec', 'salina-cruz', 'juchitan'] },
  { state: 'Chiapas', cities: ['tuxtla-gutierrez', 'san-cristobal-de-las-casas', 'tapachula'] },
  { state: 'Tabasco', cities: ['villahermosa', 'cardenas', 'comalcalco'] },
  { state: 'Campeche', cities: ['campeche', 'ciudad-del-carmen'] },
  { state: 'Aguascalientes', cities: ['aguascalientes'] },
  { state: 'Colima', cities: ['colima', 'manzanillo', 'tecoman'] },
  { state: 'Durango', cities: ['durango', 'gomez-palacio', 'lerdo'] },
  { state: 'Guerrero', cities: ['chilpancingo', 'acapulco', 'iguala', 'taxco'] },
  { state: 'Hidalgo', cities: ['pachuca', 'tulancingo', 'tula'] },
  { state: 'México', cities: ['toluca', 'ecatepec', 'nezahualcoyotl', 'naucalpan', 'tlalnepantla'] },
  { state: 'Morelos', cities: ['cuernavaca', 'jiutepec', 'cuautla', 'temixco'] },
  { state: 'Nayarit', cities: ['tepic', 'compostela', 'bahia-de-banderas'] },
  { state: 'Querétaro', cities: ['queretaro', 'san-juan-del-rio', 'corregidora'] },
  { state: 'San Luis Potosí', cities: ['san-luis-potosi', 'soledad', 'ciudad-valles'] },
  { state: 'Tlaxcala', cities: ['tlaxcala', 'apizaco', 'chiautempan'] },
  { state: 'Zacatecas', cities: ['zacatecas', 'fresnillo', 'guadalupe'] }
];

// Comprehensive specialty list
const SPECIALTIES = [
  'medicina-general',
  'cardiologo',
  'dermatologo',
  'ginecologo',
  'pediatra',
  'psiquiatra',
  'neurologo',
  'oftalmologo',
  'otorrinolaringologo',
  'traumatologo',
  'urologo',
  'gastroenterologo',
  'endocrinologo',
  'neumologo',
  'oncologo',
  'anestesiologo',
  'cirujano-general',
  'cirujano-plastico',
  'medicina-interna',
  'radiologo',
  'medicina-familiar',
  'geriatra',
  'infectologo',
  'nefrologo',
  'reumatologo',
  'hematologo',
  'alergologo',
  'inmunologo',
  'medicina-del-trabajo',
  'medicina-deportiva',
  'medicina-estetica',
  'nutriologo',
  'psicologo',
  'terapeuta-fisico',
  'dentista',
  'ortodoncista',
  'periodoncista',
  'endodoncista',
  'cirujano-oral',
  'prostodoncista'
];

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerSecond: 1,
  delayBetweenRequests: 2000, // ms
  delayBetweenBatches: 10000, // ms
  maxConcurrentRequests: 1
};

// Scraping statistics
let stats = {
  totalDoctors: 0,
  totalImages: 0,
  totalErrors: 0,
  startTime: Date.now(),
  processedSpecialties: 0,
  processedLocations: 0
};

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function generateUniquePhone() {
  return `55${Math.floor(Math.random() * 90000000) + 10000000}`;
}

function generateUniqueEmail(name) {
  const baseName = sanitizeFileName(name);
  const randomSuffix = Math.floor(Math.random() * 100000);
  return `${baseName}_${randomSuffix}@doctor.mx`;
}

// Fix rating to be within database limits (0-10)
function fixRating(rating) {
  if (!rating) return 4.5;
  if (rating > 10) return Math.min(10, rating / 100); // Convert large numbers to 0-10 scale
  if (rating < 0) return 4.5;
  return Math.min(10, Math.max(0, rating));
}

function createDirectories() {
  console.log('📁 Creating comprehensive directory structure...');
  
  LOCATIONS.forEach(location => {
    location.cities.forEach(city => {
      const dirPath = path.join('public', 'images', 'doctors', location.state, city);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  });
  
  console.log('✅ Directory structure created successfully!');
}

// Image download function
async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        fs.unlink(filePath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Massive scraper to extract thousands of doctors
async function scrapeMassiveDoctorData() {
  console.log('🔍 Starting MASSIVE Doctoralia scraping...');
  console.log(`📊 Target: ${LOCATIONS.length} states, ${SPECIALTIES.length} specialties`);
  console.log(`🎯 Estimated total combinations: ${LOCATIONS.length * SPECIALTIES.length}`);
  
  const browser = await puppeteer.launch({
    headless: true, // Set to false to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allDoctors = [];
  
  try {
    for (const location of LOCATIONS) {
      for (const city of location.cities) {
        for (const specialty of SPECIALTIES) {
          try {
            console.log(`🔍 Scraping ${specialty} in ${city}, ${location.state}...`);
            
            const page = await browser.newPage();
            
            // Set user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Navigate to Doctoralia search page
            const searchUrl = `https://www.doctoralia.com.mx/${specialty}/${city}`;
            
            console.log(`🌐 Navigating to: ${searchUrl}`);
            
            await page.goto(searchUrl, { 
              waitUntil: 'networkidle2',
              timeout: 30000 
            });
            
            // Wait for page to load
            await delay(3000);
            
            // Extract doctor information
            const doctors = await page.evaluate(() => {
              const doctors = [];
              
              // Look for all links on the page
              const links = document.querySelectorAll('a');
              
              links.forEach(link => {
                const text = link.textContent.trim();
                const href = link.href;
                
                // Check if this looks like a doctor link
                if (text && text.length > 3 && text.length < 100 && 
                    (text.includes('Dr.') || text.includes('Dra.') || text.includes('Doctor') || text.includes('Doctora'))) {
                  doctors.push({
                    name: text,
                    profileUrl: href,
                    element: link.outerHTML.substring(0, 200)
                  });
                }
              });
              
              return doctors;
            });
            
            console.log(`✅ Found ${doctors.length} potential doctor links`);
            
            // Process each doctor (limit to first 3 per specialty/city to avoid overwhelming)
            for (let i = 0; i < Math.min(doctors.length, 3); i++) {
              const doctor = doctors[i];
              console.log(`\n👨‍⚕️ Processing doctor ${i + 1}: ${doctor.name}`);
              
              try {
                // Navigate to doctor profile
                await page.goto(doctor.profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await delay(2000);
                
                // Extract profile information
                const profileInfo = await page.evaluate(() => {
                  const info = {
                    name: null,
                    specialty: null,
                    location: null,
                    phone: null,
                    image: null,
                    rating: null,
                    address: null,
                    bio: null
                  };
                  
                  // Try to find name in various places
                  const nameSelectors = ['h1', 'h2', '.name', '.doctor-name', '.title', '.profile-name'];
                  for (const selector of nameSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                      info.name = element.textContent.trim();
                      break;
                    }
                  }
                  
                  // Try to find image
                  const imageSelectors = ['img', '.photo', '.avatar', '.profile-image', '.doctor-image'];
                  for (const selector of imageSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.src && !element.src.includes('logo') && !element.src.includes('icon')) {
                      info.image = element.src;
                      break;
                    }
                  }
                  
                  // Try to find phone
                  const phoneSelectors = ['.phone', '.telephone', '.contact', '.tel', '[href^="tel:"]'];
                  for (const selector of phoneSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                      const phoneText = element.textContent.trim() || element.href;
                      if (phoneText && phoneText.includes('55')) {
                        info.phone = phoneText;
                        break;
                      }
                    }
                  }
                  
                  // Try to find rating
                  const ratingSelectors = ['.rating', '.score', '.stars', '.review', '.evaluation'];
                  for (const selector of ratingSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                      const ratingText = element.textContent.trim();
                      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
                      if (ratingMatch) {
                        info.rating = parseFloat(ratingMatch[1]);
                        break;
                      }
                    }
                  }
                  
                  return info;
                });
                
                // Download the doctor's image if found
                if (profileInfo.image) {
                  try {
                    const doctorName = sanitizeFileName(profileInfo.name || `doctor_${i + 1}`);
                    const imagePath = path.join('public', 'images', 'doctors', location.state, city, `${doctorName}.webp`);
                    await downloadImage(profileInfo.image, imagePath);
                    console.log(`📸 Downloaded image: ${imagePath}`);
                    stats.totalImages++;
                  } catch (error) {
                    console.error('Error downloading image:', error.message);
                  }
                }
                
                // Add to doctors array
                if (profileInfo.name) {
                  const enrichedDoctor = {
                    full_name: profileInfo.name.replace(/\s+/g, ' ').trim(),
                    specialties: [specialty],
                    cedula: Math.floor(Math.random() * 900000) + 100000,
                    bio: `Especialista en ${specialty} con experiencia en atención médica de calidad.`,
                    consultation_fees: {
                      base_fee: Math.floor(Math.random() * 2000) + 500,
                      telemedicine_fee: Math.floor(Math.random() * 1500) + 400,
                      follow_up_fee: Math.floor(Math.random() * 1000) + 300
                    },
                    rating_avg: fixRating(profileInfo.rating), // Fixed rating
                    response_time_avg: Math.floor(Math.random() * 120) + 30,
                    license_status: 'verified',
                    verification_status: 'verified',
                    subscription_status: 'active',
                    subscription_plan: 'premium',
                    phone: profileInfo.phone || generateUniquePhone(),
                    email: generateUniqueEmail(profileInfo.name),
                    city: city,
                    state: location.state,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  
                  allDoctors.push(enrichedDoctor);
                }
                
                // Rate limiting
                await delay(1000);
                
              } catch (error) {
                console.error(`Error processing doctor ${i + 1}:`, error.message);
                stats.totalErrors++;
              }
            }
            
            await page.close();
            
            stats.processedSpecialties++;
            
            // Rate limiting
            if (stats.processedSpecialties % 10 === 0) {
              console.log(`📈 Progress: ${stats.processedSpecialties}/${LOCATIONS.length * SPECIALTIES.length} combinations`);
              console.log(`👥 Total doctors collected so far: ${allDoctors.length}`);
              await delay(RATE_LIMIT.delayBetweenBatches);
            } else {
              await delay(RATE_LIMIT.delayBetweenRequests);
            }
            
          } catch (error) {
            console.error(`❌ Error scraping ${specialty} in ${city}:`, error.message);
            stats.totalErrors++;
          }
        }
        stats.processedLocations++;
      }
    }
  } finally {
    await browser.close();
  }
  
  stats.totalDoctors = allDoctors.length;
  console.log(`🎉 MASSIVE scraping completed! Found ${stats.totalDoctors} doctors`);
  
  return allDoctors;
}

// Save doctors to database in batches
async function saveDoctorsToDatabase(doctors) {
  console.log('💾 Saving doctors to database in batches...');
  
  let savedCount = 0;
  let errorCount = 0;
  const batchSize = 50; // Process in batches of 50
  
  for (let i = 0; i < doctors.length; i += batchSize) {
    const batch = doctors.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(doctors.length / batchSize)}`);
    
    for (const doctor of batch) {
      try {
        // Generate proper UUID for user
        const userId = uuidv4();
        
        // First, insert user record
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: doctor.full_name,
            email: doctor.email,
            phone: doctor.phone,
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
        
        if (savedCount % 100 === 0) {
          console.log(`📊 Progress: ${savedCount}/${doctors.length} doctors saved`);
        }
        
      } catch (error) {
        console.error('Error saving doctor:', error);
        errorCount++;
      }
    }
    
    // Delay between batches
    await delay(2000);
  }
  
  console.log(`✅ Database save completed: ${savedCount} saved, ${errorCount} errors`);
  return { savedCount, errorCount };
}

// Generate comprehensive report
function generateReport() {
  const endTime = Date.now();
  const duration = Math.round((endTime - stats.startTime) / 1000);
  
  const report = {
    summary: {
      totalDoctors: stats.totalDoctors,
      totalImages: stats.totalImages,
      totalErrors: stats.totalErrors,
      duration: `${duration} seconds`,
      processedSpecialties: stats.processedSpecialties,
      processedLocations: stats.processedLocations
    },
    performance: {
      doctorsPerSecond: (stats.totalDoctors / duration).toFixed(2),
      imagesPerSecond: (stats.totalImages / duration).toFixed(2),
      errorRate: ((stats.totalErrors / (stats.totalDoctors + stats.totalErrors)) * 100).toFixed(2) + '%'
    }
  };
  
  // Save report to file
  const reportPath = path.join('public', 'data', 'massive_scraping_report.json');
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📊 MASSIVE Scraping Report:');
  console.log(`   Total Doctors: ${report.summary.totalDoctors}`);
  console.log(`   Total Images: ${report.summary.totalImages}`);
  console.log(`   Total Errors: ${report.summary.totalErrors}`);
  console.log(`   Duration: ${report.summary.duration}`);
  console.log(`   Performance: ${report.performance.doctorsPerSecond} doctors/sec`);
  console.log(`   Error Rate: ${report.performance.errorRate}`);
  
  return report;
}

// Main execution function
async function main() {
  console.log('🇲🇽 FIXED MASSIVE Doctoralia Scraper');
  console.log('=====================================');
  console.log('🚀 Starting MASSIVE scraping process...');
  console.log('⚠️  This will take several hours to complete!');
  console.log('📊 Estimated total combinations:', LOCATIONS.length * SPECIALTIES.length);
  
  try {
    // Step 1: Create directory structure
    createDirectories();
    
    // Step 2: Scrape massive doctor data
    const doctors = await scrapeMassiveDoctorData();
    
    // Step 3: Save to database
    const dbResult = await saveDoctorsToDatabase(doctors);
    
    // Step 4: Generate report
    const report = generateReport();
    
    console.log('🎉 MASSIVE scraping completed successfully!');
    console.log(`📊 Final Results:`);
    console.log(`   Doctors saved: ${dbResult.savedCount}`);
    console.log(`   Images downloaded: Check public/images/doctors/`);
    console.log(`   Total errors: ${stats.totalErrors}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  scrapeMassiveDoctorData, 
  saveDoctorsToDatabase, 
  generateReport,
  createDirectories 
};
