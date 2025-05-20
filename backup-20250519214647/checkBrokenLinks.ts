/**
 * Broken Link Checker
 * 
 * This script checks for broken links in the website.
 * It can be run manually or as part of a CI/CD pipeline.
 */

/*
 * To run this script, you'll need to:
 * 1. Install the required dependencies:
 *    npm install --save-dev broken-link-checker
 * 2. Run with:
 *    npx ts-node src/scripts/checkBrokenLinks.ts
 */

import * as blc from 'broken-link-checker';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://doctor.mx'; // Update with production URL or local dev URL
const MAX_CONCURRENT_REQUESTS = 5;
const IGNORE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|svg|webp)$/i, // Skip checking image URLs
  /\/api\//i,                         // Skip API endpoints
  /\/admin\//i,                       // Skip admin pages
  /facebook\.com/i,                   // Skip external social media
  /twitter\.com/i,
  /instagram\.com/i,
  /linkedin\.com/i
];

// Setup logging
const logFile = path.resolve(process.cwd(), 'broken-links-report.json');
const results = {
  brokenLinks: [],
  checkedLinks: 0,
  brokenCount: 0,
  startTime: new Date().toISOString(),
  endTime: null
};

console.log('Starting broken link checker...');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Log file: ${logFile}`);

// Configure the link checker
const options = {
  excludedKeywords: IGNORE_PATTERNS,
  filterLevel: 1, // 0 = everything, 1 = exclude same domain
  maxSocketsPerHost: MAX_CONCURRENT_REQUESTS,
  honorRobotExclusions: true,
  requestMethod: 'GET'
};

// Initialize the site checker
const siteChecker = new blc.SiteChecker(options, {
  robots: (robots, customData) => {
    console.log(`Robots.txt parsed: ${robots.isAllowed(BASE_URL)}`);
  },
  html: (tree, robots, response, pageUrl, customData) => {
    console.log(`Scanning: ${pageUrl}`);
  },
  junk: (result, customData) => {
    // Skip reporting junk URLs (mailto, tel, etc.)
  },
  link: (result, customData) => {
    results.checkedLinks++;
    
    if (result.broken) {
      results.brokenCount++;
      results.brokenLinks.push({
        url: result.url.resolved,
        base: result.base.resolved,
        reason: result.brokenReason,
        status: result.http?.response?.statusCode || 'N/A'
      });
      
      console.log(`Broken link: ${result.url.resolved} (${result.brokenReason})`);
      console.log(`  Found on: ${result.base.resolved}`);
    }
    
    // Periodically save results
    if (results.checkedLinks % 100 === 0) {
      saveResults();
    }
  },
  page: (error, pageUrl, customData) => {
    if (error) {
      console.error(`Error scanning page ${pageUrl}: ${error.message}`);
    }
  },
  end: () => {
    results.endTime = new Date().toISOString();
    
    console.log('\nScan completed!');
    console.log(`Total links checked: ${results.checkedLinks}`);
    console.log(`Broken links found: ${results.brokenCount}`);
    
    saveResults();
    console.log(`Full report saved to: ${logFile}`);
  }
});

// Start the scan
siteChecker.enqueue(BASE_URL);

// Function to save the results to a file
function saveResults() {
  const currentResults = {
    ...results,
    endTime: new Date().toISOString()
  };
  
  fs.writeFileSync(logFile, JSON.stringify(currentResults, null, 2));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nScan interrupted!');
  results.endTime = new Date().toISOString();
  saveResults();
  process.exit();
});