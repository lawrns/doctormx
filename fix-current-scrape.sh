#!/bin/bash
# This script fixes the current scrape by creating Excel from the test-results.json

echo "=== Fixing Current Scrape ==="
echo "This script will create a properly formatted Excel file from the test-results.json"
echo ""

# Check if test-results.json exists
if [ ! -f "./data/scraped/test-results.json" ]; then
    echo "Error: test-results.json not found. Please run the scraper first."
    exit 1
fi

# Get count of dentists in the JSON file
DENTIST_COUNT=$(cat ./data/scraped/test-results.json | grep -o '"name"' | wc -l)
echo "Found $DENTIST_COUNT dentists in test-results.json"
echo ""

# Create Excel file from JSON
echo "Creating Excel file from JSON data..."
npx ts-node --project tsconfig.scraper.json src/scripts/create-excel-from-json.ts

# Check if successful
if [ $? -ne 0 ]; then
    echo "Failed to create Excel file. Please check errors above."
    exit 1
fi

echo ""
echo "=== Scrape Fix Completed! ==="
echo "You should now have a proper Excel file at: ./data/scraped/dentistas-all.xlsx"
echo "This file contains all unique dentists from your scrape."
echo ""
echo "If you want to find phone numbers:"
echo "1. When you're ready to use the Brave Search API,"
echo "2. Update your API key in the brave-phone-finder.ts file"
echo "3. Run: npx ts-node --project tsconfig.scraper.json src/scripts/brave-phone-finder.ts"
