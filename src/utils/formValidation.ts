type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  isEmail?: boolean;
  isPhone?: boolean;
  isPassword?: boolean;
  custom?: (value: any) => boolean;
  message?: string;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

export type ValidationErrors = {
  [key: string]: string;
};

export const validateForm = (values: { [key: string]: any }, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    // Required check
    if (fieldRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = fieldRules.message || 'Este campo es requerido';
      return;
    }

    // If field is empty and not required, skip other validations
    if (!value && !fieldRules.required) return;

    // Min length check
    if (fieldRules.minLength !== undefined && value.length < fieldRules.minLength) {
      errors[field] = fieldRules.message || `Debe tener al menos ${fieldRules.minLength} caracteres`;
      return;
    }

    // Max length check
    if (fieldRules.maxLength !== undefined && value.length > fieldRules.maxLength) {
      errors[field] = fieldRules.message || `No puede tener más de ${fieldRules.maxLength} caracteres`;
      return;
    }

    // Pattern check
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || 'Formato inválido';
      return;
    }

    // Email check
    if (fieldRules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = fieldRules.message || 'Correo electrónico inválido';
      return;
    }

    // Phone check - basic Mexican phone format
    if (fieldRules.isPhone && !/^(\+?52)?\d{10}$/.test(value.replace(/[\s-]/g, ''))) {
      errors[field] = fieldRules.message || 'Número telefónico inválido';
      return;
    }

    // Password strength check
    if (fieldRules.isPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)) {
      errors[field] = fieldRules.message || 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números';
      return;
    }

    // Custom validation
    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.message || 'Valor inválido';
      return;
    }
  });

  return errors;
};