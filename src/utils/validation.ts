// Comprehensive validation utilities for DoctorMX
import DOMPurify from 'dompurify';

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'El email es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  if (email.length > 255) {
    return { isValid: false, error: 'El email es muy largo' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength?: string } => {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres', strength: 'weak' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strengthScore < 3) {
    return { 
      isValid: false, 
      error: 'La contraseña debe contener al menos 3 de: mayúsculas, minúsculas, números, caracteres especiales',
      strength: strengthScore < 2 ? 'weak' : 'medium'
    };
  }
  
  return { 
    isValid: true, 
    strength: strengthScore === 4 ? 'strong' : 'medium'
  };
};

// Phone validation (Mexican format)
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Mexican phone validation: 10 digits for mobile, 8 for landline
  if (digitsOnly.length !== 10 && digitsOnly.length !== 8) {
    return { isValid: false, error: 'Formato de teléfono inválido (debe tener 8 o 10 dígitos)' };
  }
  
  // Mexican mobile numbers start with specific prefixes
  if (digitsOnly.length === 10) {
    const mobilePrefix = digitsOnly.substring(0, 3);
    const validPrefixes = ['044', '045', '55', '56', '33', '81', '222', '477', '473', '961', '998'];
    // This is a simplified check - in practice, you'd want a more comprehensive list
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'nombre'): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `El ${fieldName} es requerido` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: `El ${fieldName} debe tener al menos 2 caracteres` };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: `El ${fieldName} es muy largo` };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: `El ${fieldName} solo puede contener letras, espacios, guiones y apostrofes` };
  }
  
  return { isValid: true };
};

// Medical license validation (Mexican format)
export const validateMedicalLicense = (license: string): { isValid: boolean; error?: string } => {
  if (!license || !license.trim()) {
    return { isValid: false, error: 'El número de cédula es requerido' };
  }
  
  const trimmedLicense = license.trim();
  
  // Mexican medical license format: typically 7-8 digits
  const licenseRegex = /^\d{7,8}$/;
  if (!licenseRegex.test(trimmedLicense)) {
    return { isValid: false, error: 'Formato de cédula inválido (debe tener 7-8 dígitos)' };
  }
  
  return { isValid: true };
};

// Date validation
export const validateDate = (date: string, fieldName: string = 'fecha'): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: `La ${fieldName} es requerida` };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `Formato de ${fieldName} inválido` };
  }
  
  // Check if date is not in the future (for birth dates, etc.)
  if (fieldName.includes('nacimiento') && dateObj > new Date()) {
    return { isValid: false, error: 'La fecha de nacimiento no puede ser en el futuro' };
  }
  
  // Check if date is not too far in the past (reasonable birth date)
  if (fieldName.includes('nacimiento')) {
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 120);
    
    if (dateObj < hundredYearsAgo) {
      return { isValid: false, error: 'Fecha de nacimiento no válida' };
    }
  }
  
  return { isValid: true };
};

// Text content sanitization
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Basic HTML sanitization
  const sanitized = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Remove extra whitespace
  return sanitized.trim().replace(/\s+/g, ' ');
};

// Medical content sanitization (allows some formatting)
export const sanitizeMedicalContent = (content: string): string => {
  if (!content) return '';
  
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
  
  return sanitized.trim();
};

// Generic field validation
export const validateField = (
  value: any, 
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => { isValid: boolean; error?: string };
  },
  fieldName: string
): { isValid: boolean; error?: string } => {
  
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }
  
  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return { isValid: true };
  }
  
  const stringValue = String(value).trim();
  
  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return { isValid: false, error: `${fieldName} debe tener al menos ${rules.minLength} caracteres` };
  }
  
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return { isValid: false, error: `${fieldName} debe tener máximo ${rules.maxLength} caracteres` };
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return { isValid: false, error: `Formato de ${fieldName} inválido` };
  }
  
  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }
  
  return { isValid: true };
};

// Validate form data
export const validateForm = <T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => { isValid: boolean; error?: string };
    validator?: 'email' | 'password' | 'phone' | 'name' | 'date' | 'medicalLicense';
  }>
): { isValid: boolean; errors: Record<keyof T, string>; sanitizedData: T } => {
  
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
  const sanitizedData: T = {} as T;
  
  for (const field in schema) {
    const value = data[field];
    const rules = schema[field];
    const fieldName = String(field);
    
    let validation: { isValid: boolean; error?: string };
    
    // Use specific validator if specified
    if (rules.validator) {
      switch (rules.validator) {
        case 'email':
          validation = validateEmail(value);
          break;
        case 'password':
          validation = validatePassword(value);
          break;
        case 'phone':
          validation = validatePhone(value);
          break;
        case 'name':
          validation = validateName(value, fieldName);
          break;
        case 'date':
          validation = validateDate(value, fieldName);
          break;
        case 'medicalLicense':
          validation = validateMedicalLicense(value);
          break;
        default:
          validation = validateField(value, rules, fieldName);
      }
    } else {
      validation = validateField(value, rules, fieldName);
    }
    
    if (!validation.isValid) {
      errors[field] = validation.error || 'Valor inválido';
    }
    
    // Sanitize the data
    if (typeof value === 'string') {
      sanitizedData[field] = sanitizeText(value) as T[keyof T];
    } else {
      sanitizedData[field] = value;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Rate limiting utility (for client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
}

// Export a default rate limiter instance
export const defaultRateLimiter = new RateLimiter();

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateMedicalLicense,
  validateDate,
  sanitizeText,
  sanitizeMedicalContent,
  validateField,
  validateForm,
  RateLimiter,
  defaultRateLimiter
};