# Full Dentist Scraper with Brave Search

This tool allows you to scrape all dentists from Doctoralia Mexico and find their phone numbers using Brave Search.

## Features

- Scrapes all 456 pages of dentists on Doctoralia Mexico
- Extracts detailed information including name, address, specialty
- Uses Brave Search to find phone numbers for each dentist
- Processes and deduplicates data to avoid repeated entries
- Produces a clean, well-formatted Excel file

## Prerequisites

Make sure you have Node.js and npm installed, then install the required dependencies:

```bash
npm install xlsx cheerio axios dotenv @supabase/supabase-js
```

## Running the Full Scrape

For a complete scrape of all 456 pages with phone number search:

```bash
# Make the script executable
chmod +x run-full-scrape.sh

# Run the full scrape
./run-full-scrape.sh
```

**WARNING**: The full scrape can take several hours to complete, depending on your internet connection and the delay settings.

## Configuring the Scraper

You can adjust the scraper's behavior by editing `scraper-config.json`:

- Change the number of pages to scrape
- Adjust the delays between requests
- Configure how many dentists to search for phone numbers
- Modify search query templates
- Change output file names and locations

## Manual Step-by-Step Process

If you prefer to run each step individually:

### 1. Scrape the Dentists

```bash
npx ts-node --project tsconfig.scraper.json src/scripts/scrapers/minimal-scraper.ts
```

This will scrape all pages and save the results to `data/scraped/test-results.json`.

### 2. Find Phone Numbers

```bash
npx ts-node --project tsconfig.scraper.json src/scripts/brave-phone-finder.ts
```

This will search for phone numbers using Brave Search and save the results to `data/scraped/dentists-with-phones.json`.

### 3. Fix Excel Format and Remove Duplicates

```bash
npx ts-node --project tsconfig.scraper.json src/scripts/fix-excel-dedup.ts
```

This will fix the Excel file format and remove duplicate entries, saving the results to `data/scraped/dentistas-deduped.xlsx`.

## Output Files

The scraper produces these files in the `data/scraped` directory:

- `test-results.json` - Raw scraper output with all dentists
- `dentists-with-phones.json` - Dentists with phone numbers (if found)
- `dentistas.xlsx` - Excel file with all dentists
- `dentistas-deduped.xlsx` - Final Excel file with duplicates removed

## Fixing a Completed Scrape

If you've already run the scraper and have the test-results.json file but encountered issues with phone finding or Excel generation, you can run:

```bash
chmod +x fix-current-scrape.sh
./fix-current-scrape.sh
```

This will create a properly formatted Excel file directly from the test-results.json file, with all unique dentists and no duplicates.

The created file will be saved as `data/scraped/dentistas-all.xlsx`.

## Troubleshooting

If the scraper fails:

1. Check the HTML structure by examining `data/scraped/full-html.html`
2. Adjust the delay settings if you're getting rate limited
3. Try running with fewer pages first to test
4. Check the Brave Search API access if phone searches are failing

If the phone finder step fails but you have the test-results.json file, use the fix-current-scrape.sh script described above.

## Note on Respect for Websites

When scraping websites, be considerate of their resources:
- Use reasonable delays between requests
- Don't make excessive requests in a short period
- Consider limiting the full scrape to only what you need
