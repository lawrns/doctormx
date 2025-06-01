/**
 * Test Enhanced Protocol Matching with Vision API findings
 */

import { IntelligentProtocolMatcher } from './packages/services/IntelligentProtocolMatcher.js';
import { ComprehensiveProtocolDatabase } from './packages/services/ComprehensiveProtocolDatabase.js';
import { loggingService } from './packages/services/LoggingService.js';

async function testEnhancedMatching() {
  console.log('=== Testing Enhanced Protocol Matching ===\n');

  const protocolMatcher = IntelligentProtocolMatcher.getInstance();
  const database = ComprehensiveProtocolDatabase.getInstance();

  // Log available protocols
  const allProtocols = database.getAllProtocols();
  console.log(`Total protocols in database: ${allProtocols.size}`);
  
  // Log specific dermatological protocols
  const dermatologicalProtocols = database.getProtocolsByCategory('dermatological');
  console.log(`\nDermatological protocols: ${dermatologicalProtocols.length}`);
  dermatologicalProtocols.forEach(p => {
    console.log(`- ${p.name} (${p.id}): ${p.condition.join(', ')}`);
  });

  // Test Case 1: Vision API detects Rosácea
  console.log('\n=== Test Case 1: Vision API Rosácea Detection ===');
  
  const rosaceaCriteria = {
    primaryFindings: [
      {
        category: 'dermatological',
        finding: 'Signos evidentes de rosácea con enrojecimiento persistente en mejillas',
        severity: 'moderate',
        confidence: 0.85, // Vision API confidence
        organSystems: ['integumentario', 'circulatorio'],
        recommendations: ['Consultar dermatólogo', 'Evitar triggers']
      },
      {
        category: 'dermatological',
        finding: 'Telangiectasias visibles en mejillas y nariz',
        severity: 'moderate',
        confidence: 0.85, // Vision API confidence
        organSystems: ['circulatorio'],
        recommendations: ['Tratamiento vascular']
      }
    ],
    secondaryFindings: [],
    constitutionalAssessment: {
      ayurvedicType: 'pitta',
      tcmConstitution: 'hot',
      metabolicType: 'fast',
      indicators: ['skin redness', 'heat sensitivity']
    },
    urgencyLevel: 'monitor'
  };

  try {
    const rosaceaResult = await protocolMatcher.findOptimalProtocols(rosaceaCriteria);
    
    console.log('\nPrimary Protocol Selected:');
    console.log(`Name: ${rosaceaResult.primaryProtocol.protocol.name}`);
    console.log(`ID: ${rosaceaResult.primaryProtocol.protocol.id}`);
    console.log(`Score: ${rosaceaResult.primaryProtocol.matchScore}`);
    console.log(`Category: ${rosaceaResult.primaryProtocol.protocol.category}`);
    console.log('\nMatching Reasons:');
    rosaceaResult.primaryProtocol.matchingReasons.forEach(reason => {
      console.log(`- ${reason}`);
    });
    
    console.log(`\nOverall Confidence: ${(rosaceaResult.overallConfidence * 100).toFixed(0)}%`);
  } catch (error) {
    console.error('Rosácea test failed:', error);
  }

  // Test Case 2: Generic skin condition (should get lower scores)
  console.log('\n\n=== Test Case 2: Generic Skin Condition ===');
  
  const genericCriteria = {
    primaryFindings: [
      {
        category: 'dermatological',
        finding: 'Piel con signos de deshidratación',
        severity: 'low',
        confidence: 0.6, // Local analysis confidence
        organSystems: ['integumentario'],
        recommendations: ['Hidratación regular']
      }
    ],
    secondaryFindings: [],
    constitutionalAssessment: {
      ayurvedicType: 'vata',
      tcmConstitution: 'dry',
      metabolicType: 'normal',
      indicators: ['dry skin']
    },
    urgencyLevel: 'routine'
  };

  try {
    const genericResult = await protocolMatcher.findOptimalProtocols(genericCriteria);
    
    console.log('\nPrimary Protocol Selected:');
    console.log(`Name: ${genericResult.primaryProtocol.protocol.name}`);
    console.log(`ID: ${genericResult.primaryProtocol.protocol.id}`);
    console.log(`Score: ${genericResult.primaryProtocol.matchScore}`);
    console.log(`\nNote: Generic condition should get lower scores than specific Vision API findings`);
  } catch (error) {
    console.error('Generic test failed:', error);
  }

  // Test Case 3: Multiple Vision API findings
  console.log('\n\n=== Test Case 3: Multiple Vision API Findings ===');
  
  const multipleCriteria = {
    primaryFindings: [
      {
        category: 'dermatological',
        finding: 'Acné moderado con comedones y pústulas en zona T',
        severity: 'moderate',
        confidence: 0.85, // Vision API
        organSystems: ['integumentario', 'endocrino'],
        recommendations: ['Tratamiento antibacteriano', 'Regular hormonas']
      },
      {
        category: 'dermatological',
        finding: 'Hiperpigmentación post-inflamatoria',
        severity: 'low',
        confidence: 0.85, // Vision API
        organSystems: ['integumentario'],
        recommendations: ['Despigmentantes suaves']
      },
      {
        category: 'constitutional',
        finding: 'Piel grasa con poros dilatados',
        severity: 'low',
        confidence: 0.75,
        organSystems: ['integumentario'],
        recommendations: ['Control de sebo']
      }
    ],
    secondaryFindings: [],
    constitutionalAssessment: {
      ayurvedicType: 'kapha',
      tcmConstitution: 'damp',
      metabolicType: 'slow',
      indicators: ['oily skin', 'congestion']
    },
    urgencyLevel: 'monitor'
  };

  try {
    const multipleResult = await protocolMatcher.findOptimalProtocols(multipleCriteria);
    
    console.log('\nPrimary Protocol Selected:');
    console.log(`Name: ${multipleResult.primaryProtocol.protocol.name}`);
    console.log(`Score: ${multipleResult.primaryProtocol.matchScore}`);
    
    if (multipleResult.supportiveProtocols.length > 0) {
      console.log('\nSupportive Protocols:');
      multipleResult.supportiveProtocols.forEach((p, i) => {
        console.log(`${i + 1}. ${p.protocol.name} (Score: ${p.matchScore})`);
      });
    }
  } catch (error) {
    console.error('Multiple findings test failed:', error);
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
testEnhancedMatching().catch(console.error);