/**
 * Test to debug image analysis flow and protocol selection
 */

import { RealComprehensiveMedicalImageAnalyzer } from './packages/services/RealComprehensiveMedicalImageAnalyzer.js';
import { IntelligentProtocolMatcher } from './packages/services/IntelligentProtocolMatcher.js';
import { openAIVisionService } from './packages/services/OpenAIVisionService.js';

async function testImageAnalysisFlow() {
  console.log('=== Testing Image Analysis Flow ===\n');

  // Simulate Vision API response with specific dermatological findings
  const mockVisionResponse = {
    analysis: `Análisis de la imagen médica:
      
      Se observa una piel facial con signos evidentes de rosácea:
      - Enrojecimiento persistente en mejillas y nariz
      - Capilares visibles (telangiectasias) en las mejillas
      - Textura irregular con áreas de inflamación
      - Piel sensible con tendencia a la irritación
      - Manchas rojizas difusas en zona central del rostro
      
      La condición parece estar en fase moderada, con inflamación activa
      que requiere tratamiento específico para rosácea.`,
    findings: 'Rosácea moderada con inflamación activa, telangiectasias visibles',
    confidence: 0.85,
    severity: 65,
    suggestedSpecialty: 'Dermatología',
    success: true
  };

  // Extract health indicators from Vision response
  const healthIndicators = openAIVisionService.extractHealthIndicators(mockVisionResponse.analysis);
  
  console.log('Vision API Analysis:', mockVisionResponse.analysis);
  console.log('\nExtracted Health Indicators:');
  healthIndicators.forEach((indicator, index) => {
    console.log(`\n${index + 1}. ${indicator.finding}`);
    console.log(`   Category: ${indicator.category}`);
    console.log(`   Severity: ${indicator.severity}`);
    console.log(`   Confidence: ${indicator.confidence}`);
    console.log(`   Organ Systems: ${indicator.organSystems.join(', ')}`);
    console.log(`   Recommendations: ${indicator.recommendations.join('; ')}`);
  });

  // Create protocol matching criteria
  const matchingCriteria = {
    primaryFindings: healthIndicators,
    secondaryFindings: [],
    constitutionalAssessment: {
      ayurvedicType: 'pitta',
      tcmConstitution: 'hot',
      metabolicType: 'fast',
      indicators: ['skin redness', 'inflammation']
    },
    urgencyLevel: 'monitor'
  };

  // Test protocol matching
  console.log('\n=== Testing Protocol Matching ===\n');
  
  const protocolMatcher = IntelligentProtocolMatcher.getInstance();
  
  try {
    const recommendation = await protocolMatcher.findOptimalProtocols(matchingCriteria);
    
    console.log('Primary Protocol Selected:', recommendation.primaryProtocol.protocol.name);
    console.log('Match Score:', recommendation.primaryProtocol.matchScore);
    console.log('Matching Reasons:', recommendation.primaryProtocol.matchingReasons);
    console.log('\nSupportive Protocols:');
    recommendation.supportiveProtocols.forEach((protocol, index) => {
      console.log(`${index + 1}. ${protocol.protocol.name} (Score: ${protocol.matchScore})`);
    });
    
    console.log('\nOverall Confidence:', recommendation.overallConfidence);
  } catch (error) {
    console.error('Protocol matching error:', error);
  }
}

// Run the test
testImageAnalysisFlow().catch(console.error);