#!/usr/bin/env node

/**
 * Test image analysis with a local image file
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testWithLocalImage() {
  const API_URL = process.env.API_URL || 'http://localhost:9999/.netlify/functions/image-analysis';
  
  console.log('Testing with local image file...');
  
  // Read the image file
  const imagePath = path.join(__dirname, 'public/images/simeontest.png');
  let imageBuffer;
  
  try {
    imageBuffer = fs.readFileSync(imagePath);
    console.log(`Loaded image: ${imagePath} (${imageBuffer.length} bytes)`);
  } catch (error) {
    console.error('Failed to read image:', error.message);
    // Try alternative test - download an image from unsplash
    console.log('\nTrying with remote image from Unsplash...');
    await testWithRemoteImage();
    return;
  }
  
  // Convert to base64
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;
  
  try {
    const response = await axios.post(API_URL, {
      imageUrl: dataUrl,
      symptoms: 'Dolor de cabeza persistente, fatiga, y manchas rojas en la piel'
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    displayResults(response.data);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response && error.response.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testWithRemoteImage() {
  const API_URL = process.env.API_URL || 'http://localhost:9999/.netlify/functions/image-analysis';
  
  // Use a face image from Unsplash (portrait)
  const imageUrl = 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop&q=80';
  
  try {
    console.log('Downloading image from Unsplash...');
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    const base64Image = Buffer.from(imageResponse.data).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    
    console.log(`Image downloaded (${imageResponse.data.length} bytes)`);
    console.log('Sending to image analysis API...');
    
    const response = await axios.post(API_URL, {
      imageUrl: dataUrl,
      symptoms: 'Fatiga crónica, palidez facial, ojeras marcadas'
    }, {
      timeout: 30000
    });
    
    displayResults(response.data);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response && error.response.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

function displayResults(data) {
  console.log('\n✅ SUCCESS! Image analysis completed');
  console.log('\n=== Response Summary ===');
  console.log('- Success:', data.success);
  console.log('- Model:', data.model);
  console.log('- Confidence:', data.confidence);
  console.log('- Severity:', data.severity);
  console.log('- Emergency:', data.emergency);
  console.log('- Suggested Specialty:', data.suggestedSpecialty);
  
  if (data.redFlags && data.redFlags.length > 0) {
    console.log('\n🚨 Red Flags:');
    data.redFlags.forEach(flag => {
      console.log(`  - ${flag}`);
    });
  }
  
  if (data.differentialDiagnosis && data.differentialDiagnosis.length > 0) {
    console.log('\n📋 Differential Diagnosis:');
    data.differentialDiagnosis.forEach((diag, i) => {
      console.log(`  ${i+1}. ${diag.condition} (${(diag.probability * 100).toFixed(0)}%)`);
      console.log(`     Reasoning: ${diag.reasoning}`);
    });
  }
  
  if (data.recommendations) {
    console.log('\n💊 Recommendations:');
    Object.entries(data.recommendations).forEach(([type, rec]) => {
      if (rec) {
        console.log(`  ${type}: ${rec}`);
      }
    });
  }
  
  if (data.culturalNotes) {
    console.log('\n🌮 Cultural Notes:');
    console.log(`  ${data.culturalNotes}`);
  }
  
  // Check improvements
  console.log('\n=== Improvement Checks ===');
  
  // 1. Confidence check
  if (data.confidence === 0.85) {
    console.log('❌ Confidence appears to be hardcoded at 0.85');
  } else {
    console.log('✅ Confidence is dynamic:', data.confidence);
  }
  
  // 2. Structured JSON check
  const hasStructuredData = data.differentialDiagnosis && 
                           data.recommendations && 
                           data.followUp &&
                           typeof data.emergency === 'boolean';
  if (hasStructuredData) {
    console.log('✅ Structured JSON response is working');
  } else {
    console.log('❌ Missing structured JSON fields');
  }
  
  // 3. Spanish language check
  const hasSpanish = data.analysis && 
                     (data.analysis.includes('análisis') || 
                      data.analysis.includes('hallazgos') ||
                      data.analysis.includes('observa'));
  if (hasSpanish) {
    console.log('✅ Response is in Spanish');
  } else {
    console.log('❌ Response might not be in Spanish');
  }
  
  // 4. Clinical prompt check
  const hasClinicalTerms = data.analysis && 
                          (data.analysis.includes('clínic') || 
                           data.analysis.includes('diagnóstic') ||
                           data.differentialDiagnosis?.length > 0);
  if (hasClinicalTerms) {
    console.log('✅ Clinical prompt is being used');
  } else {
    console.log('❌ Clinical prompt might not be working');
  }
  
  console.log('\n✅ All tests completed!');
}

// Run the test
testWithLocalImage();