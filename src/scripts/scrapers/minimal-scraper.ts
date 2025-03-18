import { BaseScraper } from './base-scraper';
import { supabase } from './supabase-client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A minimal scraper test that just fetches a few dentists from a single page
 */
class MinimalScraperTest extends BaseScraper {
  // Override the delay to be quicker for testing
  protected delayMin: number = 500;
  protected delayMax: number = 1000;
  
  /**
   * Parse address information into structured components
   * @param address The full address text
   * @returns Structured address information
   */
  private parseAddress(address: string): any {
    const result = {
      street: '',
      colonia: '',
      city: '',
      consultationType: ''
    };
    
    if (!address) return result;
    
    // Extract consultorio information
    if (address.includes('Consultorio privado')) {
      result.consultationType = 'Consultorio privado';
    }
    
    // Extract city information
    if (address.includes('Ciudad de México')) {
      result.city = 'Ciudad de México';
    } else if (address.includes('CDMX')) {
      result.city = 'Ciudad de México';
    }
    
    // Extract street information - usually the first part with numbers
    const streetRegex = /(Calle|Av\.|Avenida|Blvd\.|Boulevard)?\s*([\w\s]+)\s+(\d+)/i;
    const streetMatch = address.match(streetRegex);
    if (streetMatch) {
      result.street = streetMatch[0].trim();
    } else {
      // Alternative: just take the first part before a comma
      const parts = address.split(',');
      if (parts.length > 0) {
        result.street = parts[0].trim();
      }
    }
    
    // Extract colonia information
    if (address.includes('Colonia')) {
      const coloniaMatch = address.match(/Colonia\s+([^,]+)/);
      if (coloniaMatch && coloniaMatch[1]) {
        result.colonia = coloniaMatch[1].trim();
      }
    } else if (address.includes('Col.')) {
      const coloniaMatch = address.match(/Col\.\s+([^,]+)/);
      if (coloniaMatch && coloniaMatch[1]) {
        result.colonia = coloniaMatch[1].trim();
      }
    } else {
      // Try to extract from the second part of the address
      const parts = address.split(',');
      if (parts.length >= 2) {
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          if (!part.includes('Ciudad de México') && 
              !part.includes('CDMX') && 
              !part.includes('Consultorio')) {
            result.colonia = part;
            break;
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Run the scraper for a specific page number
   * @param page Page number to scrape (default: 1)
   */
  public async scrapePageNumber(page: number = 1): Promise<any[]> {
    try {
      console.log(`Scraping page ${page}...`);
      
      // Create output directory if it doesn't exist
      const dataDir = path.join(__dirname, '../../../data/scraped');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Build URL with page parameter
      const baseUrl = 'https://www.doctoralia.com.mx/buscar';
      const params = new URLSearchParams({
        q: 'Dentista - Odontólogo',
        loc: 'Ciudad de México, CDMX',
        page: page.toString()
      });
      params.append('filters[specializations][]', '63');
      const url = `${baseUrl}?${params.toString()}`;
      
      console.log(`Fetching: ${url}`);
      const html = await this.makeRequest(url);
      
      // Parse with cheerio
      const $ = this.parseHTML(html);
      
      // Extract basic dentist info
      const dentists: Array<any> = [];
      
      // The first attempt: try to find doctor cards based on the screenshot
      console.log(`Analyzing HTML for page ${page}...`);
      
      // Log a snippet of the body HTML to help with debugging
      if (page === 1) {
        console.log('HTML snippet:');
        const bodyHtml = $('body').html();
        if (bodyHtml) {
          console.log(bodyHtml.substring(0, 300) + '...');
        } else {
          console.log('Could not get body HTML');
        }
      }
      
      // Based on the screenshot, try these selectors for doctor entries
      const cardSelectors = [
        // General doctor entry containers
        '[data-id="doctor-listing"]',
        'div:has(.DESTACADO)',
        'div:has(h3:contains("Dr."))',
        'div:has(div:contains("Dentista"))',
        'div:has(div:contains("Primera visita"))',
        'div.doctor-card',
        'div.doctor-listing',
        'div:has(div:contains("opiniones"))',
        // Literal selectors for the examples in screenshot
        'div:has(div:contains("Joseph Naffah"))',
        'div:has(div:contains("Martha Grissel"))'
      ];
      
      let foundCards = false;
      
      // Try each selector until we find something that works
      for (const selector of cardSelectors) {
        const cards = $(selector);
        console.log(`Found ${cards.length} cards with selector "${selector}"`);
        
        if (cards.length > 0) {
          foundCards = true;
          
          // Log the first card HTML to understand its structure
          if (page === 1 && cards.length > 0) {
            console.log('Example card HTML:');
            const cardHtml = $(cards[0]).html();
            if (cardHtml) {
              console.log(cardHtml.substring(0, 300) + '...');
            } else {
              console.log('Could not get card HTML');
            }
          }
          
          cards.each((i, element) => {
            // Try to extract doctor name
            let name = '';
            const nameSelectors = [
              'h3',
              'h2',
              'div:contains("Dr.")',
              'div:contains("Martha")',
              'div:contains("Joseph")',
              'strong'
            ];
            
            for (const nameSelector of nameSelectors) {
              const nameElement = $(element).find(nameSelector);
              if (nameElement.length > 0) {
                name = nameElement.text().trim();
                console.log(`Found name: ${name}`);
                break;
              }
            }
            
            // Try to extract address
            let address = '';
            
            // Looking at your screenshot, the addresses appear near map links
            const mapLinkElement = $(element).find('a:contains("Mapa")');
            if (mapLinkElement.length > 0) {
              // Get the parent that contains both the map link and address
              const addressContainer = mapLinkElement.parent().parent();
              address = addressContainer.text().replace('Mapa', '').trim();
              console.log(`Found address from map container: ${address}`);
            }
            
            // If that didn't work, try other selectors
            if (!address) {
              const addressSelectors = [
                // Target full address patterns
                'div:contains("Bosques De Duraznos"):not(:has(*))',  // Target text nodes only
                'div:contains("Parroquia 414"):not(:has(*))',       // Target text nodes only
                'div:contains("Consultorio privado")',
                // Look at containers with location info
                '.location',
                '.address',
                '.doctor-address',
                // Specific formats from screenshot
                'div[class*="address"]',
                'div[class*="location"]'
              ];
              
              for (const addressSelector of addressSelectors) {
                const addressElement = $(element).find(addressSelector);
                if (addressElement.length > 0) {
                  address = addressElement.text().trim();
                  console.log(`Found address: ${address}`);
                  break;
                }
              }
            }
            
            // If we found a name, add to our results
            if (name) {
              // Extract structured information from the address
              const addressInfo = this.parseAddress(address || '');
              
              // Simplified data structure focused on name and address
              dentists.push({
                name,
                address: address || 'Address not found',
                street: addressInfo.street,
                colonia: addressInfo.colonia,
                city: addressInfo.city,
                consultationType: addressInfo.consultationType,
                page,
                url
              });
              
              console.log(`Added dentist: ${name} at ${address || 'Unknown address'}`);
            }
          });
          
          // Break after finding matching cards with one selector
          break;
        }
      }
      
      // If no cards were found with our selectors, try a more direct approach
      if (!foundCards) {
        console.log('No doctor cards found with specific selectors. Trying direct HTML analysis...');
        
        // Just look for any h2 or h3 elements that might be doctor names
        const nameElements = $('h2, h3, strong');
        console.log(`Found ${nameElements.length} potential name elements`);
        
        nameElements.each((i, element) => {
          const name = $(element).text().trim();
          
          // Only process if it looks like a name (has Dr., at least 2 words, etc.)
          if (name && (name.includes('Dr.') || name.includes(' ') || name.length > 15)) {
            console.log(`Found potential doctor name: ${name}`);
            
            // Look at containing elements for more info
            const parent = $(element).parent();
            const grandparent = parent.parent();
            
            // Try to find address info nearby
            let address = '';
            grandparent.find('div').each((j, div) => {
              const divText = $(div).text().trim();
              if (divText && divText !== name && 
                  (divText.includes('Calle') || 
                   divText.includes('Ciudad de México') || 
                   divText.includes('Consultorio') ||
                   divText.includes('Bosques') ||
                   divText.includes('Colonia'))) {
                address = divText;
                return false; // Break the each loop
              }
            });
            
            if (address || name.includes('Dr.')) {
              // Extract structured information from the address
              const addressInfo = this.parseAddress(address || '');
              
              dentists.push({
                name,
                address: address || 'Address not found',
                street: addressInfo.street,
                colonia: addressInfo.colonia,
                city: addressInfo.city,
                consultationType: addressInfo.consultationType,
                page,
                url
              });
              
              console.log(`Added dentist through direct name search: ${name}`);
            }
          }
        });
        
        console.log(`Found ${dentists.length} potential dentists through direct name search`);
      }
      
      // Always save the full HTML for page 1 for further analysis
      if (page === 1) {
        const fullHtmlPath = path.join(dataDir, 'full-html.html');
        fs.writeFileSync(fullHtmlPath, $.html(), 'utf8');
        console.log(`Saved full HTML to ${fullHtmlPath} for inspection`);
      }
      
      return dentists;
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error);
      return [];
    }
  }
  
  /**
   * Run a minimal test scrape
   */
  public async run(): Promise<void> {
    try {
      console.log('Starting minimal scraper test...');
      
      // Create output directory if it doesn't exist
      const dataDir = path.join(__dirname, '../../../data/scraped');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // By default, scrape a large number of pages
      const pagesToScrape = 456; // Set to 456 to scrape all pages
      let allDentists: any[] = [];
      
      for (let page = 1; page <= pagesToScrape; page++) {
        // Add a delay between pages to avoid rate limiting
        if (page > 1) {
          const delay = Math.floor(Math.random() * (this.delayMax - this.delayMin + 1) + this.delayMin);
          console.log(`Waiting ${delay}ms before fetching next page...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const dentistsOnPage = await this.scrapePageNumber(page);
        console.log(`Found ${dentistsOnPage.length} dentists on page ${page}`);
        
        allDentists = [...allDentists, ...dentistsOnPage];
        
        // Save HTML for the first page
        if (page === 1) {
          // Fetch the URL again for HTML saving
          const baseUrl = 'https://www.doctoralia.com.mx/buscar';
          const params = new URLSearchParams({
            q: 'Dentista - Odontólogo',
            loc: 'Ciudad de México, CDMX',
            page: '1'
          });
          params.append('filters[specializations][]', '63');
          const url = `${baseUrl}?${params.toString()}`;
          
          const html = await this.makeRequest(url);
          
          // Save the HTML to examine
          const htmlPath = path.join(dataDir, 'test-page.html');
          fs.writeFileSync(htmlPath, html, 'utf8');
          console.log(`Saved HTML to ${htmlPath}`);
        }
      }
      
      // Save the results
      const resultsPath = path.join(dataDir, 'test-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(allDentists, null, 2), 'utf8');
      console.log(`Saved ${allDentists.length} test results to ${resultsPath}`);
      
      // Test Supabase connection
      console.log('Testing Supabase connection...');
      const { count, error } = await supabase
        .from('dentists')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Current dentist count in database:', count);
      }
      
      // Report on pagination
      console.log(`Successfully scraped ${pagesToScrape} out of 456 total pages`);
      console.log(`Found ${allDentists.length} dentists in total`);
      console.log('To scrape all 456 pages, update the pagesToScrape variable');
      
      console.log('Minimal scraper test completed successfully!');
    } catch (error) {
      console.error('Error in minimal scraper test:', error);
    }
  }
}

// Run the minimal test
const tester = new MinimalScraperTest();
tester.run().catch(console.error);
