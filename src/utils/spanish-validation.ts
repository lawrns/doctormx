/**
 * Spanish Validation Messages and Utilities
 * Provides warm, friendly validation messages in Mexican Spanish
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

/**
 * Validation messages in warm, friendly Mexican Spanish
 */
export const ValidationMessages = {
  // General
  required: (field: string) => `Por favor, cuéntanos tu ${field.toLowerCase()}`,
  
  // Name validation
  name: {
    required: 'Por favor, cuéntanos tu nombre',
    tooShort: 'Tu nombre parece muy corto, ¿puedes escribirlo completo?',
    tooLong: 'Por favor, usa un nombre más corto para que sea más fácil',
    invalid: 'Por favor, usa solo letras en tu nombre'
  },
  
  // Symptom validation
  symptom: {
    required: 'Describe brevemente lo que te está molestando',
    tooShort: 'Por favor, proporciona un poco más de detalle sobre tus síntomas',
    tooLong: 'Trata de resumir tus síntomas principales en menos palabras',
    helpful: '¿Podrías contarnos cuándo empezaron estos síntomas?'
  },
  
  // Phone validation
  phone: {
    invalid: 'El formato del teléfono no parece correcto',
    tooShort: 'Por favor, incluye el código de área',
    helpful: 'Ejemplo: +52 55 1234 5678 o 5512345678'
  },
  
  // Email validation
  email: {
    required: 'Necesitamos tu correo para crear tu cuenta',
    invalid: 'El formato del correo no parece correcto',
    helpful: 'Ejemplo: maria@ejemplo.com'
  },
  
  // Password validation
  password: {
    required: 'Crea una contraseña para proteger tu cuenta',
    tooShort: 'Tu contraseña debe tener al menos 8 caracteres',
    weak: 'Trata de incluir letras, números y algún símbolo para mayor seguridad',
    helpful: 'Una contraseña segura protege tu información médica'
  },
  
  // Age validation
  age: {
    required: 'Necesitamos saber tu edad aproximada',
    tooYoung: 'Para menores de edad, recomendamos consultar con los padres',
    tooOld: 'Por favor, verifica que la edad sea correcta',
    invalid: 'Por favor, ingresa solo números'
  }
};

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  // Mexican names (allows accents, spaces, and common Mexican characters)
  name: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'.-]+$/,
  
  // Mexican phone numbers (various formats)
  phoneLoose: /^(\+?52\s?)?[\d\s()-]{8,}$/,
  phoneStrict: /^(\+52|52)?[\s-]?(\d{2,3})[\s-]?(\d{3,4})[\s-]?(\d{4})$/,
  
  // Email pattern
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Password strength (at least one letter, one number)
  passwordWeak: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
  passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].{8,}$/
};

/**
 * Validate a field with custom rules
 */
export function validateField(
  value: string, 
  fieldType: keyof typeof ValidationMessages,
  rules: FieldValidationRules = {}
): ValidationResult {
  const trimmedValue = value.trim();
  
  // Required validation
  if (rules.required && !trimmedValue) {
    const messages = ValidationMessages[fieldType];
    if (typeof messages === 'object' && 'required' in messages) {
      return { isValid: false, message: messages.required };
    }
    return { isValid: false, message: `Este campo es obligatorio` };
  }
  
  // Skip other validations if field is empty and not required
  if (!trimmedValue && !rules.required) {
    return { isValid: true };
  }
  
  // Length validations
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    const messages = ValidationMessages[fieldType];
    if (typeof messages === 'object' && 'tooShort' in messages) {
      return { isValid: false, message: messages.tooShort };
    }
    return { isValid: false, message: `Debe tener al menos ${rules.minLength} caracteres` };
  }
  
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    const messages = ValidationMessages[fieldType];
    if (typeof messages === 'object' && 'tooLong' in messages) {
      return { isValid: false, message: messages.tooLong };
    }
    return { isValid: false, message: `No debe exceder ${rules.maxLength} caracteres` };
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    const messages = ValidationMessages[fieldType];
    if (typeof messages === 'object' && 'invalid' in messages) {
      return { isValid: false, message: messages.invalid };
    }
    return { isValid: false, message: 'El formato no es válido' };
  }
  
  // Custom validation
  if (rules.custom) {
    return rules.custom(trimmedValue);
  }
  
  return { isValid: true };
}

/**
 * Specific field validators with Mexican context
 */
export const FieldValidators = {
  /**
   * Validate Mexican names
   */
  name: (value: string): ValidationResult => {
    return validateField(value, 'name', {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: ValidationPatterns.name
    });
  },

  /**
   * Validate medical symptoms
   */
  symptom: (value: string): ValidationResult => {
    const result = validateField(value, 'symptom', {
      required: true,
      minLength: 5,
      maxLength: 500
    });
    
    // Additional check for very short descriptions
    if (result.isValid && value.trim().length < 10) {
      return {
        isValid: false,
        message: ValidationMessages.symptom.helpful
      };
    }
    
    return result;
  },

  /**
   * Validate Mexican phone numbers
   */
  phone: (value: string): ValidationResult => {
    if (!value.trim()) {
      return { isValid: true }; // Phone is optional
    }
    
    // Remove all spaces and formatting
    const cleanPhone = value.replace(/[\s()-]/g, '');
    
    // Check minimum length
    if (cleanPhone.length < 10) {
      return {
        isValid: false,
        message: ValidationMessages.phone.tooShort
      };
    }
    
    // Check format
    if (!ValidationPatterns.phoneLoose.test(value)) {
      return {
        isValid: false,
        message: ValidationMessages.phone.invalid
      };
    }
    
    return { isValid: true };
  },

  /**
   * Validate email
   */
  email: (value: string): ValidationResult => {
    return validateField(value, 'email', {
      required: true,
      pattern: ValidationPatterns.email
    });
  },

  /**
   * Validate password strength
   */
  password: (value: string): ValidationResult => {
    const result = validateField(value, 'password', {
      required: true,
      minLength: 8,
      maxLength: 100
    });
    
    if (!result.isValid) return result;
    
    // Check for weak password
    if (!ValidationPatterns.passwordWeak.test(value)) {
      return {
        isValid: false,
        message: ValidationMessages.password.weak
      };
    }
    
    return { isValid: true };
  },

  /**
   * Validate age
   */
  age: (value: string): ValidationResult => {
    const numValue = parseInt(value);
    
    if (isNaN(numValue)) {
      return {
        isValid: false,
        message: ValidationMessages.age.invalid
      };
    }
    
    if (numValue < 1) {
      return {
        isValid: false,
        message: ValidationMessages.age.required
      };
    }
    
    if (numValue < 18) {
      return {
        isValid: false,
        message: ValidationMessages.age.tooYoung
      };
    }
    
    if (numValue > 120) {
      return {
        isValid: false,
        message: ValidationMessages.age.tooOld
      };
    }
    
    return { isValid: true };
  }
};

/**
 * Validate multiple fields at once
 */
export function validateForm(
  data: Record<string, string>,
  validators: Record<string, (value: string) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  for (const [field, validator] of Object.entries(validators)) {
    const value = data[field] || '';
    const result = validator(value);
    
    if (!result.isValid && result.message) {
      errors[field] = result.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Get helpful placeholder text for common fields
 */
export const PlaceholderText = {
  name: 'Ej: María González',
  symptom: 'Ej: Dolor de cabeza intenso desde ayer, me duele el estómago después de comer...',
  phone: 'Ej: +52 55 1234 5678',
  email: 'tu.correo@ejemplo.com',
  password: 'Mínimo 8 caracteres',
  age: 'Ej: 28'
};

/**
 * Get encouraging help text for fields
 */
export const HelpText = {
  name: 'Solo necesitamos tu nombre para personalizar la consulta',
  symptom: 'Comparte los síntomas principales que te están molestando',
  phone: 'Para recibir seguimiento vía WhatsApp (opcional)',
  email: 'Te permitirá acceder a tu historial médico',
  password: 'Protege tu información médica personal',
  age: 'Nos ayuda a dar recomendaciones más precisas'
};

export default {
  ValidationMessages,
  ValidationPatterns,
  validateField,
  FieldValidators,
  validateForm,
  PlaceholderText,
  HelpText
};