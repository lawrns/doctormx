/**
 * Tests for enhanced red flag detection with English emergency keywords
 */

import { detectRedFlagsEnhanced, RedFlagResult } from './red-flags-enhanced';

describe('Enhanced Red Flag Detection - English Keywords', () => {
  test('should detect chest pain as emergency', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('I have chest pain and it radiates to my arm');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    const chestPainFlag = result.flags.find(f => f.message.includes('Dolor torácico'));
    expect(chestPainFlag).toBeDefined();
  });

  test('should detect difficulty breathing as emergency', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('I cant breathe and my lips are turning blue');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    const breathingFlag = result.flags.find(f => f.message.includes('Insuficiencia respiratoria'));
    expect(breathingFlag).toBeDefined();
  });

  test('should detect severe bleeding as emergency', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('Im bleeding heavily and it wont stop');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    const bleedingFlag = result.flags.find(f => f.message.includes('Hemorragia'));
    expect(bleedingFlag).toBeDefined();
  });

  test('should detect loss of consciousness as emergency', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('I passed out and woke up confused');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    const consciousnessFlag = result.flags.find(f => f.message.includes('Pérdida de conciencia'));
    expect(consciousnessFlag).toBeDefined();
  });

  test('should detect slurred speech as stroke symptom', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('My speech is slurred and I cant speak properly');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    const speechFlag = result.flags.find(f => f.message.includes('Trastorno del habla'));
    expect(speechFlag).toBeDefined();
  });

  test('should detect severe headache as emergency', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('I have the worst headache of my life');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    const headacheFlag = result.flags.find(f => f.message.includes('Cefalea'));
    expect(headacheFlag).toBeDefined();
  });

  test('should still detect Spanish keywords', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('Tengo dolor en el pecho y no puedo respirar bien');

    expect(result.detected).toBe(true);
    expect(result.requiresEmergencyEscalation).toBe(true);
    expect(result.highestSeverity).toBe('critical');

    expect(result.flags.length).toBeGreaterThan(0);
  });

  test('should not detect non-emergency symptoms', () => {
    const result: RedFlagResult = detectRedFlagsEnhanced('I have a headache and feel tired');

    // Should NOT detect regular headache as red flag
    expect(result.detected).toBe(false);
    expect(result.requiresEmergencyEscalation).toBe(false);
    expect(result.highestSeverity).toBe(null);
  });
});