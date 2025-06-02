#!/usr/bin/env node

/**
 * Test script for image analysis improvements
 * Verifies:
 * 1. Clinical prompt is working
 * 2. JSON output is structured correctly
 * 3. Confidence is not fixed at 0.85
 * 4. Protocol recommendations are generated
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:8888/.netlify/functions/image-analysis';
const TEST_IMAGE_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='; // Small test image

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testImageAnalysis() {
  log('\n=== Testing Image Analysis Improvements ===\n', 'blue');
  
  try {
    // Test 1: Basic API call
    log('Test 1: Making API call...', 'yellow');
    const response = await axios.post(API_URL, {
      imageUrl: TEST_IMAGE_URL,
      symptoms: 'Dolor de cabeza y fatiga desde hace 3 días'
    });
    
    const data = response.data;
    log('✓ API call successful', 'green');
    
    // Test 2: Check for structured JSON response
    log('\nTest 2: Checking structured JSON response...', 'yellow');
    const requiredFields = [
      'analysis', 'findings', 'confidence', 'severity', 
      'suggestedSpecialty', 'success', 'emergency', 
      'redFlags', 'differentialDiagnosis', 'recommendations',
      'followUp', 'culturalNotes', 'disclaimers'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length === 0) {
      log('✓ All required fields present', 'green');
    } else {
      log(`✗ Missing fields: ${missingFields.join(', ')}`, 'red');
    }
    
    // Test 3: Check confidence is not fixed at 0.85
    log('\nTest 3: Checking confidence value...', 'yellow');
    if (data.confidence === 0.85) {
      log('⚠ WARNING: Confidence is still fixed at 0.85', 'red');
    } else {
      log(`✓ Confidence is dynamic: ${data.confidence}`, 'green');
    }
    
    // Test 4: Check for differential diagnosis
    log('\nTest 4: Checking differential diagnosis...', 'yellow');
    if (data.differentialDiagnosis && Array.isArray(data.differentialDiagnosis)) {
      log(`✓ Differential diagnosis present with ${data.differentialDiagnosis.length} items`, 'green');
      data.differentialDiagnosis.forEach((diag, i) => {
        log(`  ${i+1}. ${diag.condition} (${(diag.probability * 100).toFixed(0)}%)`, 'blue');
      });
    } else {
      log('✗ No differential diagnosis found', 'red');
    }
    
    // Test 5: Check for recommendations
    log('\nTest 5: Checking recommendations...', 'yellow');
    if (data.recommendations && typeof data.recommendations === 'object') {
      const recTypes = Object.keys(data.recommendations);
      log(`✓ Recommendations present: ${recTypes.join(', ')}`, 'green');
      Object.entries(data.recommendations).forEach(([type, rec]) => {
        if (rec) {
          log(`  ${type}: ${rec.substring(0, 50)}...`, 'blue');
        }
      });
    } else {
      log('✗ No recommendations found', 'red');
    }
    
    // Test 6: Check for emergency detection
    log('\nTest 6: Checking emergency detection...', 'yellow');
    log(`Emergency: ${data.emergency ? 'YES' : 'NO'}`, data.emergency ? 'red' : 'green');
    if (data.redFlags && data.redFlags.length > 0) {
      log(`Red flags: ${data.redFlags.join(', ')}`, 'red');
    }
    
    // Test 7: Check for cultural context
    log('\nTest 7: Checking Mexican cultural context...', 'yellow');
    if (data.culturalNotes && data.culturalNotes.length > 0) {
      log('✓ Cultural notes present', 'green');
      log(`  ${data.culturalNotes}`, 'blue');
    } else {
      log('✗ No cultural notes found', 'red');
    }
    
    // Test 8: Check analysis language
    log('\nTest 8: Checking language (should be Spanish)...', 'yellow');
    const spanishWords = ['análisis', 'hallazgos', 'recomendaciones', 'signos', 'síntomas'];
    const hasSpanish = spanishWords.some(word => 
      data.analysis.toLowerCase().includes(word) || 
      (data.findings && data.findings.toLowerCase().includes(word))
    );
    
    if (hasSpanish) {
      log('✓ Analysis is in Spanish', 'green');
    } else {
      log('⚠ Analysis might not be in Spanish', 'yellow');
    }
    
    // Summary
    log('\n=== Summary ===', 'blue');
    log(`Analysis confidence: ${data.confidence}`, 'green');
    log(`Severity: ${data.severity}`, 'green');
    log(`Suggested specialty: ${data.suggestedSpecialty}`, 'green');
    log(`Success: ${data.success}`, 'green');
    
    // Display full response for debugging
    if (process.env.DEBUG) {
      log('\n=== Full Response ===', 'yellow');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    process.exit(1);
  }
}

// Test with different image scenarios
async function testMultipleScenarios() {
  log('\n=== Testing Multiple Scenarios ===\n', 'blue');
  
  const scenarios = [
    {
      name: 'Skin rash',
      symptoms: 'Sarpullido rojo con picazón en los brazos desde hace 5 días'
    },
    {
      name: 'Facial paleness',
      symptoms: 'Palidez facial, cansancio extremo y mareos frecuentes'
    },
    {
      name: 'No symptoms',
      symptoms: ''
    }
  ];
  
  for (const scenario of scenarios) {
    log(`\nTesting scenario: ${scenario.name}`, 'yellow');
    try {
      const response = await axios.post(API_URL, {
        imageUrl: TEST_IMAGE_URL,
        symptoms: scenario.symptoms
      });
      
      const data = response.data;
      log(`✓ Confidence: ${data.confidence}`, 'green');
      log(`✓ Emergency: ${data.emergency ? 'YES' : 'NO'}`, data.emergency ? 'red' : 'green');
      
      if (data.differentialDiagnosis && data.differentialDiagnosis.length > 0) {
        log(`✓ Top diagnosis: ${data.differentialDiagnosis[0].condition}`, 'blue');
      }
    } catch (error) {
      log(`✗ Failed: ${error.message}`, 'red');
    }
  }
}

// Main execution
async function main() {
  log('Starting Image Analysis Tests...', 'blue');
  log(`API URL: ${API_URL}`, 'yellow');
  
  // Check if running locally
  if (API_URL.includes('localhost')) {
    log('\n⚠ Note: Running against local development server', 'yellow');
    log('Make sure to run "npm run dev" in another terminal\n', 'yellow');
  }
  
  await testImageAnalysis();
  
  if (process.env.FULL_TEST) {
    await testMultipleScenarios();
  }
  
  log('\n✓ All tests completed!', 'green');
}

// Run tests
main().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});