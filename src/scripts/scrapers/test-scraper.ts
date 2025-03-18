import axios from 'axios';
import { load } from 'cheerio';

// Simple test script to verify scraper functionality

async function testScraper() {
  try {
    console.log('Testing scraper functionality...');
    
    // Make a simple request to a public website
    console.log('Testing HTTP request...');
    const response = await axios.get('https://www.example.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log('Response received, status:', response.status);
    
    // Test cheerio parsing
    console.log('Testing cheerio parsing...');
    const $ = load(response.data);
    const title = $('title').text();
    
    console.log('Page title:', title);
    
    // Verify fs functionality
    console.log('Testing file system...');
    const fs = require('fs');
    const path = require('path');
    
    const testDir = path.join(__dirname, '../../../data/test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
      console.log('Created test directory at:', testDir);
    }
    
    const testFile = path.join(testDir, 'test.json');
    fs.writeFileSync(testFile, JSON.stringify({ test: 'success' }), 'utf8');
    console.log('Wrote test file to:', testFile);
    
    console.log('All basic scraper functionality is working!');
  } catch (error) {
    console.error('Error testing scraper:', error);
  }
}

// Run the test
testScraper().catch(console.error);
