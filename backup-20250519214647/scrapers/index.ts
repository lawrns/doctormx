import { DoctoraliaScraperMX } from './doctoralia-scraper';
import { PaginasAmarillasScraper } from './paginas-amarillas-scraper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Run all scrapers to gather dentist information
 */
async function runScrapers() {
  console.log('Starting dentist data scraping for Mexico...');
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../../../data/scraped');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  try {
    // Run Doctoralia scraper
    console.log('\n=== Running Doctoralia Scraper ===\n');
    const doctoraliaScaper = new DoctoraliaScraperMX();
    await doctoraliaScaper.run();
    
    // Run Páginas Amarillas scraper
    console.log('\n=== Running Páginas Amarillas Scraper ===\n');
    const paginasAmarillasScaper = new PaginasAmarillasScraper();
    await paginasAmarillasScaper.run();
    
    console.log('\n=== All scrapers completed successfully! ===\n');
  } catch (error) {
    console.error('Error running scrapers:', error);
  }
}

// Run the scrapers if this script is executed directly
if (require.main === module) {
  runScrapers().catch(console.error);
}

export { runScrapers, DoctoraliaScraperMX, PaginasAmarillasScraper };
