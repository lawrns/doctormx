// Quick test to identify which patterns are failing
const { detectRedFlagsEnhanced } = require('./dist/lib/ai/red-flags-enhanced');

const cardiacPatterns = [
  'I have crushing chest pain',
  'Chest pain radiating to left arm',
  'Feeling like im going to die',
  'Squeezing sensation in chest',
  'Heavy pressure on my chest',
  'Chest tightness',
  'Heart attack',
  'Myocardial infarction',
  'Chest pain that goes to jaw',
  'Pressure in center of chest',
  'Chest discomfort',
  'Pain spreading to back',
  'Angina pain',
  'Chest pain with shortness of breath',
  'Cardiac arrest',
  'Severe chest pressure',
  'Chest pain like elephant sitting',
  'Radiating chest pain',
  'Left arm pain and chest pain',
  'Tightness in chest',
];

console.log('=== CARDIAC PATTERNS ===');
cardiacPatterns.forEach(pattern => {
  const result = detectRedFlagsEnhanced(pattern);
  if (!result.detected) {
    console.log(`FAIL: "${pattern}"`);
  }
});

const strokePatterns = [
  'Face drooping',
  'Facial paralysis',
  'Face drooping on one side',
  'One side of face is numb',
  'Cant move one side of face',
  'Facial droop',
  'Paralyzed face',
  'Crooked face',
  'Arm weakness',
  'Cant raise my arm',
  'Left arm is weak',
  'Right arm feels heavy',
  'Cant lift arm',
  'Arm numbness',
  'One arm drags',
  'Weakness in extremity',
  'Slurred speech',
  'Cant speak properly',
  'Trouble speaking',
  'Speech difficulty',
  'Cant find words',
  'Words are jumbled',
  'Speech is garbled',
  'Hard to talk',
  'Stroke',
  'CVA',
  'Cerebrovascular accident',
  'Brain attack',
  'Ischemic stroke',
  'Hemorrhagic stroke',
  'Mini stroke',
  'TIA',
];

console.log('\n=== STROKE PATTERNS ===');
strokePatterns.forEach(pattern => {
  const result = detectRedFlagsEnhanced(pattern);
  if (!result.detected) {
    console.log(`FAIL: "${pattern}"`);
  }
});

const respiratoryPatterns = [
  'Cant breathe',
  'Cant breath',
  'Difficulty breathing',
  'Trouble breathing',
  'Shortness of breath',
  'SOB',
  'Dyspnea',
  'Choking',
  'Gasping for air',
  'Cant catch my breath',
  'Wheezing severely',
  'Blue lips',
  'Cyanosis',
  'Face turning blue',
  'Lips are blue',
  'Air hunger',
  'Cant get air',
  'Suffocating',
  'Chest tightness cant breathe',
  'Respiratory distress',
  'Struggling to breathe',
  'Severe asthma attack',
  'Bronchospasm',
];

console.log('\n=== RESPIRATORY PATTERNS ===');
respiratoryPatterns.forEach(pattern => {
  const result = detectRedFlagsEnhanced(pattern);
  if (!result.detected) {
    console.log(`FAIL: "${pattern}"`);
  }
});

const suicidePatterns = [
  'I want to die',
  'Want to die',
  'I want to kill myself',
  'Kill myself',
  'Suicidal thoughts',
  'Want to end my life',
  'End my life',
  'Planning suicide',
  'Suicide plan',
  'I dont want to live',
  'Better off dead',
  'No point living',
  'Want to disappear',
  'Self harm',
  'Want to hurt myself',
  'Cut myself',
  'End it all',
  'Not worth living',
  'Want to commit suicide',
  'Going to kill myself',
];

console.log('\n=== SUICIDE PATTERNS ===');
suicidePatterns.forEach(pattern => {
  const result = detectRedFlagsEnhanced(pattern);
  if (!result.detected) {
    console.log(`FAIL: "${pattern}"`);
  }
});
