import axios from 'axios';
import { load } from 'cheerio';
import { setTimeout } from 'timers/promises';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Base scraper class that can be extended for different websites
 */
export abstract class BaseScraper {
  protected userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
  ];
  
  protected delayMin: number = 2000; // Min delay between requests in ms
  protected delayMax: number = 5000; // Max delay between requests in ms
  
  protected outputDir: string = path.join(__dirname, '../../../data/scraped');
  
  constructor() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Get a random user agent to avoid detection
   */
  protected getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }
  
  /**
   * Make an HTTP request with proper headers and error handling
   */
  protected async makeRequest(url: string): Promise<string> {
    try {
      // Random delay to make requests appear more human
      const delay = Math.floor(Math.random() * (this.delayMax - this.delayMin + 1)) + this.delayMin;
      await setTimeout(delay);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error making request to ${url}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Parse HTML with Cheerio
   */
  protected parseHTML(html: string) {
    return load(html);
  }
  
  /**
   * Save JSON data to file
   */
  protected saveData(data: any[], filename: string): void {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved ${data.length} records to ${filePath}`);
  }
  
  /**
   * Main method to run the scraper - should be implemented by specific scrapers
   */
  public abstract run(): Promise<void>;
}
