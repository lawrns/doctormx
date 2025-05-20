#!/bin/bash
# This script runs the complete dentist data pipeline:
# 1. Scrape the data
# 2. Find phone numbers using Brave Search
# 3. Fix any existing Excel files

echo "=== DoctorMX Data Pipeline ==="
echo "Starting the complete workflow to collect and process dentist data"
echo ""

# Create data directory if it doesn't exist
mkdir -p ./data/scraped

# Step 1: Run the scraper
echo "=== Step 1: Running dentist scraper ==="
npx ts-node --project tsconfig.scraper.json src/scripts/scrapers/minimal-scraper.ts

# Check if the scraper ran successfully
if [ $? -ne 0 ]; then
  echo "Scraper failed. Exiting."
  exit 1
fi

echo ""

# Step 2: Run the Brave phone finder
echo "=== Step 2: Finding phone numbers using Brave Search ==="
npx ts-node --project tsconfig.scraper.json src/scripts/brave-phone-finder.ts

# Check if the phone finder ran successfully
if [ $? -ne 0 ]; then
  echo "Phone finder failed. Continuing to Excel fixer..."
fi

echo ""

# Step 3: Fix any existing Excel files and remove duplicates
echo "=== Step 3: Fixing Excel file format and removing duplicates ==="
npx ts-node --project tsconfig.scraper.json src/scripts/fix-excel-dedup.ts

echo ""
echo "=== Pipeline Completed ==="
echo "Check data/scraped directory for output files:"
echo "- test-results.json: Raw dentist data"
echo "- dentists-with-phones.json: Dentist data with phone numbers"
echo "- dentistas.xlsx: Original Excel file"
echo "- dentistas-deduped.xlsx: Fixed Excel file with better formatting and no duplicates"
echo ""
echo "You can now open dentistas-deduped.xlsx to view all dentist data in a neat format."
