#!/bin/bash
# This script runs a full scrape of all pages with Brave search for phone numbers
# WARNING: This can take a long time to run.

echo "========================================================"
echo "=== Full Dentist Scraper with Brave Search for Phones ==="
echo "========================================================"
echo "This script will scrape all 456 pages of dentists and look up phone numbers."
echo "Note: This can take several hours to complete!"
echo ""
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Scrape cancelled."
    exit 1
fi

# Create data directory if it doesn't exist
mkdir -p ./data/scraped

# Step 1: Run the full scraper
echo "=== Step 1: Running full dentist scraper (all 456 pages) ==="
npx ts-node --project tsconfig.scraper.json src/scripts/scrapers/minimal-scraper.ts

# Check if the scraper ran successfully
if [ $? -ne 0 ]; then
  echo "Scraper failed. Exiting."
  exit 1
fi

echo ""

# Step 2: Run the Brave phone finder on a larger set of dentists
echo "=== Step 2: Finding phone numbers using Brave Search ==="
npx ts-node --project tsconfig.scraper.json src/scripts/brave-phone-finder.ts

# Check if the phone finder ran successfully
if [ $? -ne 0 ]; then
  echo "Phone finder failed. Continuing to Excel fixer..."
fi

echo ""

# Step 3: Fix the Excel file and remove duplicates
echo "=== Step 3: Fixing Excel file format and removing duplicates ==="
npx ts-node --project tsconfig.scraper.json src/scripts/fix-excel-dedup.ts

echo ""
echo "========================================================"
echo "=== Full Scrape Completed! ==="
echo "========================================================"
echo "Check data/scraped directory for output files:"
echo "- test-results.json: Raw dentist data from all pages"
echo "- dentists-with-phones.json: Dentist data with phone numbers"
echo "- dentistas.xlsx: Original Excel file"
echo "- dentistas-deduped.xlsx: Final Excel file with no duplicates"
echo ""
echo "Total dentists scraped: $(cat ./data/scraped/test-results.json | grep -o '\"name\"' | wc -l)"
echo "Unique dentists (after deduplication): $(cat ./data/scraped/dentists-with-phones.json | grep -o '\"name\"' | wc -l)"
echo ""
echo "You can now open dentistas-deduped.xlsx to view all dentist data in a neat format."
