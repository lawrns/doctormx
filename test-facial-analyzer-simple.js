// Simple test script to debug facial analyzer issue
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up environment
process.env.NODE_ENV = 'development';

// Mock DOM APIs
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          willReadFrequently: true,
          getImageData: (x, y, w, h) => ({
            width: w,
            height: h,
            data: new Uint8ClampedArray(w * h * 4),
            colorSpace: 'srgb'
          }),
          putImageData: () => {},
          drawImage: () => {},
          fillRect: () => {},
          fillStyle: ''
        })
      };
    }
    return {};
  }
};

global.Image = class {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.crossOrigin = '';
    this.src = '';
  }
  
  set onload(fn) {
    // Simulate successful image load
    setTimeout(() => fn(), 10);
  }
  
  set onerror(fn) {
    // Do nothing - simulate success
  }
};

// Import and test
async function runTest() {
  try {
    console.log('=== Testing Facial Analyzer ===\n');
    
    // Dynamic import to avoid module errors
    const { RealFacialAnalyzer } = await import('./packages/services/RealFacialAnalyzer.ts');
    
    console.log('✓ RealFacialAnalyzer imported successfully');
    
    // Get instance
    const analyzer = RealFacialAnalyzer.getInstance();
    console.log('✓ RealFacialAnalyzer instance created');
    
    // Check methods
    console.log('\nMethods check:');
    console.log('- analyzeFace exists:', !!analyzer.analyzeFace);
    console.log('- analyzeFace type:', typeof analyzer.analyzeFace);
    
    // Create test ImageData
    const testImageData = {
      width: 200,
      height: 200,
      data: new Uint8ClampedArray(200 * 200 * 4),
      colorSpace: 'srgb'
    };
    
    // Fill with skin-tone color
    for (let i = 0; i < testImageData.data.length; i += 4) {
      testImageData.data[i] = 253;     // R
      testImageData.data[i + 1] = 221; // G
      testImageData.data[i + 2] = 187; // B
      testImageData.data[i + 3] = 255; // A
    }
    
    console.log('\n✓ Test ImageData created:', {
      width: testImageData.width,
      height: testImageData.height,
      dataLength: testImageData.data.length,
      dataType: testImageData.data.constructor.name
    });
    
    // Try to analyze
    console.log('\nStarting facial analysis...');
    try {
      const result = await analyzer.analyzeFace(testImageData);
      console.log('\n✅ SUCCESS! Facial analysis completed');
      console.log('Result summary:', {
        confidence: result.confidence,
        healthIndicators: result.healthIndicators.length,
        overallHealth: result.overallFacialHealth.overall
      });
    } catch (analysisError) {
      console.error('\n❌ FACIAL ANALYSIS ERROR:');
      console.error('Message:', analysisError.message);
      console.error('Type:', analysisError.constructor.name);
      console.error('Stack:', analysisError.stack);
      
      // Try to get more details
      if (analysisError.cause) {
        console.error('Cause:', analysisError.cause);
      }
    }
    
  } catch (error) {
    console.error('\n❌ TEST SETUP ERROR:');
    console.error('Message:', error.message);
    console.error('Type:', error.constructor.name);
    console.error('Stack:', error.stack);
  }
}

// Run the test
console.log('Starting test...\n');
runTest().then(() => {
  console.log('\nTest completed');
}).catch(error => {
  console.error('\nTest failed:', error);
});