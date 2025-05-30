/**
 * Comprehensive Image Analysis Test Suite
 * Tests all medical image analysis functionality in DoctorMX
 */

// Import the services we need to test
import { ComprehensiveMedicalImageAnalyzer } from './packages/services/ComprehensiveMedicalImageAnalyzer.js';
import { RealTimeImageProcessor } from './packages/services/RealTimeImageProcessor.js';
import { IntelligentTreatmentEngine } from './packages/services/IntelligentTreatmentEngine.js';

// Test utilities
const createMockImageData = (width = 640, height = 480) => {
  // Create a mock base64 image data
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (canvas) {
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create a simple test pattern
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(0, 0, width/2, height/2);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(width/2, 0, width/2, height/2);
    ctx.fillStyle = '#45B7D1';
    ctx.fillRect(0, height/2, width/2, height/2);
    ctx.fillStyle = '#96CEB4';
    ctx.fillRect(width/2, height/2, width/2, height/2);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }
  
  // Fallback mock data for non-browser environments
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
};

const createMockFile = (name = 'test-image.jpg', type = 'image/jpeg') => {
  if (typeof Blob !== 'undefined') {
    return new File(['mock image data'], name, { type });
  }
  return { name, type, size: 1024 };
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Test utilities
const assert = (condition, message) => {
  if (condition) {
    testResults.passed++;
    testResults.details.push(`✅ PASS: ${message}`);
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    testResults.details.push(`❌ FAIL: ${message}`);
    console.error(`❌ FAIL: ${message}`);
  }
};

const assertEqual = (actual, expected, message) => {
  assert(actual === expected, `${message} (expected: ${expected}, actual: ${actual})`);
};

const assertExists = (value, message) => {
  assert(value !== null && value !== undefined, `${message} should exist`);
};

const assertType = (value, type, message) => {
  assert(typeof value === type, `${message} should be of type ${type}`);
};

// Main test function
async function runComprehensiveImageAnalysisTests() {
  console.log('🧪 Starting Comprehensive Image Analysis Tests...\n');
  
  try {
    // Test 1: Service Initialization
    console.log('📋 Test Group 1: Service Initialization');
    await testServiceInitialization();
    
    // Test 2: Analysis Type Support
    console.log('\n📋 Test Group 2: Analysis Type Support');
    await testAnalysisTypeSupport();
    
    // Test 3: Image Quality Assessment
    console.log('\n📋 Test Group 3: Image Quality Assessment');
    await testImageQualityAssessment();
    
    // Test 4: Individual Analysis Types
    console.log('\n📋 Test Group 4: Individual Analysis Types');
    await testIndividualAnalysisTypes();
    
    // Test 5: Real-Time Processing
    console.log('\n📋 Test Group 5: Real-Time Processing');
    await testRealTimeProcessing();
    
    // Test 6: Treatment Engine Integration
    console.log('\n📋 Test Group 6: Treatment Engine Integration');
    await testTreatmentEngineIntegration();
    
    // Test 7: Error Handling
    console.log('\n📋 Test Group 7: Error Handling');
    await testErrorHandling();
    
    // Test 8: Cultural Context Integration
    console.log('\n📋 Test Group 8: Cultural Context Integration');
    await testCulturalContextIntegration();
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Test suite error: ${error.message}`);
    console.error('❌ Test suite error:', error);
  }
  
  // Print final results
  printTestResults();
}

// Test Group 1: Service Initialization
async function testServiceInitialization() {
  try {
    // Test ComprehensiveMedicalImageAnalyzer singleton
    const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    assertExists(analyzer, 'ComprehensiveMedicalImageAnalyzer instance');
    
    // Test that getInstance returns the same instance
    const analyzer2 = ComprehensiveMedicalImageAnalyzer.getInstance();
    assert(analyzer === analyzer2, 'ComprehensiveMedicalImageAnalyzer singleton pattern');
    
    // Test RealTimeImageProcessor singleton
    const processor = RealTimeImageProcessor.getInstance();
    assertExists(processor, 'RealTimeImageProcessor instance');
    
    // Test supported analysis types
    const supportedTypes = analyzer.getSupportedAnalysisTypes();
    assertExists(supportedTypes, 'Supported analysis types');
    assert(Array.isArray(supportedTypes), 'Supported types is array');
    assert(supportedTypes.length > 0, 'Has supported analysis types');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Service initialization error: ${error.message}`);
    console.error('Service initialization error:', error);
  }
}

// Test Group 2: Analysis Type Support
async function testAnalysisTypeSupport() {
  try {
    const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    const supportedTypes = analyzer.getSupportedAnalysisTypes();
    
    // Test all expected analysis types are supported
    const expectedTypes = [
      'facial_analysis',
      'eye_analysis', 
      'tongue_diagnosis',
      'skin_analysis',
      'nail_analysis',
      'hair_scalp_analysis',
      'posture_analysis',
      'comprehensive_scan'
    ];
    
    for (const type of expectedTypes) {
      assert(supportedTypes.includes(type), `Supports ${type}`);
    }
    
    // Test requirements for each analysis type
    for (const type of supportedTypes) {
      const requirements = analyzer.getAnalysisRequirements(type);
      assertExists(requirements, `Requirements for ${type}`);
      assertExists(requirements.minResolution, `Min resolution for ${type}`);
      assertExists(requirements.requiredLighting, `Required lighting for ${type}`);
      assertExists(requirements.colorAccuracy, `Color accuracy for ${type}`);
    }
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Analysis type support error: ${error.message}`);
    console.error('Analysis type support error:', error);
  }
}

// Test Group 3: Image Quality Assessment
async function testImageQualityAssessment() {
  try {
    const mockImageData = createMockImageData();
    
    const analysisInput = {
      imageData: mockImageData,
      analysisType: 'facial_analysis',
      culturalContext: 'mexican'
    };
    
    // Test quality assessment indirectly through analysis
    const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    const result = await analyzer.analyzeImage(analysisInput);
    
    assertExists(result.qualityMetrics, 'Quality metrics in result');
    assertExists(result.qualityMetrics.overallQuality, 'Overall quality score');
    assertType(result.qualityMetrics.overallQuality, 'number', 'Overall quality score');
    assert(result.qualityMetrics.overallQuality >= 0 && result.qualityMetrics.overallQuality <= 100, 
           'Quality score in valid range (0-100)');
    
    assertExists(result.qualityMetrics.improvements, 'Quality improvements array');
    assert(Array.isArray(result.qualityMetrics.improvements), 'Improvements is array');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Image quality assessment error: ${error.message}`);
    console.error('Image quality assessment error:', error);
  }
}

// Test Group 4: Individual Analysis Types
async function testIndividualAnalysisTypes() {
  const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
  const mockImageData = createMockImageData();
  
  const analysisTypes = [
    'facial_analysis',
    'tongue_diagnosis', 
    'skin_analysis',
    'nail_analysis',
    'posture_analysis'
  ];
  
  for (const analysisType of analysisTypes) {
    try {
      console.log(`  Testing ${analysisType}...`);
      
      const analysisInput = {
        imageData: mockImageData,
        analysisType: analysisType,
        culturalContext: 'mexican'
      };
      
      const result = await analyzer.analyzeImage(analysisInput);
      
      // Test common result properties
      assertEqual(result.analysisType, analysisType, `Analysis type matches for ${analysisType}`);
      assertExists(result.timestamp, `Timestamp for ${analysisType}`);
      assertExists(result.overallHealthScore, `Overall health score for ${analysisType}`);
      assertExists(result.confidence, `Confidence score for ${analysisType}`);
      
      // Test health score structure
      assertType(result.overallHealthScore.score, 'number', `Health score number for ${analysisType}`);
      assertExists(result.overallHealthScore.status, `Health status for ${analysisType}`);
      assertExists(result.overallHealthScore.recommendations, `Health recommendations for ${analysisType}`);
      
      // Test findings arrays
      assert(Array.isArray(result.primaryFindings), `Primary findings array for ${analysisType}`);
      assert(Array.isArray(result.secondaryFindings), `Secondary findings array for ${analysisType}`);
      assert(Array.isArray(result.treatmentRecommendations), `Treatment recommendations array for ${analysisType}`);
      
      // Test constitutional assessment
      assertExists(result.constitutionalAssessment, `Constitutional assessment for ${analysisType}`);
      assertExists(result.constitutionalAssessment.ayurvedicType, `Ayurvedic type for ${analysisType}`);
      
      // Test Mexican cultural context
      assert(Array.isArray(result.mexicanCulturalContext), `Mexican cultural context array for ${analysisType}`);
      assert(Array.isArray(result.herbRecommendations), `Herb recommendations array for ${analysisType}`);
      
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`${analysisType} test error: ${error.message}`);
      console.error(`${analysisType} test error:`, error);
    }
  }
}

// Test Group 5: Real-Time Processing
async function testRealTimeProcessing() {
  try {
    const processor = RealTimeImageProcessor.getInstance();
    
    // Test buffer status
    const bufferStatus = processor.getBufferStatus();
    assertExists(bufferStatus, 'Buffer status');
    assertType(bufferStatus.size, 'number', 'Buffer size');
    assertType(bufferStatus.capacity, 'number', 'Buffer capacity');
    assertType(bufferStatus.averageQuality, 'number', 'Average quality');
    assertType(bufferStatus.bestQuality, 'number', 'Best quality');
    
    // Test buffer clearing
    processor.clearBuffer();
    const clearedStatus = processor.getBufferStatus();
    assertEqual(clearedStatus.size, 0, 'Buffer cleared');
    
    // Test direct image analysis through processor
    const mockImageData = createMockImageData();
    const analysisInput = {
      imageData: mockImageData,
      analysisType: 'facial_analysis',
      culturalContext: 'mexican'
    };
    
    const result = await processor.analyzeImage(analysisInput);
    assertExists(result, 'Direct analysis result');
    assertEqual(result.analysisType, 'facial_analysis', 'Direct analysis type correct');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Real-time processing error: ${error.message}`);
    console.error('Real-time processing error:', error);
  }
}

// Test Group 6: Treatment Engine Integration
async function testTreatmentEngineIntegration() {
  try {
    const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    const treatmentEngine = IntelligentTreatmentEngine.getInstance();
    
    // First get an analysis result
    const mockImageData = createMockImageData();
    const analysisInput = {
      imageData: mockImageData,
      analysisType: 'facial_analysis',
      culturalContext: 'mexican'
    };
    
    const analysisResult = await analyzer.analyzeImage(analysisInput);
    
    // Test treatment plan generation
    const treatmentPlan = await treatmentEngine.generateTreatmentPlan(analysisResult, {
      age: 35,
      gender: 'unspecified',
      preferences: ['natural_medicine', 'mexican_herbs']
    });
    
    assertExists(treatmentPlan, 'Treatment plan generated');
    assertExists(treatmentPlan.protocol, 'Treatment protocol');
    assertExists(treatmentPlan.protocol.name, 'Protocol name');
    assertExists(treatmentPlan.protocol.phases, 'Protocol phases');
    assert(Array.isArray(treatmentPlan.protocol.phases), 'Phases is array');
    
    assertExists(treatmentPlan.safetyAssessment, 'Safety assessment');
    assertExists(treatmentPlan.safetyAssessment.riskLevel, 'Risk level');
    
    assertExists(treatmentPlan.estimatedCost, 'Cost estimation');
    assertType(treatmentPlan.estimatedCost.total, 'number', 'Total cost');
    
    assertExists(treatmentPlan.followUpPlan, 'Follow-up plan');
    assertExists(treatmentPlan.emergencyGuidance, 'Emergency guidance');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Treatment engine integration error: ${error.message}`);
    console.error('Treatment engine integration error:', error);
  }
}

// Test Group 7: Error Handling
async function testErrorHandling() {
  try {
    const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    
    // Test with invalid image data
    try {
      const invalidInput = {
        imageData: 'invalid-data',
        analysisType: 'facial_analysis',
        culturalContext: 'mexican'
      };
      
      const result = await analyzer.analyzeImage(invalidInput);
      
      // Should return fallback result, not throw
      assertExists(result, 'Fallback result for invalid input');
      assertEqual(result.confidence, 0, 'Zero confidence for failed analysis');
      assert(result.primaryFindings.length > 0, 'Error finding in primary findings');
      
    } catch (error) {
      // This is expected for some error cases
      assert(error.message.includes('Analysis failed') || error.message.includes('quality'), 
             'Appropriate error message for invalid input');
    }
    
    // Test with invalid analysis type
    try {
      const invalidTypeInput = {
        imageData: createMockImageData(),
        analysisType: 'invalid_analysis_type',
        culturalContext: 'mexican'
      };
      
      const result = await analyzer.analyzeImage(invalidTypeInput);
      
      // Should handle gracefully
      assertExists(result, 'Result for invalid analysis type');
      
    } catch (error) {
      assert(error.message.includes('Analysis failed'), 'Appropriate error for invalid analysis type');
    }
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Error handling test error: ${error.message}`);
    console.error('Error handling test error:', error);
  }
}

// Test Group 8: Cultural Context Integration
async function testCulturalContextIntegration() {
  try {
    const analyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    const mockImageData = createMockImageData();
    
    // Test Mexican cultural context
    const mexicanInput = {
      imageData: mockImageData,
      analysisType: 'facial_analysis',
      culturalContext: 'mexican'
    };
    
    const mexicanResult = await analyzer.analyzeImage(mexicanInput);
    
    assertExists(mexicanResult.mexicanCulturalContext, 'Mexican cultural context');
    assert(Array.isArray(mexicanResult.mexicanCulturalContext), 'Cultural context is array');
    assert(mexicanResult.mexicanCulturalContext.length > 0, 'Has cultural context items');
    
    assertExists(mexicanResult.herbRecommendations, 'Herb recommendations');
    assert(Array.isArray(mexicanResult.herbRecommendations), 'Herb recommendations is array');
    
    // Test treatment recommendations have Mexican context
    if (mexicanResult.treatmentRecommendations.length > 0) {
      const herbTreatment = mexicanResult.treatmentRecommendations.find(t => t.category === 'herbal');
      if (herbTreatment) {
        assertExists(herbTreatment.mexicanHerbs, 'Mexican herbs in treatment');
        assertExists(herbTreatment.culturalAdaptations, 'Cultural adaptations in treatment');
      }
    }
    
    // Test other cultural contexts
    const culturalContexts = ['tcm', 'ayurveda', 'global'];
    
    for (const context of culturalContexts) {
      try {
        const contextInput = {
          imageData: mockImageData,
          analysisType: 'facial_analysis',
          culturalContext: context
        };
        
        const result = await analyzer.analyzeImage(contextInput);
        assertExists(result, `Result for ${context} cultural context`);
        
      } catch (error) {
        console.warn(`Warning: ${context} cultural context test failed:`, error.message);
      }
    }
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Cultural context integration error: ${error.message}`);
    console.error('Cultural context integration error:', error);
  }
}

// Print test results
function printTestResults() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 COMPREHENSIVE IMAGE ANALYSIS TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📊 Total Tests: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Image analysis system is working correctly.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Issues found:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n📋 Detailed Test Log:');
  testResults.details.forEach(detail => console.log(`   ${detail}`));
  
  console.log('='.repeat(60));
  
  return {
    passed: testResults.passed,
    failed: testResults.failed,
    success: testResults.failed === 0
  };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runComprehensiveImageAnalysisTests,
    createMockImageData,
    createMockFile
  };
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - add to window for manual testing
  window.runComprehensiveImageAnalysisTests = runComprehensiveImageAnalysisTests;
  console.log('🧪 Image Analysis Tests loaded. Run window.runComprehensiveImageAnalysisTests() to start.');
} else if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('test-comprehensive-image-analysis')) {
  // Node.js environment - run immediately
  runComprehensiveImageAnalysisTests();
}