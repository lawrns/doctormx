# Mexico Dentist Scraper

This module contains web scrapers designed to collect information about dentists across Mexico, including their contact details, particularly phone numbers. The scrapers are built to work with popular dental directories in Mexico.

## Scrapers Included

1. **Doctoralia Scraper** - Scrapes dentist data from doctoralia.com.mx, one of the most comprehensive medical directories in Mexico.
2. **Páginas Amarillas Scraper** - Collects dentist information from the Mexican Yellow Pages (paginasamarillas.com.mx).

## Features

- Collects dentist names, clinic names, addresses, phone numbers, and websites
- Covers all 32 Mexican states
- Handles pagination automatically
- Implements proper delays to avoid rate limiting
- Saves progress periodically in case of interruptions
- Converts data to the correct format for our database
- Uploads the data directly to our Supabase database

## Requirements

The scrapers require the following dependencies:
- axios
- cheerio
- fs/promises
- supabase/js client

## Usage

### To run all scrapers:

```bash
cd /Users/excite/Documents/GitHub/doctormx
npx ts-node src/scripts/scrapers/index.ts
```

### To run a specific scraper:

```bash
# For Doctoralia
npx ts-node -e "import { DoctoraliaScraperMX } from './src/scripts/scrapers/doctoralia-scraper'; new DoctoraliaScraperMX().run();"

# For Páginas Amarillas
npx ts-node -e "import { PaginasAmarillasScraper } from './src/scripts/scrapers/paginas-amarillas-scraper'; new PaginasAmarillasScraper().run();"
```

## Data Output

The scrapers save data in the following locations:
- Raw JSON files: `/data/scraped/`
- Database: The data is uploaded to the `dentists` table in Supabase

## Best Practices and Limitations

1. **Rate Limiting**: The scrapers implement random delays between requests to avoid being blocked.

2. **Legal Considerations**: Be aware that web scraping may be against the terms of service of some websites. Use these scrapers responsibly and for legitimate purposes.

3. **Data Quality**: The quality of data may vary. Phone numbers in particular might be obfuscated on some websites to prevent scraping. The scrapers try multiple strategies to extract this information, but success rates may vary.

4. **Maintenance**: Websites frequently change their structure, which can break scrapers. Regular maintenance may be needed.

## Extending

To add more sources, create a new scraper that extends the `BaseScraper` class and implement the required methods.

## Troubleshooting

If you encounter rate limiting or IP blocking, you may need to:
1. Increase the delay between requests
2. Use a proxy rotation service
3. Run the scrapers from different IP addresses

## Legal Disclaimer

These scrapers are provided for educational purposes only. Be sure to comply with the terms of service of any website you scrape, as well as applicable laws regarding data collection and privacy.
