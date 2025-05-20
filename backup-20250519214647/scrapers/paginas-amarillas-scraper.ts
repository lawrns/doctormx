import { BaseScraper } from './base-scraper';
import * as fs from 'fs';
import * as path from 'path';
import { supabase } from './supabase-client';
import { Dentist } from '../../lib/types/dentist';

interface YellowPagesDentist {
  clinic_name: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  city: string;
  state: string;
  description?: string;
  categories?: string[];
  profile_url?: string;
  is_premium: boolean;
}

export class PaginasAmarillasScraper extends BaseScraper {
  private baseUrl: string = 'https://www.paginasamarillas.com.mx';
  private searchTerms: string[] = ['dentistas', 'odontologos', 'clinicas-dentales', 'consultorios-dentales'];
  private states: string[] = [
    'distrito-federal', 'estado-de-mexico', 'jalisco', 'nuevo-leon', 'puebla', 
    'queretaro', 'guanajuato', 'veracruz', 'baja-california', 'baja-california-sur', 
    'sonora', 'chihuahua', 'coahuila', 'tamaulipas', 'sinaloa', 'durango', 
    'nayarit', 'zacatecas', 'san-luis-potosi', 'aguascalientes', 'colima', 
    'michoacan', 'guerrero', 'oaxaca', 'chiapas', 'tabasco', 'campeche', 
    'yucatan', 'quintana-roo', 'morelos', 'tlaxcala', 'hidalgo'
  ];
  private scrapedDentists: YellowPagesDentist[] = [];
  
  /**
   * Scrape dentists from a specific page
   */
  private async scrapeDentistsFromPage(url: string): Promise<YellowPagesDentist[]> {
    console.log(`Scraping: ${url}`);
    try {
      const html = await this.makeRequest(url);
      const $ = this.parseHTML(html);
      const results: YellowPagesDentist[] = [];
      
      // Páginas Amarillas uses a specific structure for business listings
      $('.business-listing').each((i, element) => {
        const nameEl = $(element).find('.business-name');
        const clinicName = nameEl.text().trim();
        const profileUrl = nameEl.attr('href') ? this.baseUrl + nameEl.attr('href') : null;
        
        const address = $(element).find('.address').text().trim();
        const locationData = this.parseLocation(address);
        
        // Phone numbers are often displayed in multiple places
        let phone = null;
        const phoneEl = $(element).find('.phone, .tel');
        if (phoneEl.length) {
          phone = phoneEl.text().trim();
        }
        
        // Check for premium listings
        const isPremium = $(element).hasClass('premium-listing') || $(element).hasClass('highlighted');
        
        // Check for website link
        let website = null;
        const websiteEl = $(element).find('a.website-link');
        if (websiteEl.length) {
          website = websiteEl.attr('href');
          // Remove tracking parameters
          if (website && website.includes('?')) {
            website = website.split('?')[0];
          }
        }
        
        // Extract categories/tags
        const categories = [];
        $(element).find('.categories .category').each((i, catEl) => {
          categories.push($(catEl).text().trim());
        });
        
        // Extract description if available
        const description = $(element).find('.description').text().trim();
        
        results.push({
          clinic_name: clinicName,
          address,
          phone,
          website,
          city: locationData.city,
          state: locationData.state,
          profile_url: profileUrl,
          is_premium: isPremium,
          description,
          categories,
          email: null // Will be scraped from detail page if available
        });
      });
      
      // Check if there's a next page
      const nextPageUrl = $('.pagination .next a, a.next-page').attr('href');
      if (nextPageUrl) {
        console.log(`Found next page: ${nextPageUrl.startsWith('http') ? nextPageUrl : this.baseUrl + nextPageUrl}`);
        
        // Wait longer between page navigations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
        
        // Recursively scrape next page
        const nextPageResults = await this.scrapeDentistsFromPage(
          nextPageUrl.startsWith('http') ? nextPageUrl : this.baseUrl + nextPageUrl
        );
        return [...results, ...nextPageResults];
      }
      
      return results;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      // Return what we've got so far
      return [];
    }
  }
  
  /**
   * Parse location details from address string
   */
  private parseLocation(address: string): { city: string, state: string } {
    // Default values
    let city = '';
    let state = '';
    
    // Try to extract city and state from address
    // Common format is: "Street, Number, Colony, City, State, ZIP"
    if (address) {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // City is often the second-to-last element
        city = parts[parts.length - 2];
        
        // State may be the last element (often includes ZIP code)
        const stateWithZip = parts[parts.length - 1];
        const stateMatch = stateWithZip.match(/([A-Za-z\s]+)/);
        if (stateMatch) {
          state = stateMatch[1].trim();
        }
      }
    }
    
    return { city, state };
  }
  
  /**
   * Scrape detailed information from dentist's profile page if available
   */
  private async scrapeDetailedInfo(dentist: YellowPagesDentist): Promise<YellowPagesDentist> {
    // Skip if no profile URL
    if (!dentist.profile_url) {
      return dentist;
    }
    
    try {
      console.log(`Scraping detailed info: ${dentist.profile_url}`);
      const html = await this.makeRequest(dentist.profile_url);
      const $ = this.parseHTML(html);
      
      // Look for email - often obfuscated to prevent scraping
      let email = null;
      const emailEl = $('a[href^="mailto:"]');
      if (emailEl.length) {
        email = emailEl.attr('href').replace('mailto:', '');
      }
      
      // Sometimes phone may be more visible on the detail page
      let phone = dentist.phone;
      if (!phone) {
        const phoneElements = [
          '.phone',
          '.tel',
          '.phone-number',
          '[itemprop="telephone"]'
        ];
        
        for (const selector of phoneElements) {
          const el = $(selector);
          if (el.length) {
            phone = el.text().trim();
            break;
          }
        }
      }
      
      // Check for additional phone patterns in HTML
      if (!phone) {
        // Mexican phone numbers are typically 10 digits
        // Sometimes formatted as (xx) xxxx-xxxx or xx-xxxx-xxxx
        const phoneRegex = /(\(\d{2,3}\)\s*\d{4}[-\s]?\d{4})|(\d{2,3}[-\s]?\d{4}[-\s]?\d{4})/g;
        const matches = html.match(phoneRegex);
        if (matches && matches.length > 0) {
          phone = matches[0];
        }
      }
      
      // Look for website if not found earlier
      let website = dentist.website;
      if (!website) {
        const websiteEl = $('a.website, a.web, a[itemprop="url"]');
        if (websiteEl.length) {
          website = websiteEl.attr('href');
          // Remove tracking parameters
          if (website && website.includes('?')) {
            website = website.split('?')[0];
          }
        }
      }
      
      // Get a better description if available
      let description = dentist.description;
      const detailedDesc = $('.business-description, .description').text().trim();
      if (detailedDesc && detailedDesc.length > description.length) {
        description = detailedDesc;
      }
      
      return {
        ...dentist,
        email,
        phone,
        website,
        description
      };
    } catch (error) {
      console.error(`Error scraping details for ${dentist.profile_url}:`, error.message);
      return dentist; // Return the original dentist object without details
    }
  }
  
  /**
   * Convert scraped data to our database format
   */
  private convertToDatabaseFormat(dentists: YellowPagesDentist[]): Partial<Dentist>[] {
    return dentists.map(d => ({
      clinic_name: d.clinic_name,
      address: d.address,
      phone: d.phone,
      location: `${d.city}, ${d.state}`,
      is_verified: false, // Yellow Pages doesn't verify practitioners
      is_premium: d.is_premium,
      website: d.website,
      email: d.email,
      description: d.description,
      has_review: false, // Yellow Pages typically doesn't have reviews
      // These fields would require additional processing
      latitude: null, // Would require geocoding
      longitude: null // Would require geocoding
    }));
  }
  
  /**
   * Save data to database
   */
  private async saveToDatabase(dentists: Partial<Dentist>[]): Promise<void> {
    try {
      console.log(`Saving ${dentists.length} dentists to database...`);
      
      // Insert in batches to avoid request size limits
      const batchSize = 50;
      for (let i = 0; i < dentists.length; i += batchSize) {
        const batch = dentists.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('dentists')
          .insert(batch)
          .select();
          
        if (error) {
          console.error('Error saving to database:', error);
        } else {
          console.log(`Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dentists.length / batchSize)}`);
        }
        
        // Pause between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Database save complete');
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }
  
  /**
   * Run the scraper for all search terms and states
   */
  public async run(): Promise<void> {
    this.scrapedDentists = [];
    
    // Iterate through search terms and states
    for (const searchTerm of this.searchTerms) {
      for (const state of this.states) {
        const url = `${this.baseUrl}/buscar/${searchTerm}/${state}`;
        
        try {
          console.log(`\n=== Starting scrape for ${searchTerm} in ${state} ===\n`);
          const dentistsOnPage = await this.scrapeDentistsFromPage(url);
          
          if (dentistsOnPage.length > 0) {
            console.log(`Found ${dentistsOnPage.length} dental clinics for ${searchTerm} in ${state}`);
            
            // Get detailed info for each dentist
            const dentistsWithDetails = [];
            for (const dentist of dentistsOnPage) {
              const detailedDentist = await this.scrapeDetailedInfo(dentist);
              dentistsWithDetails.push(detailedDentist);
              
              // Save progress periodically
              if (dentistsWithDetails.length % 10 === 0) {
                this.saveData(dentistsWithDetails, `${searchTerm}_${state}_progress.json`);
              }
            }
            
            // Save complete state results
            this.saveData(dentistsWithDetails, `${searchTerm}_${state}.json`);
            
            // Add to full dataset
            this.scrapedDentists.push(...dentistsWithDetails);
            
            // Save full dataset periodically
            this.saveData(this.scrapedDentists, 'all_yellow_pages_dentists.json');
          } else {
            console.log(`No dental clinics found for ${searchTerm} in ${state}`);
          }
        } catch (error) {
          console.error(`Error processing ${searchTerm} in ${state}:`, error.message);
          // Continue with next state/search term
        }
        
        // Wait between regions to avoid overloading the server
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    // Save final results
    this.saveData(this.scrapedDentists, 'all_yellow_pages_dentists_final.json');
    
    // Convert and save to database
    const dbFormat = this.convertToDatabaseFormat(this.scrapedDentists);
    await this.saveToDatabase(dbFormat);
    
    console.log(`\n=== Scraping complete! Total dental clinics found: ${this.scrapedDentists.length} ===\n`);
  }
}
