/**
 * Error Handler System Tests
 *
 * Demonstrates usage of the global error handling system
 */

import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  EmergencyDetectedError,
  PrescriptionError,
  DiagnosisError,
  AppointmentError,
  AuthenticationError,
  ValidationError,
  handleError,
  logError,
  createRouteHandler,
  handleClientError,
  createToastError,
  getErrorInfo,
  isAppError,
  assertPresent,
  ERROR_CODES,
  getPatientMessage,
  getDeveloperMessage,
  isEmergencyError
} from '../index';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create base error with correct properties', () => {
      const error = new AppError('TEST_001', 500, 'Test error message');
      expect(error.code).toBe('TEST_001');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Test error message');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError('TEST_001', 500, 'Test error');
      const json = error.toJSON();
      expect(json).toEqual({
        code: 'TEST_001',
        statusCode: 500,
        message: 'Test error',
        name: 'AppError'
      });
    });
  });

  describe('EmergencyDetectedError', () => {
    it('should create emergency error with severity', () => {
      const error = new EmergencyDetectedError(
        'EMG_001',
        'Critical symptoms detected',
        'critical',
        ['chest pain', 'shortness of breath']
      );

      expect(error.code).toBe('EMG_001');
      expect(error.statusCode).toBe(422);
      expect(error.severity).toBe('critical');
      expect(error.detectedSymptoms).toEqual(['chest pain', 'shortness of breath']);
    });

    it('should include severity and symptoms in JSON', () => {
      const error = new EmergencyDetectedError(
        'EMG_001',
        'Critical symptoms',
        'high',
        ['fever', 'cough']
      );

      const json = error.toJSON();
      expect(json.severity).toBe('high');
      expect(json.detectedSymptoms).toEqual(['fever', 'cough']);
    });
  });

  describe('PrescriptionError', () => {
    it('should create prescription error with drug details', () => {
      const error = new PrescriptionError(
        'RX_002',
        'Drug interaction detected',
        'Ibuprofen',
        'drug-drug'
      );

      expect(error.drugName).toBe('Ibuprofen');
      expect(error.interactionType).toBe('drug-drug');
    });
  });

  describe('DiagnosisError', () => {
    it('should create diagnosis error with confidence', () => {
      const error = new DiagnosisError(
        'DX_001',
        'Low confidence diagnosis',
        0.45,
        ['Condition A', 'Condition B']
      );

      expect(error.confidence).toBe(0.45);
      expect(error.alternativeDiagnoses).toEqual(['Condition A', 'Condition B']);
    });
  });

  describe('AppointmentError', () => {
    it('should create appointment error with conflict details', () => {
      const error = new AppointmentError(
        'APT_001',
        'Time slot conflict',
        'doctor-123',
        '2024-02-10T10:00:00Z',
        'conflict'
      );

      expect(error.doctorId).toBe('doctor-123');
      expect(error.requestedTime).toBe('2024-02-10T10:00:00Z');
      expect(error.reason).toBe('conflict');
    });
  });
});

describe('Error Messages', () => {
  it('should return Spanish patient messages', () => {
    const message = getPatientMessage(ERROR_CODES.EMERGENCY_DETECTED);
    expect(message).toContain('atención médica urgente');
  });

  it('should return English developer messages', () => {
    const message = getDeveloperMessage(ERROR_CODES.EMERGENCY_DETECTED);
    expect(message).toContain('Emergency symptoms');
  });

  it('should identify emergency error codes', () => {
    expect(isEmergencyError(ERROR_CODES.EMERGENCY_DETECTED)).toBe(true);
    expect(isEmergencyError(ERROR_CODES.VALIDATION_FAILED)).toBe(false);
  });
});

describe('Error Handler', () => {
  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new EmergencyDetectedError(
      'EMG_001',
      'Test emergency',
      'critical'
    );

    logError(error, { userId: 'test-user', route: '/test' });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should return NextResponse for AppError', async () => {
    const error = new ValidationError('VAL_001', 'Validation failed', 'email');
    const response = await handleError(error);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error.code).toBe('VAL_001');
    expect(json.success).toBe(false);
  });

  it('should return emergency response for emergency errors', async () => {
    const error = new EmergencyDetectedError(
      'EMG_001',
      'Emergency detected',
      'critical'
    );

    const response = await handleError(error);
    const json = await response.json();

    expect(json.error.requiresImmediateAction).toBe(true);
    expect(json.error.emergencyContact).toBeDefined();
  });
});

describe('Route Handler', () => {
  it('should create route handler with context', async () => {
    const handler = createRouteHandler('/api/test', 'POST');
    const mockHandler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }))
    );

    const response = await handler(mockHandler, { userId: 'test-user' });
    expect(response).toBeDefined();
  });

  it('should catch errors in route handler', async () => {
    const handler = createRouteHandler('/api/test', 'GET');
    const mockHandler = vi.fn().mockRejectedValue(
      new AuthenticationError('AUTH_001', 'Not authenticated')
    );

    const response = await handler(mockHandler);
    expect(response.status).toBe(401);
  });
});

describe('Client Error Handler', () => {
  it('should return user-friendly message for clients', () => {
    const error = new ValidationError('VAL_001', 'Invalid email');
    const message = handleClientError(error, { userId: 'test-user' });

    expect(message).toBeTruthy();
    expect(typeof message).toBe('string');
  });
});

describe('Toast Error Creator', () => {
  it('should create toast error object', () => {
    const error = new EmergencyDetectedError('EMG_001', 'Emergency', 'high');
    const toast = createToastError(error);

    expect(toast.title).toBeTruthy();
    expect(toast.description).toBeTruthy();
    expect(toast.variant).toBe('destructive');
  });
});

describe('Error Info Extractor', () => {
  it('should extract error info for error boundary', () => {
    const error = new EmergencyDetectedError('EMG_001', 'Emergency', 'critical');
    const info = getErrorInfo(error);

    expect(info.title).toBeTruthy();
    expect(info.message).toBeTruthy();
    expect(info.showRetry).toBe(false); // Emergency errors don't show retry
    expect(info.showHome).toBe(true);
  });
});

describe('Type Guards', () => {
  it('should identify AppError instances', () => {
    const appError = new AppError('TEST_001', 500, 'Test');
    const standardError = new Error('Standard error');

    expect(isAppError(appError)).toBe(true);
    expect(isAppError(standardError)).toBe(false);
  });
});

describe('Assertion Helpers', () => {
  it('should assert value is present', () => {
    expect(() => assertPresent(null, 'testField')).toThrow();
    expect(() => assertPresent(undefined, 'testField')).toThrow();
    expect(() => assertPresent('value', 'testField')).not.toThrow();
  });
});

describe('Real-world Usage Examples', () => {
  it('should demonstrate AI consultation error handling', async () => {
    // Simulate AI detecting emergency symptoms
    const error = new EmergencyDetectedError(
      ERROR_CODES.EMERGENCY_DETECTED,
      'According to symptoms described, immediate medical attention may be required',
      'critical',
      ['chest pain', 'shortness of breath', 'dizziness']
    );

    const response = await handleError(error, {
      userId: 'patient-123',
      route: '/api/ai/consult',
      method: 'POST'
    });

    const json = await response.json();
    expect(json.error.detectedSymptoms).toContain('chest pain');
    expect(json.error.emergencyContact.phone).toBe('911');
  });

  it('should demonstrate prescription validation error handling', async () => {
    const error = new PrescriptionError(
      ERROR_CODES.DRUG_INTERACTION,
      'Potential interaction between Ibuprofen and Aspirin detected',
      'Ibuprofen',
      'drug-drug'
    );

    const response = await handleError(error, {
      userId: 'patient-123',
      route: '/api/prescription/generate'
    });

    const json = await response.json();
    expect(json.error.drugName).toBe('Ibuprofen');
    expect(json.error.interactionType).toBe('drug-drug');
  });

  it('should demonstrate appointment booking conflict', async () => {
    const error = new AppointmentError(
      ERROR_CODES.APPOINTMENT_CONFLICT,
      'Selected time slot is no longer available',
      'doctor-456',
      '2024-02-15T14:00:00Z',
      'conflict'
    );

    const response = await handleError(error, {
      userId: 'patient-123',
      route: '/api/appointments/book'
    });

    const json = await response.json();
    expect(json.error.reason).toBe('conflict');
    expect(json.status).toBe(409);
  });
});
