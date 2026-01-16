/**
 * Triage System Tests
 * TDD approach - tests written before implementation verification
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateRedFlags,
  getCareLevelInfo,
  isMentalHealthCrisis,
  getMentalHealthResources
} from '../index';

describe('Triage System', () => {
  describe('evaluateRedFlags', () => {
    // Emergency (ER) Tests
    describe('ER Level Detection', () => {
      it('should detect chest pain as ER emergency', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo dolor de pecho muy fuerte' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
        expect(result.severity).toBe(100);
      });

      it('should detect breathing difficulty as ER', () => {
        const result = evaluateRedFlags({ 
          message: 'No puedo respirar, me estoy ahogando' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });

      it('should detect stroke signs as ER', () => {
        const result = evaluateRedFlags({ 
          message: 'Mi mamá tiene la cara caída y no puede hablar' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });

      it('should detect suicidal ideation as ER with resources', () => {
        const result = evaluateRedFlags({ 
          message: 'Ya no quiero vivir, quiero morir' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
        expect(result.ruleIds).toContain('suicidal_ideation');
        expect(result.recommendations.some(r => r.includes('800 911 2000'))).toBe(true);
      });

      it('should detect low oxygen saturation as ER', () => {
        const result = evaluateRedFlags({ 
          message: 'Me siento mal',
          intake: { vitals: { spo2: 85 } }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });

      it('should detect pregnancy emergency', () => {
        const result = evaluateRedFlags({ 
          message: 'Estoy embarazada y tengo sangrado vaginal abundante',
          intake: { isPregnant: true }
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER');
      });
    });

    // Urgent Tests
    describe('URGENT Level Detection', () => {
      it('should detect high fever as urgent', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo fiebre de 40 grados desde hace 2 días' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('URGENT');
      });

      it('should detect severe pain as urgent', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo un dolor insoportable en el abdomen' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('URGENT');
      });

      it('should detect infection signs as urgent', () => {
        const result = evaluateRedFlags({ 
          message: 'Mi herida tiene pus y está muy roja y caliente' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('URGENT');
      });
    });

    // Primary Care Tests
    describe('PRIMARY Level Detection', () => {
      it('should detect chronic symptoms as primary care', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo dolor de espalda desde hace semanas' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('PRIMARY');
      });

      it('should detect skin issues as primary care', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo acné y manchas en la piel' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('PRIMARY');
      });
    });

    // Self Care Tests
    describe('SELFCARE Level Detection', () => {
      it('should detect common cold as self care', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo nariz tapada y estornudos, creo que es gripa leve' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('SELFCARE');
      });

      it('should detect minor injuries as self care', () => {
        const result = evaluateRedFlags({ 
          message: 'Me hice un raspón pequeño en la rodilla' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('SELFCARE');
      });
    });

    // No Match Tests
    describe('No Match Scenarios', () => {
      it('should return no triggers for general questions', () => {
        const result = evaluateRedFlags({ 
          message: '¿Cuáles son tus horarios de atención?' 
        });
        expect(result.triggered).toBe(false);
        expect(result.action).toBeUndefined();
        expect(result.severity).toBe(0);
      });
    });

    // Priority Tests
    describe('Priority Handling', () => {
      it('should return highest priority when multiple rules match', () => {
        const result = evaluateRedFlags({ 
          message: 'Tengo dolor de pecho y también fiebre alta' 
        });
        expect(result.triggered).toBe(true);
        expect(result.action).toBe('ER'); // ER > URGENT
        expect(result.ruleIds.length).toBeGreaterThan(1);
      });
    });
  });

  describe('getCareLevelInfo', () => {
    it('should return correct info for ER', () => {
      const info = getCareLevelInfo('ER');
      expect(info.label).toBe('Emergencia');
      expect(info.color).toBe('#DC2626');
      expect(info.icon).toBe('🚨');
    });

    it('should return correct info for URGENT', () => {
      const info = getCareLevelInfo('URGENT');
      expect(info.label).toBe('Urgente');
      expect(info.color).toBe('#F59E0B');
    });

    it('should return correct info for PRIMARY', () => {
      const info = getCareLevelInfo('PRIMARY');
      expect(info.label).toBe('Consulta Regular');
      expect(info.color).toBe('#3B82F6');
    });

    it('should return correct info for SELFCARE', () => {
      const info = getCareLevelInfo('SELFCARE');
      expect(info.label).toBe('Autocuidado');
      expect(info.color).toBe('#10B981');
    });
  });

  describe('isMentalHealthCrisis', () => {
    it('should detect suicidal thoughts', () => {
      expect(isMentalHealthCrisis('Quiero morir')).toBe(true);
      expect(isMentalHealthCrisis('Pienso en suicidarme')).toBe(true);
      expect(isMentalHealthCrisis('Quiero matarme')).toBe(true);
    });

    it('should detect self-harm mentions', () => {
      expect(isMentalHealthCrisis('Quiero cortarme')).toBe(true);
      expect(isMentalHealthCrisis('Pienso en autolesión')).toBe(true);
    });

    it('should not trigger for regular messages', () => {
      expect(isMentalHealthCrisis('Tengo dolor de cabeza')).toBe(false);
      expect(isMentalHealthCrisis('Me siento triste hoy')).toBe(false);
    });
  });

  describe('getMentalHealthResources', () => {
    it('should return array of resources', () => {
      const resources = getMentalHealthResources();
      expect(resources.length).toBeGreaterThan(0);
      expect(resources.some(r => r.includes('800 911 2000'))).toBe(true);
      expect(resources.some(r => r.includes('SAPTEL'))).toBe(true);
    });
  });
});
