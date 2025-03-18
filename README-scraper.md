# Doctoralia Mexico Scraper

This project includes tools to scrape dentist information from Doctoralia Mexico and find their phone numbers through web searches. The data is saved in both JSON and Excel formats.

## Prerequisites

Make sure you have Node.js and npm installed on your machine. Then install the required dependencies:

```bash
# Install dependencies
npm install xlsx cheerio axios dotenv @supabase/supabase-js
```

## Easy Way to Run

For the easiest method, use the included shell script:

```bash
# Make the script executable first
chmod +x run-scraper.sh

# Then run it
./run-scraper.sh
```

This script will:
1. Run the scraper with the correct TypeScript configuration
2. After successful scraping, automatically run the phone finder

## Manual Step-by-Step

### Step 1: Scrape Dentist Information

First, run the scraper to collect basic dentist information from Doctoralia:

```bash
# Run with custom TypeScript config
npx ts-node --project tsconfig.scraper.json src/scripts/scrapers/minimal-scraper.ts
```

This script will:
- Fetch dentists from Doctoralia Mexico
- Extract their names, addresses, and other information
- Save the data to `data/scraped/test-results.json`
- Save the HTML for inspection in `data/scraped/test-page.html`

### Step 2: Find Phone Numbers & Generate Excel Report

After scraping the basic information, run the phone finder script:

```bash
# Run with custom TypeScript config
npx ts-node --project tsconfig.scraper.json src/scripts/phone-finder.ts
```

This script will:
- Read the scraped dentist data
- Search for phone numbers using web search (using Brave Search API)
- Generate two outputs:
  1. `data/scraped/dentists-with-phones.json` - JSON data with phone numbers
  2. `data/scraped/dentistas.xlsx` - Excel file with all data organized in columns

## Output Format

The Excel file (`dentistas.xlsx`) contains the following columns:

- **Nombre**: Dentist's name
- **Dirección**: Address
- **Teléfono**: Phone number (if found)
- **Especialidad**: Specialty (usually "Dentista")
- **Página**: Page number from search results
- **URL**: Source URL
- **Fecha de Extracción**: Date when the data was scraped
- **Estado**: Status (Complete or Pending)

## Notes for Implementation

## Implementing Brave Search API

To implement the phone number search using the Brave Search API:

1. First, run the example script to understand how the API works:

```bash
npx ts-node --project tsconfig.scraper.json src/scripts/brave-search-example.ts
```

2. In `phone-finder.ts`, update these lines:

```typescript
// Comment out these placeholder lines:
// const phoneNumber = 'Use brave_web_search API with: ' + searchQuery;

// Uncomment and use these lines instead:
const searchResults = await brave_web_search({
  query: searchQuery,
  count: 5
});

const phoneNumber = extractPhoneNumber(searchResults);
```

The script already includes a robust `extractPhoneNumber` function that can extract phone numbers from the search results using regular expressions tailored for Mexican phone number formats.

## Handling Large Datasets

For large datasets (e.g., all 456 pages of dentists):

1. Update the `pagesToScrape` variable in `minimal-scraper.ts` to scrape more pages
2. In `phone-finder.ts`, adjust the `limitToProcess` variable to process more dentists

## Troubleshooting

- If scraping fails, check the saved HTML to verify the page structure
- Ensure you're not making too many requests too quickly to avoid getting blocked
- Check the network logs for any request failures
