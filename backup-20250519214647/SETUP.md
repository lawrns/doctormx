# Setting Up the Dentist Scraper

Follow these steps to set up and run the dentist scraping scripts:

## 1. Install necessary dependencies

The scraper needs the following additional packages that aren't currently in the project:

```bash
npm install --save axios cheerio@1.0.0-rc.12 dotenv
npm install --save-dev @types/cheerio @types/dotenv
```

## 2. Create data directory

```bash
mkdir -p data/scraped
```

## 3. Run the scraper

You can run all scrapers at once:

```bash
npx ts-node src/scripts/scrapers/index.ts
```

Or run specific utilities:

```bash
# Remove duplicates from a file
npx ts-node -e "import { removeDuplicates } from './src/scripts/scrapers/utils'; removeDuplicates('all_dentists_final.json', 'all_dentists_unique.json');"

# Merge data from multiple sources
npx ts-node -e "import { mergeData } from './src/scripts/scrapers/utils'; mergeData(['all_dentists_unique.json', 'all_yellow_pages_dentists_unique.json'], 'all_dentists_merged.json');"

# Upload merged data to database
npx ts-node -e "import { uploadToDatabaseWithDuplicateCheck } from './src/scripts/scrapers/utils'; uploadToDatabaseWithDuplicateCheck('all_dentists_merged.json');"
```

## 4. Monitor progress

The scrapers will output progress to the console and save intermediary files in the `data/scraped` directory. You can check these files to monitor progress.

## 5. Legal considerations

Web scraping may violate the terms of service of some websites. Make sure to:

- Respect robots.txt directives
- Implement proper delays between requests (already built into the scrapers)
- Only use the data for legitimate purposes
- Consider reaching out to the websites for an official API or partnership

## 6. Database structure

The scrapers are designed to work with the current database structure, which includes the following tables:

- `dentists` (main table)
- `dentist_services`
- `dentist_prices`
- `dentist_reviews`
- `dentist_images`
- `dentist_insurances`
- `dentist_languages`

## 7. Extending the scrapers

To add more sources, create a new file that extends the `BaseScraper` class and implement the required methods. Then add it to the `index.ts` file to include it in the main scraping process.
