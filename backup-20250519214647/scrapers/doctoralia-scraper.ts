import { BaseScraper } from './base-scraper';
import * as fs from 'fs';
import * as path from 'path';
import { supabase } from './supabase-client';
import { Dentist } from '../../lib/types/dentist';

interface DoctoraliaDentist {
  name: string;
  clinic_name?: string;
  address?: string;
  phone?: string;
  website?: string;
  specialty: string;
  city: string;
  state: string;
  rating?: number;
  reviews_count?: number;
  profile_url: string;
  is_verified: boolean;
  image_url?: string;
}

export class DoctoraliaScraperMX extends BaseScraper {
  private baseUrl: string = 'https://www.doctoralia.com.mx';
  private specialties: string[] = ['dentista', 'odontologia', 'ortodoncista', 'endodoncista', 'periodoncista'];
  private states: string[] = [
    'ciudad-de-mexico', 'estado-de-mexico', 'jalisco', 'nuevo-leon', 'puebla', 
    'queretaro', 'guanajuato', 'veracruz', 'baja-california', 'baja-california-sur', 
    'sonora', 'chihuahua', 'coahuila', 'tamaulipas', 'sinaloa', 'durango', 
    'nayarit', 'zacatecas', 'san-luis-potosi', 'aguascalientes', 'colima', 
    'michoacan', 'guerrero', 'oaxaca', 'chiapas', 'tabasco', 'campeche', 
    'yucatan', 'quintana-roo', 'morelos', 'tlaxcala', 'hidalgo'
  ];
  private scrapedDentists: DoctoraliaDentist[] = [];
  
  /**
   * Scrape dentists from a specific page
   */
  private async scrapeDentistsFromPage(url: string): Promise<DoctoraliaDentist[]> {
    console.log(`Scraping: ${url}`);
    try {
      const html = await this.makeRequest(url);
      const $ = this.parseHTML(html);
      const results: DoctoraliaDentist[] = [];
      
      // Doctoralia uses a specific structure for doctor listings
      $('.card-doctor').each((i, element) => {
        const nameEl = $(element).find('.doctor-card-profile-name');
        const name = nameEl.text().trim();
        const profileUrl = this.baseUrl + nameEl.attr('href');
        
        const address = $(element).find('.doctor-card-address').text().trim();
        const locationData = this.parseLocation(address);
        
        const specialty = $(element).find('.doctor-card-specialty').text().trim();
        
        let rating = null;
        const ratingEl = $(element).find('.rating-value');
        if (ratingEl.length) {
          rating = parseFloat(ratingEl.text().trim());
        }
        
        let reviewsCount = null;
        const reviewsEl = $(element).find('.rating-count');
        if (reviewsEl.length) {
          reviewsCount = parseInt(reviewsEl.text().replace(/[()]/g, '').trim());
        }
        
        const imageEl = $(element).find('.doctor-card-photo img');
        const imageUrl = imageEl.attr('src') || imageEl.attr('data-src');
        
        const isVerified = $(element).find('.verified-badge').length > 0;
        
        results.push({
          name,
          specialty,
          address,
          city: locationData.city,
          state: locationData.state,
          profile_url: profileUrl,
          rating,
          reviews_count: reviewsCount,
          is_verified: isVerified,
          image_url: imageUrl,
          phone: null // Requires profile page scraping
        });
      });
      
      // Check if there's a next page
      const nextPageUrl = $('.pagination .next a').attr('href');
      if (nextPageUrl) {
        console.log(`Found next page: ${this.baseUrl}${nextPageUrl}`);
        
        // Wait longer between page navigations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
        
        // Recursively scrape next page
        const nextPageResults = await this.scrapeDentistsFromPage(this.baseUrl + nextPageUrl);
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
   * Scrape detailed information from dentist's profile page
   */
  private async scrapeDetailedInfo(dentist: DoctoraliaDentist): Promise<DoctoraliaDentist> {
    try {
      console.log(`Scraping detailed info: ${dentist.profile_url}`);
      const html = await this.makeRequest(dentist.profile_url);
      const $ = this.parseHTML(html);
      
      // Extract clinic name
      const clinicName = $('.clinic-name').text().trim();
      
      // Extract phone number - this is the primary goal
      // Phone is often hidden behind JavaScript, but might be available in specific elements
      let phone = null;
      
      // Method 1: Look for direct phone elements
      const phoneElements = [
        '.doctor-phone',
        '.clinic-phone',
        '.contact-phone',
        '[itemprop="telephone"]'
      ];
      
      for (const selector of phoneElements) {
        const el = $(selector);
        if (el.length) {
          phone = el.text().trim();
          break;
        }
      }
      
      // Method 2: Look for structured data
      if (!phone) {
        $('script[type="application/ld+json"]').each((i, el) => {
          try {
            const jsonData = JSON.parse($(el).html());
            if (jsonData.telephone) {
              phone = jsonData.telephone;
            }
          } catch (e) {
            // Invalid JSON, skip
          }
        });
      }
      
      // Method 3: Look for telephone pattern in the entire HTML
      if (!phone) {
        // Mexican phone numbers are typically 10 digits
        // Sometimes formatted as (xx) xxxx-xxxx or xx-xxxx-xxxx
        const phoneRegex = /(\(\d{2,3}\)\s*\d{4}[-\s]?\d{4})|(\d{2,3}[-\s]?\d{4}[-\s]?\d{4})/g;
        const matches = html.match(phoneRegex);
        if (matches && matches.length > 0) {
          phone = matches[0];
        }
      }
      
      // Extract website if available
      const websiteEl = $('a[href^="http"]:contains("Sitio web"), a[href^="http"]:contains("Website")');
      const website = websiteEl.attr('href');
      
      return {
        ...dentist,
        clinic_name: clinicName || null,
        phone: phone,
        website: website || null
      };
    } catch (error) {
      console.error(`Error scraping details for ${dentist.profile_url}:`, error.message);
      return dentist; // Return the original dentist object without details
    }
  }
  
  /**
   * Convert scraped data to our database format
   */
  private convertToDatabaseFormat(dentists: DoctoraliaDentist[]): Partial<Dentist>[] {
    return dentists.map(d => ({
      clinic_name: d.clinic_name || d.name,
      address: d.address,
      phone: d.phone,
      location: `${d.city}, ${d.state}`,
      is_verified: d.is_verified,
      is_premium: false,
      website: d.website,
      has_review: !!d.rating,
      review_rating: d.rating,
      // These fields would require additional scraping
      review_quote: null,
      review_text: null,
      review_person: null,
      email: null, // Not typically available on public listings
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
   * Run the scraper for all specialties and states
   */
  public async run(): Promise<void> {
    this.scrapedDentists = [];
    
    // Iterate through specialties and states
    for (const specialty of this.specialties) {
      for (const state of this.states) {
        const url = `${this.baseUrl}/buscar/${specialty}/${state}`;
        
        try {
          console.log(`\n=== Starting scrape for ${specialty} in ${state} ===\n`);
          const dentistsOnPage = await this.scrapeDentistsFromPage(url);
          
          if (dentistsOnPage.length > 0) {
            console.log(`Found ${dentistsOnPage.length} dentists for ${specialty} in ${state}`);
            
            // Get detailed info for each dentist
            const dentistsWithDetails = [];
            for (const dentist of dentistsOnPage) {
              const detailedDentist = await this.scrapeDetailedInfo(dentist);
              dentistsWithDetails.push(detailedDentist);
              
              // Save progress periodically
              if (dentistsWithDetails.length % 10 === 0) {
                this.saveData(dentistsWithDetails, `${specialty}_${state}_progress.json`);
              }
            }
            
            // Save complete state results
            this.saveData(dentistsWithDetails, `${specialty}_${state}.json`);
            
            // Add to full dataset
            this.scrapedDentists.push(...dentistsWithDetails);
            
            // Save full dataset periodically
            this.saveData(this.scrapedDentists, 'all_dentists.json');
          } else {
            console.log(`No dentists found for ${specialty} in ${state}`);
          }
        } catch (error) {
          console.error(`Error processing ${specialty} in ${state}:`, error.message);
          // Continue with next state/specialty
        }
        
        // Wait between regions to avoid overloading the server
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    // Save final results
    this.saveData(this.scrapedDentists, 'all_dentists_final.json');
    
    // Convert and save to database
    const dbFormat = this.convertToDatabaseFormat(this.scrapedDentists);
    await this.saveToDatabase(dbFormat);
    
    console.log(`\n=== Scraping complete! Total dentists found: ${this.scrapedDentists.length} ===\n`);
  }
}
