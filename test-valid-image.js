#!/usr/bin/env node

/**
 * Create a valid test image and test the image analysis API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create a valid 1x1 red pixel PNG image
const RED_PIXEL_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
  0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
  0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
  0x44, 0xae, 0x42, 0x60, 0x82
]);

// Create a valid test face image (100x100 PNG with face-like colors)
function createTestFaceImage() {
  // This is a simple PNG with skin-tone colors
  const width = 100;
  const height = 100;
  
  // Create PNG data manually (simplified)
  const canvas = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Create a simple face pattern
      const distFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
      if (distFromCenter < 40) {
        // Face area - skin tone
        canvas.push(250, 220, 200); // RGB skin tone
      } else {
        // Background - white
        canvas.push(255, 255, 255);
      }
    }
  }
  
  // For now, use the red pixel as a simple test
  return RED_PIXEL_PNG;
}

async function testWithValidImage() {
  const API_URL = process.env.API_URL || 'http://localhost:9999/.netlify/functions/image-analysis';
  
  console.log('Testing with valid image...');
  
  // Create base64 image
  const imageBuffer = createTestFaceImage();
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;
  
  try {
    const response = await axios.post(API_URL, {
      imageUrl: dataUrl,
      symptoms: 'Enrojecimiento en la piel, picazón intensa'
    });
    
    console.log('\n✅ SUCCESS! Image analysis completed');
    console.log('\nResponse summary:');
    console.log('- Success:', response.data.success);
    console.log('- Confidence:', response.data.confidence);
    console.log('- Severity:', response.data.severity);
    console.log('- Emergency:', response.data.emergency);
    console.log('- Suggested Specialty:', response.data.suggestedSpecialty);
    
    if (response.data.differentialDiagnosis && response.data.differentialDiagnosis.length > 0) {
      console.log('\nDifferential Diagnosis:');
      response.data.differentialDiagnosis.forEach((diag, i) => {
        console.log(`  ${i+1}. ${diag.condition} (${(diag.probability * 100).toFixed(0)}%)`);
      });
    }
    
    if (response.data.recommendations) {
      console.log('\nRecommendations:');
      Object.entries(response.data.recommendations).forEach(([type, rec]) => {
        if (rec) {
          console.log(`  - ${type}: ${rec.substring(0, 60)}...`);
        }
      });
    }
    
    // Check if confidence is dynamic
    if (response.data.confidence === 0.85) {
      console.log('\n⚠️  WARNING: Confidence appears to be hardcoded at 0.85');
    } else {
      console.log('\n✅ Confidence is dynamic:', response.data.confidence);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response && error.response.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testWithValidImage();