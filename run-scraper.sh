#!/bin/bash
# This script runs the dentist scraper with the correct TypeScript configuration

echo "Starting dentist scraper..."
npx ts-node --project tsconfig.scraper.json src/scripts/scrapers/minimal-scraper.ts

# Check if the scraper ran successfully
if [ $? -eq 0 ]; then
  echo "Scraper completed successfully!"
  echo "Now running phone finder..."
  npx ts-node --project tsconfig.scraper.json src/scripts/phone-finder.ts
else
  echo "Scraper failed. Check the logs above for errors."
  exit 1
fi
