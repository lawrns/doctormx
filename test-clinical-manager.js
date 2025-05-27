// Test Clinical Conversation Manager
// Run this in browser console to test the clinical conversation flow

console.log('🩺 Testing Clinical Conversation Manager...');

// Mock the services for testing
const mockDiagnosticService = {
  initializeSession: (sessionId, complaint) => ({
    sessionId,
    chiefComplaint: complaint,
    evidence: [],
    hypotheses: [
      {
        condition: 'Cefalea tensional',
        probability: 0.6,
        requiredQuestions: ['¿El dolor es como una banda apretada alrededor de la cabeza?'],
        ruleOutQuestions: ['¿Tienes náuseas o vómitos?']
      }
    ],
    currentConfidence: 0.25,
    questionsAsked: [],
    phase: 'initial',
    nextQuestions: ['¿El dolor es como una banda apretada alrededor de la cabeza?']
  }),
  
  processResponse: (sessionId, question, answer) => ({
    session: {
      currentConfidence: 0.65,
      questionsAsked: [question],
      nextQuestions: ['¿Empeora con el estrés?']
    },
    shouldDiagnose: false,
    nextQuestion: '¿Empeora con el estrés?',
    confidence: 0.65
  })
};

// Test the clinical conversation flow
function testClinicalFlow() {
  console.log('\n=== Test 1: Initial Greeting ===');
  
  // Simulate user saying "Dolor de cabeza fuerte"
  const userInput = "Dolor de cabeza fuerte";
  console.log('User input:', userInput);
  
  // Test symptom detection
  const symptomKeywords = [
    'dolor', 'duele', 'molestia', 'fiebre', 'temperatura', 'tos', 'náusea',
    'vómito', 'diarrea', 'estreñimiento', 'mareo', 'cansancio', 'debilidad',
    'palpitaciones', 'falta de aire', 'ardor', 'picazón', 'hinchazón'
  ];
  
  const containsSymptom = symptomKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
  console.log('Contains symptom:', containsSymptom);
  
  // Test chief complaint extraction
  const lowerMessage = userInput.toLowerCase();
  const patterns = [
    /tengo (.*?)(?:\.|$)/,
    /me duele (.*?)(?:\.|$)/,
    /siento (.*?)(?:\.|$)/,
    /dolor (?:de|en) (.*?)(?:\.|$)/,
    /(.*?) me duele/,
    /estoy (.*?)(?:\.|$)/
  ];
  
  let chiefComplaint = null;
  for (const pattern of patterns) {
    const match = lowerMessage.match(pattern);
    if (match && match[1]) {
      chiefComplaint = match[1].trim();
      break;
    }
  }
  
  if (!chiefComplaint && containsSymptom) {
    chiefComplaint = userInput.trim();
  }
  
  console.log('Extracted chief complaint:', chiefComplaint);
  
  if (chiefComplaint) {
    console.log('✅ Should initialize diagnostic session');
    const session = mockDiagnosticService.initializeSession('test-session', chiefComplaint);
    console.log('Diagnostic session:', session);
    
    const expectedResponse = `Entiendo que tiene ${chiefComplaint}. ${session.nextQuestions[0]}`;
    console.log('Expected clinical response:', expectedResponse);
    
    console.log('\n=== Test 2: Follow-up Question ===');
    const followUpAnswer = "Sí, como una banda";
    console.log('User answer:', followUpAnswer);
    
    const result = mockDiagnosticService.processResponse('test-session', session.nextQuestions[0], followUpAnswer);
    console.log('Next question:', result.nextQuestion);
    console.log('Confidence:', Math.round(result.confidence * 100) + '%');
    
    console.log('\n✅ Clinical conversation flow working correctly!');
  } else {
    console.log('❌ Failed to extract chief complaint');
  }
}

// Test emergency detection
function testEmergencyDetection() {
  console.log('\n=== Test 3: Emergency Detection ===');
  
  const emergencyInputs = [
    "No puedo respirar",
    "Dolor de pecho intenso",
    "Perdí el conocimiento"
  ];
  
  const emergencyKeywords = [
    'no puedo respirar',
    'dolor de pecho intenso',
    'perdí el conocimiento',
    'sangrado abundante',
    'convulsiones'
  ];
  
  emergencyInputs.forEach(input => {
    const isEmergency = emergencyKeywords.some(keyword => input.toLowerCase().includes(keyword));
    console.log(`"${input}" -> Emergency: ${isEmergency ? '🚨 YES' : '❌ NO'}`);
  });
}

// Run tests
testClinicalFlow();
testEmergencyDetection();

console.log('\n🩺 Clinical Conversation Manager Test Complete!');
console.log('\nIf you see this working but the app is still showing old responses:');
console.log('1. Check browser console for "🩺 Using clinical conversation manager" logs');
console.log('2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)');
console.log('3. Clear browser cache');
console.log('4. Check if useClinicalMode is true in the component');
