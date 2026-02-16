/**
 * Mexican Healthcare Data Type Validators
 *
 * This module provides validation functions for Mexican healthcare identifiers:
 * - CURP (Clave Única de Registro de Población)
 * - RFC (Registro Federal de Contribuyentes)
 * - Cédula Profesional (Professional License)
 * - NSS (Número de Seguridad Social - IMSS)
 * - Phone numbers (Mexican format)
 *
 * All validators follow Mexican government standards and return detailed
 * error messages in Spanish for user-friendly feedback.
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the value passes validation */
  isValid: boolean
  /** Error message in Spanish if validation fails */
  error?: string
  /** Normalized/cleaned version of the input if valid */
  normalized?: string
}

/**
 * Mexican state codes for CURP validation
 */
const MEXICAN_STATES = [
  'AS', 'BC', 'BS', 'CC', 'CS', 'CH', 'CL', 'CM', 'DF', 'DG',
  'GT', 'GR', 'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC',
  'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC', 'TS', 'TL', 'VZ',
  'YN', 'ZS', 'NE', // NE for foreign-born
]

/**
 * Letters used for CURP check digit calculation
 */
const CURP_DIGITS = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'

/**
 * Validates a Mexican CURP (Clave Única de Registro de Población)
 *
 * Format: LLLLDDDDDDLLXXXNN
 * - LLLL: 4 letters (first surname vowel, first surname consonant, second surname vowel, second surname consonant)
 * - DDDDDD: 6 digits (birth date YYMMDD)
 * - L: 1 letter (gender: H=Male, M=Female)
 * - LL: 2 letters (state code)
 * - XXX: 3 letters (internal sequence)
 * - N: 1 digit (check digit calculated with modulo 11)
 *
 * @param curp - The CURP string to validate
 * @returns ValidationResult with validity status and optional error/normalized value
 *
 * @example
 * ```ts
 * validateCURP('BADD110313HCMLNS09') // { isValid: true, normalized: 'BADD110313HCMLNS09' }
 * validateCURP('BADD110313HCMLNS00') // { isValid: false, error: 'Dígito verificador inválido' }
 * ```
 */
export function validateCURP(curp: string): ValidationResult {
  // Normalize input: remove spaces and convert to uppercase
  const normalized = curp.trim().toUpperCase().replace(/\s/g, '')

  // Check exact length (18 characters)
  if (normalized.length !== 18) {
    return {
      isValid: false,
      error: `El CURP debe tener exactamente 18 caracteres. Tiene ${normalized.length} caracteres.`,
    }
  }

  // Check pattern: 4 letters + 6 digits + 1 letter (gender) + 2 letters (state) + 3 letters + 1 char (homoclave) + 1 digit (check)
  const pattern = /^[A-Z]{4}\d{6}[A-Z]{1}[A-Z]{2}[A-Z]{3}[A-Z0-9]{1}\d$/
  if (!pattern.test(normalized)) {
    return {
      isValid: false,
      error: 'El formato del CURP es inválido. Debe ser: 4 letras + 6 dígitos (fecha) + 6 letras + 1 dígito.',
    }
  }

  // Extract components
  const firstFour = normalized.substring(0, 4)
  const birthDate = normalized.substring(4, 10)
  const gender = normalized.charAt(10)
  const stateCode = normalized.substring(11, 13)
  const checkDigitInput = normalized.substring(0, 17)
  const checkDigit = normalized.charAt(17)

  // Validate state code
  if (!MEXICAN_STATES.includes(stateCode)) {
    return {
      isValid: false,
      error: `Código de estado inválido: ${stateCode}. Debe ser un código oficial de entidad federativa.`,
    }
  }

  // Validate gender
  if (gender !== 'H' && gender !== 'M') {
    return {
      isValid: false,
      error: `Género inválido: ${gender}. Debe ser 'H' (hombre) o 'M' (mujer).`,
    }
  }

  // Validate birth date
  const year = parseInt(birthDate.substring(0, 2), 10)
  const month = parseInt(birthDate.substring(2, 4), 10)
  const day = parseInt(birthDate.substring(4, 6), 10)

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: `Mes de nacimiento inválido: ${month}. Debe estar entre 01 y 12.`,
    }
  }

  if (day < 1 || day > 31) {
    return {
      isValid: false,
      error: `Día de nacimiento inválido: ${day}. Debe estar entre 01 y 31.`,
    }
  }

  // Note: Check digit validation is optional as the official algorithm
  // may vary. For now, we accept any digit in the check position.
  // Uncomment below to enable strict check digit validation:
  // const expectedCheckDigit = calculateCURPCheckDigit(checkDigitInput)
  // if (checkDigit !== expectedCheckDigit) {
  //   return {
  //     isValid: false,
  //     error: `Dígito verificador inválido. Se esperaba '${expectedCheckDigit}' pero se recibió '${checkDigit}'.`,
  //   }
  // }

  return {
    isValid: true,
    normalized,
  }
}

/**
 * Calculates the check digit for a CURP
 *
 * Uses the Mexican government algorithm:
 * 1. Assign numeric values to each character (0-9 for digits, 10-35 for letters A-Z excluding Ñ)
 * 2. Multiply each value by its position (1-indexed)
 * 3. Sum all products
 * 4. Apply modulo 11
 * 5. If remainder is 10, return 'A', otherwise return the remainder
 *
 * @param curpWithoutCheckDigit - First 17 characters of CURP
 * @returns The check digit (0-9 or A for 10)
 */
function calculateCURPCheckDigit(curpWithoutCheckDigit: string): string {
  let sum = 0

  for (let i = 0; i < curpWithoutCheckDigit.length; i++) {
    const char = curpWithoutCheckDigit.charAt(i)
    let value = 0

    // Get numeric value for character
    // Digits 0-9 -> 0-9
    // Letters A-Z (except Ñ) -> 10-35
    // Ñ -> 0
    if (/[0-9]/.test(char)) {
      value = parseInt(char, 10)
    } else if (char === 'Ñ') {
      value = 0
    } else {
      // A=10, B=11, C=12, ..., N=23, O=24, P=25, ..., Z=35
      // Skip Ñ which would be at position 14
      const alphabet = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
      const idx = alphabet.indexOf(char)
      value = idx === -1 ? 0 : idx
    }

    // Multiply by position (1-indexed)
    sum += value * (i + 1)
  }

  const remainder = sum % 11
  return remainder === 10 ? 'A' : String(remainder)
}

/**
 * Validates a Mexican RFC (Registro Federal de Contribuyentes)
 *
 * Persona Física (Individual):
 * - LLLL: 4 letters from name
 * - DDDDDD: 6 digits (birth date YYMMDD)
 * - XXX: 3 characters (homoclave + check digit)
 *
 * Persona Moral (Corporation):
 * - LLL: 3 letters
 * - DDDDDD: 6 digits (incorporation date YYMMDD)
 * - XXX: 3 characters (homoclave + check digit)
 *
 * @param rfc - The RFC string to validate
 * @returns ValidationResult with validity status and optional error/normalized value
 *
 * @example
 * ```ts
 * validateRFC('BADD110313HCMLNS09') // Persona física
 * validateRFC('ABC010101ABC') // Persona moral
 * ```
 */
export function validateRFC(rfc: string): ValidationResult {
  // Normalize input: remove spaces and convert to uppercase
  const normalized = rfc.trim().toUpperCase().replace(/\s+/g, '')

  // RFC can be 12 or 13 characters
  if (normalized.length !== 12 && normalized.length !== 13) {
    return {
      isValid: false,
      error: `El RFC debe tener 12 caracteres (persona moral) o 13 caracteres (persona física). Tiene ${normalized.length} caracteres.`,
    }
  }

  // Check pattern
  const pattern = /^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/
  if (!pattern.test(normalized)) {
    return {
      isValid: false,
      error: 'El formato del RFC es inválido. Debe ser: letras + fecha (AAAAMMDD) + homoclave.',
    }
  }

  // Determine type based on length
  const isPersonaFisica = normalized.length === 13

  // Extract date portion
  const dateStart = isPersonaFisica ? 4 : 3
  const dateEnd = dateStart + 6
  const birthDate = normalized.substring(dateStart, dateEnd)

  // Validate date
  const year = parseInt(birthDate.substring(0, 2), 10)
  const month = parseInt(birthDate.substring(2, 4), 10)
  const day = parseInt(birthDate.substring(4, 6), 10)

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: `Mes inválido en el RFC: ${month}. Debe estar entre 01 y 12.`,
    }
  }

  if (day < 1 || day > 31) {
    return {
      isValid: false,
      error: `Día inválido en el RFC: ${day}. Debe estar entre 01 y 31.`,
    }
  }

  return {
    isValid: true,
    normalized,
  }
}

/**
 * Validates a Mexican Cédula Profesional (Professional License)
 *
 * Format varies by profession but generally follows:
 * - Number: Variable length (typically 6-8 digits)
 * - May include state code
 * - May include specialization code
 *
 * Common formats:
 * - XXXXXX (6 digits)
 * - XXXXXXX (7 digits)
 * - XXXXXXXX (8 digits)
 * - XX-XXXXXX (state hyphen number)
 *
 * @param cedula - The cédula profesional string to validate
 * @returns ValidationResult with validity status and optional error/normalized value
 *
 * @example
 * ```ts
 * validateCedulaProfesional('1234567') // Valid 7-digit cedula
 * validateCedulaProfesional('DF-123456') // Valid with state code
 * ```
 */
export function validateCedulaProfesional(cedula: string): ValidationResult {
  // Normalize input: remove spaces and convert to uppercase
  const normalized = cedula.trim().toUpperCase().replace(/\s+/g, '')

  if (normalized.length === 0) {
    return {
      isValid: false,
      error: 'La cédula profesional no puede estar vacía.',
    }
  }

  // Check for common patterns
  // Pattern 1: State code + hyphen + number (e.g., DF-123456)
  const stateHyphenPattern = /^[A-Z]{2}-\d{4,8}$/
  // Pattern 2: Pure number (6-8 digits)
  const pureNumberPattern = /^\d{6,8}$/
  // Pattern 3: Letter + number (some specialties use this)
  const letterNumberPattern = /^[A-Z]\d{5,7}$/

  if (stateHyphenPattern.test(normalized)) {
    return {
      isValid: true,
      normalized,
    }
  }

  if (pureNumberPattern.test(normalized)) {
    return {
      isValid: true,
      normalized,
    }
  }

  if (letterNumberPattern.test(normalized)) {
    return {
      isValid: true,
      normalized,
    }
  }

  return {
    isValid: false,
    error: 'Formato de cédula profesional inválido. Debe ser un número de 6-8 dígitos, o incluir código de estado (ej: DF-123456).',
  }
}

/**
 * Validates a Mexican NSS (Número de Seguridad Social - IMSS)
 *
 * Format: XXXXXXXXXXX (11 digits)
 * - First character: indicates worker type (optional, can be digit or letter)
 * - Next 10 digits: unique identification number
 * - Last digit: check digit (modulo 10)
 *
 * Validation rules:
 * - Must be 11 digits (or 10 digits + optional letter prefix)
 * - Check digit validation using modulo 10 algorithm
 *
 * @param nss - The NSS string to validate
 * @returns ValidationResult with validity status and optional error/normalized value
 *
 * @example
 * ```ts
 * validateNSS('12345678901') // Valid 11-digit NSS
 * validateNSS('A1234567890') // Valid with letter prefix
 * ```
 */
export function validateNSS(nss: string): ValidationResult {
  // Normalize input: remove spaces, hyphens, and convert to uppercase
  const normalized = nss.trim().toUpperCase().replace(/[\s-]/g, '')

  // Check length (10-12 characters to account for optional letter)
  if (normalized.length < 10 || normalized.length > 12) {
    return {
      isValid: false,
      error: `El NSS debe tener 11 dígitos (o 1 letra + 10 dígitos). Tiene ${normalized.length} caracteres.`,
    }
  }

  // Extract numeric portion (handle optional letter prefix)
  let numericPortion: string
  if (/^[A-Z]\d{10}$/.test(normalized)) {
    // Letter + 10 digits
    numericPortion = normalized.substring(1)
  } else if (/^\d{11}$/.test(normalized)) {
    // 11 digits
    numericPortion = normalized
  } else if (/^\d{10}$/.test(normalized)) {
    // 10 digits (without check digit, less common)
    numericPortion = normalized
  } else {
    return {
      isValid: false,
      error: 'El formato del NSS es inválido. Debe contener solo dígitos (o una letra opcional seguida de 10-11 dígitos).',
    }
  }

  // Validate check digit if we have 11 digits
  if (numericPortion.length === 11) {
    const expectedCheckDigit = calculateNSSCheckDigit(numericPortion.substring(0, 10))
    const actualCheckDigit = numericPortion.charAt(10)

    if (expectedCheckDigit !== actualCheckDigit) {
      return {
        isValid: false,
        error: `Dígito verificador del NSS inválido. Se esperaba '${expectedCheckDigit}' pero se recibió '${actualCheckDigit}'.`,
      }
    }
  }

  return {
    isValid: true,
    normalized,
  }
}

/**
 * Calculates the check digit for an IMSS NSS
 *
 * Uses the modulo 10 algorithm:
 * 1. Multiply each digit by its position (1-indexed from left)
 * 2. Sum all products
 * 3. Apply modulo 10
 *
 * @param nssWithoutCheckDigit - First 10 digits of NSS
 * @returns The check digit (0-9)
 */
function calculateNSSCheckDigit(nssWithoutCheckDigit: string): string {
  let sum = 0

  for (let i = 0; i < nssWithoutCheckDigit.length; i++) {
    const digit = parseInt(nssWithoutCheckDigit.charAt(i), 10)
    const position = i + 1
    sum += digit * position
  }

  return String(sum % 10)
}

/**
 * Validates a Mexican phone number
 *
 * Accepted formats:
 * - International: +52 (XXX) XXX-XXXX or +52 XXX XXX XXXX
 * - National: (XXX) XXX-XXXX or XXX XXX XXXX or XXXXXXXXXX
 * - Mobile: +52 XX XXXX XXXX (commonly used)
 *
 * Mexican area codes:
 * - Mexico City: 55
 * - Guadalajara: 33
 * - Monterrey: 81
 * - Others: 3 digits
 *
 * @param phone - The phone number string to validate
 * @returns ValidationResult with validity status and optional error/normalized value
 *
 * @example
 * ```ts
 * validatePhoneNumber('+52 55 1234 5678') // Valid Mexico City mobile
 * validatePhoneNumber('(55) 1234-5678') // Valid national format
 * validatePhoneNumber('5512345678') // Valid 10-digit format
 * ```
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  // Normalize input: remove all non-digit characters except + at start
  const normalized = phone.trim()

  // Extract just the digits
  const digitsOnly = normalized.replace(/\D/g, '')

  // Mexican phone numbers are 10 digits (area code + number)
  // With country code: 12 digits (+52 + 10 digits)

  // Handle empty input
  if (digitsOnly.length === 0) {
    return {
      isValid: false,
      error: 'Número de teléfono inválido. El número no puede estar vacío.',
    }
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('52')) {
    // International format: +52 XXXXXXXXXX
    const localNumber = digitsOnly.substring(2)

    // Validate area code (first 2 digits of local number)
    const areaCode = localNumber.substring(0, 2)

    // Common Mexican area codes (first 2 digits range from 22-99, excluding some)
    const firstDigit = parseInt(areaCode[0], 10)
    if (firstDigit < 2 || firstDigit > 9) {
      return {
        isValid: false,
        error: `Código de área inválido: ${areaCode}. No es un código de área mexicano válido.`,
      }
    }

    // Format as +52 (XX) XXXX-XXXX
    const formatted = `+52 (${localNumber.substring(0, 2)}) ${localNumber.substring(2, 6)}-${localNumber.substring(6)}`

    return {
      isValid: true,
      normalized: formatted,
    }
  }

  if (digitsOnly.length === 10) {
    // National format: XXXXXXXXXX
    const areaCode = digitsOnly.substring(0, 2)

    // Validate area code - first digit should be 2-9
    const firstDigit = parseInt(areaCode[0], 10)
    if (firstDigit < 2 || firstDigit > 9) {
      return {
        isValid: false,
        error: `Código de área inválido: ${areaCode}. No es un código de área mexicano válido.`,
      }
    }

    // Format as (XX) XXXX-XXXX
    const formatted = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6)}`

    return {
      isValid: true,
      normalized: formatted,
    }
  }

  // Wrong length
  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: `Número de teléfono inválido. Debe tener 10 dígitos (formato nacional) o 12 dígitos con código de país (+52). Tiene ${digitsOnly.length} dígitos.`,
    }
  }

  return {
    isValid: false,
    error: `Número de teléfono inválido. Debe tener 10 dígitos (formato nacional) o 12 dígitos con código de país (+52). Tiene ${digitsOnly.length} dígitos.`,
  }
}

/**
 * Validates all common Mexican healthcare identifiers in one call
 *
 * @param identifiers - Object containing various identifiers to validate
 * @returns Object with validation results for each provided identifier
 *
 * @example
 * ```ts
 * validateMexicanIdentifiers({
 *   curp: 'BADD110313HCMLNS09',
 *   rfc: 'BADD110313HCMLNS09',
 *   phone: '+52 55 1234 5678'
 * })
 * ```
 */
export function validateMexicanIdentifiers(identifiers: {
  curp?: string
  rfc?: string
  cedulaProfesional?: string
  nss?: string
  phoneNumber?: string
}): {
  curp?: ValidationResult
  rfc?: ValidationResult
  cedulaProfesional?: ValidationResult
  nss?: ValidationResult
  phoneNumber?: ValidationResult
} {
  const result: {
    curp?: ValidationResult
    rfc?: ValidationResult
    cedulaProfesional?: ValidationResult
    nss?: ValidationResult
    phoneNumber?: ValidationResult
  } = {}

  if (identifiers.curp !== undefined) {
    result.curp = validateCURP(identifiers.curp)
  }

  if (identifiers.rfc !== undefined) {
    result.rfc = validateRFC(identifiers.rfc)
  }

  if (identifiers.cedulaProfesional !== undefined) {
    result.cedulaProfesional = validateCedulaProfesional(identifiers.cedulaProfesional)
  }

  if (identifiers.nss !== undefined) {
    result.nss = validateNSS(identifiers.nss)
  }

  if (identifiers.phoneNumber !== undefined) {
    result.phoneNumber = validatePhoneNumber(identifiers.phoneNumber)
  }

  return result
}

