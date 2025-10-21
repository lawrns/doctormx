// Scraper Configuration File
// Adjust these settings to control the massive scraper

export const SCRAPER_CONFIG = {
  // Rate limiting settings
  RATE_LIMIT: {
    requestsPerSecond: 1,           // Max requests per second
    delayBetweenRequests: 2000,     // Delay between individual requests (ms)
    delayBetweenBatches: 10000,     // Delay between batches (ms)
    maxConcurrentRequests: 1,        // Max concurrent browser tabs
    maxDoctorsPerSpecialty: 5        // Max doctors to scrape per specialty/location
  },

  // Scraping scope
  SCOPE: {
    // Set to true to scrape all specialties, false to use TEST_SPECIALTIES
    useAllSpecialties: false,
    
    // Set to true to scrape all locations, false to use TEST_LOCATIONS
    useAllLocations: false,
    
    // Maximum total doctors to scrape (0 = no limit)
    maxTotalDoctors: 0,
    
    // Resume from previous run (requires progress file)
    resumeFromProgress: false
  },

  // Browser settings
  BROWSER: {
    headless: true,                 // Set to false to see browser
    timeout: 30000,                 // Page load timeout (ms)
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },

  // Database settings
  DATABASE: {
    batchSize: 50,                  // Doctors to save per batch
    delayBetweenBatches: 2000,      // Delay between database batches (ms)
    skipExisting: true              // Skip doctors that already exist
  },

  // File settings
  FILES: {
    saveProgress: true,             // Save progress to file
    progressFile: 'scraper-progress.json',
    reportFile: 'scraper-report.json',
    logLevel: 'info'                // debug, info, warn, error
  }
};

// Test configuration for limited runs
export const TEST_CONFIG = {
  TEST_LOCATIONS: [
    { state: 'Ciudad de México', cities: ['ciudad-de-mexico'] },
    { state: 'Jalisco', cities: ['guadalajara'] },
    { state: 'Nuevo León', cities: ['monterrey'] }
  ],

  TEST_SPECIALTIES: [
    'medicina-general',
    'cardiologo',
    'dermatologo',
    'ginecologo',
    'pediatra'
  ]
};

// Full configuration for massive runs
export const FULL_CONFIG = {
  LOCATIONS: [
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
  ],

  SPECIALTIES: [
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
  ]
};

// Usage instructions
export const USAGE_INSTRUCTIONS = `
🇲🇽 MASSIVE Doctoralia Scraper Usage Instructions
================================================

1. TEST RUN (Recommended first):
   node scripts/test-massive-scraper.js
   - Scrapes 3 locations × 5 specialties = 15 combinations
   - Takes ~10-15 minutes
   - Verifies everything works before massive run

2. MASSIVE RUN:
   node scripts/massive-doctoralia-scraper.js
   - Scrapes 32 states × 40 specialties = 1,280+ combinations
   - Takes 8-12 hours to complete
   - Can fetch 5,000-10,000+ doctors

3. CONFIGURATION:
   Edit scripts/scraper-config.js to adjust:
   - Rate limiting (be respectful to Doctoralia)
   - Browser settings (headless vs visible)
   - Database batch size
   - Maximum doctors per specialty

4. MONITORING:
   - Progress is logged to console
   - Images saved to public/images/doctors/
   - Database saves in batches
   - Final report generated

5. SAFETY:
   - Built-in rate limiting
   - Error handling and recovery
   - Progress saving (can resume)
   - Respectful scraping practices

⚠️  IMPORTANT NOTES:
- This will take HOURS to complete
- Be respectful to Doctoralia servers
- Monitor disk space (images can be large)
- Check database limits
- Consider running overnight

🚀 Ready to start? Run the test first!
`;

export default SCRAPER_CONFIG;
