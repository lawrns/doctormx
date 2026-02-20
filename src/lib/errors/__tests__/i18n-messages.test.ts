/**
 * Tests for i18n Error Messages
 * 
 * These tests verify that error messages are correctly:
 * - Defined in translation files
 * - Accessible via translation keys
 * - Properly categorized by error type
 */

import { describe, it, expect } from 'vitest';
import {
  ERROR_CODES,
  getErrorTranslationKey,
  isValidErrorCode,
  getEmergencyErrorCodes,
  isEmergencyError,
} from '../messages';

// Import translation files
import esMessages from '../../../../messages/es.json';
import enMessages from '../../../../messages/en.json';

describe('I18N Error Messages', () => {
  describe('ERROR_CODES', () => {
    it('should have all error codes defined', () => {
      // Medical errors
      expect(ERROR_CODES.MEDICAL_RECORD_ERROR).toBe('MED_001');
      expect(ERROR_CODES.MEDICAL_DATA_INVALID).toBe('MED_002');
      expect(ERROR_CODES.SYMPTOM_ANALYSIS_FAILED).toBe('MED_003');
      expect(ERROR_CODES.RED_FLAG_DETECTED).toBe('MED_004');

      // Emergency errors
      expect(ERROR_CODES.EMERGENCY_DETECTED).toBe('EMG_001');
      expect(ERROR_CODES.CRITICAL_SYMPTOMS).toBe('EMG_002');

      // Auth errors
      expect(ERROR_CODES.AUTH_INVALID_CREDENTIALS).toBe('AUTH_001');
      expect(ERROR_CODES.AUTH_SESSION_EXPIRED).toBe('AUTH_002');

      // Validation errors
      expect(ERROR_CODES.VALIDATION_FAILED).toBe('VAL_001');
      expect(ERROR_CODES.MISSING_REQUIRED_FIELD).toBe('VAL_003');

      // Rate limiting
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_001');

      // Payment errors
      expect(ERROR_CODES.PAYMENT_FAILED).toBe('PAY_001');
    });
  });

  describe('Translation Keys Mapping', () => {
    it('should map all error codes to translation keys', () => {
      const allCodes = Object.values(ERROR_CODES);
      
      for (const code of allCodes) {
        const key = getErrorTranslationKey(code);
        expect(key).toBeDefined();
        expect(key).toMatch(/^errors\./);
      }
    });

    it('should return undefined for unknown codes', () => {
      expect(getErrorTranslationKey('UNKNOWN_CODE')).toBeUndefined();
    });
  });

  describe('Spanish Translations (es.json)', () => {
    const errors = esMessages.errors as Record<string, Record<string, string>>;

    it('should have errors namespace', () => {
      expect(errors).toBeDefined();
    });

    it('should have all medical error translations', () => {
      expect(errors.medical.recordError).toBeDefined();
      expect(errors.medical.dataInvalid).toBeDefined();
      expect(errors.medical.symptomAnalysisFailed).toBeDefined();
      expect(errors.medical.redFlagDetected).toBeDefined();
    });

    it('should have all emergency error translations', () => {
      expect(errors.emergency.detected).toBeDefined();
      expect(errors.emergency.criticalSymptoms).toBeDefined();
      expect(errors.emergency.urgentCareNeeded).toBeDefined();
      expect(errors.emergency.redirect).toBeDefined();
      expect(errors.emergency.contact911).toBeDefined();
    });

    it('should have all authentication error translations', () => {
      expect(errors.auth.invalidCredentials).toBeDefined();
      expect(errors.auth.sessionExpired).toBeDefined();
      expect(errors.auth.tokenInvalid).toBeDefined();
      expect(errors.auth.unauthorized).toBeDefined();
    });

    it('should have all validation error translations', () => {
      expect(errors.validation.failed).toBeDefined();
      expect(errors.validation.invalidInput).toBeDefined();
      expect(errors.validation.missingRequiredField).toBeDefined();
      expect(errors.validation.invalidFormat).toBeDefined();
    });

    it('should have all rate limiting error translations', () => {
      expect(errors.rateLimit.exceeded).toBeDefined();
      expect(errors.rateLimit.tooManyRequests).toBeDefined();
      expect(errors.rateLimit.quotaExceeded).toBeDefined();
    });

    it('should have all payment error translations', () => {
      expect(errors.payment.failed).toBeDefined();
      expect(errors.payment.declined).toBeDefined();
      expect(errors.payment.cancelled).toBeDefined();
      expect(errors.payment.refundFailed).toBeDefined();
    });

    it('should have all video consultation error translations', () => {
      expect(errors.video.setupFailed).toBeDefined();
      expect(errors.video.connectionError).toBeDefined();
      expect(errors.video.permissionDenied).toBeDefined();
      expect(errors.video.recordingFailed).toBeDefined();
    });

    it('should have generic error translations', () => {
      expect(errors.generic.unknown).toBeDefined();
      expect(errors.generic.internalError).toBeDefined();
      expect(errors.generic.unexpected).toBeDefined();
    });

    it('should have error title translations', () => {
      expect(errors.titles.error).toBeDefined();
      expect(errors.titles.attentionRequired).toBeDefined();
      expect(errors.titles.validation).toBeDefined();
      expect(errors.titles.authentication).toBeDefined();
      expect(errors.titles.limitReached).toBeDefined();
      expect(errors.titles.medicalAttentionRequired).toBeDefined();
      expect(errors.titles.somethingWentWrong).toBeDefined();
    });

    it('should have Spanish text content', () => {
      // Verify some key messages are in Spanish
      expect(errors.auth.invalidCredentials).toContain('correo');
      expect(errors.auth.invalidCredentials).toContain('contraseña');
      expect(errors.emergency.contact911).toContain('911');
    });
  });

  describe('English Translations (en.json)', () => {
    const errors = enMessages.errors as Record<string, Record<string, string>>;

    it('should have errors namespace', () => {
      expect(errors).toBeDefined();
    });

    it('should have all medical error translations', () => {
      expect(errors.medical.recordError).toBeDefined();
      expect(errors.medical.dataInvalid).toBeDefined();
      expect(errors.medical.symptomAnalysisFailed).toBeDefined();
      expect(errors.medical.redFlagDetected).toBeDefined();
    });

    it('should have all emergency error translations', () => {
      expect(errors.emergency.detected).toBeDefined();
      expect(errors.emergency.criticalSymptoms).toBeDefined();
      expect(errors.emergency.urgentCareNeeded).toBeDefined();
      expect(errors.emergency.redirect).toBeDefined();
    });

    it('should have English text content', () => {
      // Verify some key messages are in English
      expect(errors.auth.invalidCredentials).toContain('Email');
      expect(errors.auth.invalidCredentials).toContain('incorrect');
    });
  });

  describe('Translation Parity', () => {
    it('should have same structure in both languages', () => {
      const esErrors = Object.keys(esMessages.errors);
      const enErrors = Object.keys(enMessages.errors);
      
      expect(esErrors.sort()).toEqual(enErrors.sort());
      
      // Check nested keys for each category
      for (const category of esErrors) {
        const esKeys = Object.keys((esMessages.errors as Record<string, Record<string, string>>)[category]).sort();
        const enKeys = Object.keys((enMessages.errors as Record<string, Record<string, string>>)[category]).sort();
        expect(esKeys).toEqual(enKeys);
      }
    });
  });

  describe('Error Code Validation', () => {
    it('should validate known error codes', () => {
      expect(isValidErrorCode('MED_001')).toBe(true);
      expect(isValidErrorCode('EMG_001')).toBe(true);
      expect(isValidErrorCode('AUTH_001')).toBe(true);
    });

    it('should reject invalid error codes', () => {
      expect(isValidErrorCode('INVALID')).toBe(false);
      expect(isValidErrorCode('')).toBe(false);
    });
  });

  describe('Emergency Error Detection', () => {
    it('should identify emergency error codes', () => {
      expect(isEmergencyError('EMG_001')).toBe(true);
      expect(isEmergencyError('EMG_002')).toBe(true);
      expect(isEmergencyError('EMG_003')).toBe(true);
      expect(isEmergencyError('EMG_004')).toBe(true);
    });

    it('should not identify non-emergency codes as emergency', () => {
      expect(isEmergencyError('MED_001')).toBe(false);
      expect(isEmergencyError('AUTH_001')).toBe(false);
      expect(isEmergencyError('VAL_001')).toBe(false);
    });

    it('should return all emergency codes', () => {
      const emergencyCodes = getEmergencyErrorCodes();
      expect(emergencyCodes).toContain('EMG_001');
      expect(emergencyCodes).toContain('EMG_002');
      expect(emergencyCodes).toContain('EMG_003');
      expect(emergencyCodes).toContain('EMG_004');
      expect(emergencyCodes).toHaveLength(4);
    });
  });

  describe('Error Categories Coverage', () => {
    const expectedCategories = [
      'medical',
      'emergency',
      'prescription',
      'diagnosis',
      'appointment',
      'auth',
      'access',
      'validation',
      'notFound',
      'rateLimit',
      'external',
      'consent',
      'payment',
      'video',
      'generic',
      'titles',
    ];

    it('should have all error categories in Spanish', () => {
      const categories = Object.keys(esMessages.errors);
      for (const category of expectedCategories) {
        expect(categories).toContain(category);
      }
    });

    it('should have all error categories in English', () => {
      const categories = Object.keys(enMessages.errors);
      for (const category of expectedCategories) {
        expect(categories).toContain(category);
      }
    });
  });
});
