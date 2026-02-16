/**
 * Unit tests for Mexican Healthcare Data Type Validators
 *
 * This test suite validates all Mexican healthcare identifier validators:
 * - CURP (Clave Única de Registro de Población)
 * - RFC (Registro Federal de Contribuyentes)
 * - Cédula Profesional (Professional License)
 * - NSS (Número de Seguridad Social - IMSS)
 * - Phone numbers (Mexican format)
 */

import {
  validateCURP,
  validateRFC,
  validateCedulaProfesional,
  validateNSS,
  validatePhoneNumber,
  validateMexicanIdentifiers,
  type ValidationResult,
} from '../mexican-validators'

describe('CURP Validator', () => {
  describe('valid CURPs', () => {
    test('should accept CURP with valid format', () => {
      const result = validateCURP('BADD110313HDFRRN09')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.normalized).toBe('BADD110313HDFRRN09')
    })

    test('should normalize lowercase input', () => {
      const result = validateCURP('badd110313hdfrrn09')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('BADD110313HDFRRN09')
    })

    test('should normalize input with spaces', () => {
      const result = validateCURP('BADD110313 HDFRRN 09')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('BADD110313HDFRRN09')
    })

    test('should accept CURP with gender H (male)', () => {
      const result = validateCURP('BADD110313HDFRRN09')
      expect(result.isValid).toBe(true)
    })

    test('should accept CURP with gender M (female)', () => {
      const result = validateCURP('BADD110313MDFRRN09')
      expect(result.isValid).toBe(true)
    })

    test('should accept CURP with NE state code (foreign-born)', () => {
      const result = validateCURP('BADD110313HNERNN09')
      expect(result.isValid).toBe(true)
    })
  })

  describe('invalid CURPs - length', () => {
    test('should reject CURP with less than 18 characters', () => {
      const result = validateCURP('BADD110313HDFRRN0')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('18 caracteres')
      expect(result.error).toContain('17')
    })

    test('should reject CURP with more than 18 characters', () => {
      const result = validateCURP('BADD110313HDFRRN0901')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('18 caracteres')
    })

    test('should reject empty string', () => {
      const result = validateCURP('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('18 caracteres')
    })
  })

  describe('invalid CURPs - format', () => {
    test('should reject CURP with digits in letters section', () => {
      const result = validateCURP('B1DD110313HDFRRN00')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('formato del CURP es inválido')
    })

    test('should reject CURP with letters in digits section', () => {
      const result = validateCURP('BADD1X0313HDFRRN00')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('formato del CURP es inválido')
    })
  })

  describe('invalid CURPs - state code', () => {
    test('should reject CURP with invalid state code', () => {
      const result = validateCURP('BADD110313HZZRRN09')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Código de estado inválido')
      expect(result.error).toContain('ZZ')
    })
  })

  describe('invalid CURPs - gender', () => {
    test('should reject CURP with invalid gender code', () => {
      const result = validateCURP('BADD110313XDFRRN09')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Género inválido')
      expect(result.error).toContain('X')
      expect(result.error).toContain('H')
      expect(result.error).toContain('M')
    })
  })

  describe('invalid CURPs - date', () => {
    test('should reject CURP with invalid month (13)', () => {
      const result = validateCURP('BADD131313HDFRRN09')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Mes de nacimiento inválido')
      expect(result.error).toContain('13')
    })

    test('should reject CURP with invalid day (32)', () => {
      const result = validateCURP('BADD110332HDFRRN09')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Día de nacimiento inválido')
      expect(result.error).toContain('32')
    })

    test('should reject CURP with month 00', () => {
      const result = validateCURP('BADD110013HDFRRN09')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Mes de nacimiento inválido')
    })

    test('should reject CURP with day 00', () => {
      const result = validateCURP('BADD110300HDFRRN09')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Día de nacimiento inválido')
    })
  })
})

describe('RFC Validator', () => {
  describe('valid RFCs - Persona Física', () => {
    test('should accept valid RFC (13 characters)', () => {
      const result = validateRFC('BADD110313HDF')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.normalized).toBe('BADD110313HDF')
    })

    test('should normalize lowercase input', () => {
      const result = validateRFC('badd110313hdf')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('BADD110313HDF')
    })

    test('should normalize input with spaces', () => {
      const result = validateRFC('BADD 110313 HDF')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('BADD110313HDF')
    })
  })

  describe('valid RFCs - Persona Moral', () => {
    test('should accept valid RFC (12 characters)', () => {
      const result = validateRFC('ABC010101ABC')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.normalized).toBe('ABC010101ABC')
    })
  })

  describe('invalid RFCs - length', () => {
    test('should reject RFC with less than 12 characters', () => {
      const result = validateRFC('ABC010101AB')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('debe tener 12 caracteres')
      expect(result.error).toContain('persona moral')
    })

    test('should reject RFC with more than 13 characters', () => {
      const result = validateRFC('BADD110313HDFRR')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('debe tener 12 caracteres')
    })

    test('should reject empty string', () => {
      const result = validateRFC('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('debe tener 12 caracteres')
    })
  })

  describe('invalid RFCs - format', () => {
    test('should reject RFC with invalid pattern', () => {
      const result = validateRFC('123456789012')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('formato del RFC es inválido')
    })

    test('should reject RFC with special characters', () => {
      const result = validateRFC('BAD&110313HDF')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('formato del RFC es inválido')
    })
  })

  describe('invalid RFCs - date', () => {
    test('should reject RFC with invalid month', () => {
      const result = validateRFC('BADD131313HDF')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Mes inválido')
      expect(result.error).toContain('13')
    })

    test('should reject RFC with invalid day', () => {
      const result = validateRFC('BADD110332HDF')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Día inválido')
      expect(result.error).toContain('32')
    })
  })
})

describe('Cédula Profesional Validator', () => {
  describe('valid cédulas - pure number format', () => {
    test('should accept 6-digit cédula', () => {
      const result = validateCedulaProfesional('123456')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.normalized).toBe('123456')
    })

    test('should accept 7-digit cédula', () => {
      const result = validateCedulaProfesional('1234567')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test('should accept 8-digit cédula', () => {
      const result = validateCedulaProfesional('12345678')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('valid cédulas - state code format', () => {
    test('should accept cédula with state code', () => {
      const result = validateCedulaProfesional('DF-123456')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.normalized).toBe('DF-123456')
    })

    test('should normalize lowercase state code', () => {
      const result = validateCedulaProfesional('df-123456')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('DF-123456')
    })
  })

  describe('valid cédulas - letter + number format', () => {
    test('should accept cédula with letter prefix', () => {
      const result = validateCedulaProfesional('A123456')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test('should normalize lowercase letter', () => {
      const result = validateCedulaProfesional('a123456')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('A123456')
    })
  })

  describe('cédula normalization', () => {
    test('should trim whitespace', () => {
      const result = validateCedulaProfesional('  DF-123456  ')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('DF-123456')
    })
  })

  describe('invalid cédulas', () => {
    test('should reject empty string', () => {
      const result = validateCedulaProfesional('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('no puede estar vacía')
    })

    test('should reject invalid format', () => {
      const result = validateCedulaProfesional('ABC')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Formato de cédula profesional inválido')
    })

    test('should reject cédula with too many digits', () => {
      const result = validateCedulaProfesional('123456789')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Formato de cédula profesional inválido')
    })

    test('should reject cédula with too few digits', () => {
      const result = validateCedulaProfesional('12345')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Formato de cédula profesional inválido')
    })

    test('should reject cédula with special characters', () => {
      const result = validateCedulaProfesional('DF/123456')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Formato de cédula profesional inválido')
    })
  })
})

describe('NSS Validator', () => {
  describe('valid NSS', () => {
    test('should accept valid 11-digit NSS with correct check digit', () => {
      const result = validateNSS('12345678905')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test('should accept NSS with letter prefix', () => {
      const result = validateNSS('A1234567890')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('A1234567890')
    })

    test('should accept 10-digit NSS without check digit', () => {
      const result = validateNSS('1234567890')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('NSS normalization', () => {
    test('should remove spaces', () => {
      const result = validateNSS('1234 5678 905')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('12345678905')
    })

    test('should remove hyphens', () => {
      const result = validateNSS('1234-5678-905')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('12345678905')
    })

    test('should remove spaces and hyphens combination', () => {
      const result = validateNSS('1234-5678 905')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('12345678905')
    })

    test('should normalize lowercase letter prefix', () => {
      const result = validateNSS('a1234567890')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('A1234567890')
    })
  })

  describe('invalid NSS - length', () => {
    test('should reject NSS with less than 10 digits', () => {
      const result = validateNSS('123456789')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('debe tener 11 dígitos')
    })

    test('should reject NSS with more than 12 characters', () => {
      const result = validateNSS('A123456789012')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('debe tener 11 dígitos')
    })

    test('should reject empty string', () => {
      const result = validateNSS('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('debe tener 11 dígitos')
    })
  })

  describe('invalid NSS - format', () => {
    test('should reject NSS with invalid characters', () => {
      const result = validateNSS('12345-6789A5')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('formato del NSS es inválido')
    })

    test('should reject NSS with multiple letters', () => {
      const result = validateNSS('AB123456789')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('formato del NSS es inválido')
    })
  })

  describe('invalid NSS - check digit', () => {
    test('should reject NSS with incorrect check digit', () => {
      const result = validateNSS('12345678909') // Should be 5, not 9
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Dígito verificador del NSS inválido')
      expect(result.error).toContain('Se esperaba')
      expect(result.error).toContain('5')
    })
  })
})

describe('Phone Number Validator', () => {
  describe('valid phone numbers - international format', () => {
    test('should accept +52 Mexico City number', () => {
      const result = validatePhoneNumber('+52 55 1234 5678')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.normalized).toBe('+52 (55) 1234-5678')
    })

    test('should accept +52 without spaces', () => {
      const result = validatePhoneNumber('+525512345678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('+52 (55) 1234-5678')
    })

    test('should accept +52 with parentheses and hyphen', () => {
      const result = validatePhoneNumber('+52 (55) 1234-5678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('+52 (55) 1234-5678')
    })

    test('should accept +52 Guadalajara number', () => {
      const result = validatePhoneNumber('+52 33 1234 5678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('+52 (33) 1234-5678')
    })

    test('should accept +52 Monterrey number', () => {
      const result = validatePhoneNumber('+52 81 1234 5678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('+52 (81) 1234-5678')
    })
  })

  describe('valid phone numbers - national format', () => {
    test('should accept (XXX) XXX-XXXX format', () => {
      const result = validatePhoneNumber('(55) 1234-5678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('(55) 1234-5678')
    })

    test('should accept XXX XXXX XXXX format', () => {
      const result = validatePhoneNumber('55 1234 5678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('(55) 1234-5678')
    })

    test('should accept 10-digit number', () => {
      const result = validatePhoneNumber('5512345678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('(55) 1234-5678')
    })

    test('should accept Guadalajara number', () => {
      const result = validatePhoneNumber('3312345678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('(33) 1234-5678')
    })

    test('should accept Monterrey number', () => {
      const result = validatePhoneNumber('8112345678')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('(81) 1234-5678')
    })
  })

  describe('phone number normalization', () => {
    test('should format 10-digit number correctly', () => {
      const result = validatePhoneNumber('5512345678')
      expect(result.normalized).toBe('(55) 1234-5678')
    })

    test('should format international number correctly', () => {
      const result = validatePhoneNumber('+525512345678')
      expect(result.normalized).toBe('+52 (55) 1234-5678')
    })

    test('should handle various input formats', () => {
      const formats = [
        '55-1234-5678',
        '55.1234.5678',
        '(55)12345678',
        '55 1234 5678',
      ]

      formats.forEach((format) => {
        const result = validatePhoneNumber(format)
        expect(result.isValid).toBe(true)
        expect(result.normalized).toBe('(55) 1234-5678')
      })
    })

    test('should handle leading/trailing whitespace', () => {
      const result = validatePhoneNumber('  5512345678  ')
      expect(result.isValid).toBe(true)
      expect(result.normalized).toBe('(55) 1234-5678')
    })
  })

  describe('invalid phone numbers - length', () => {
    test('should reject phone number with less than 10 digits', () => {
      const result = validatePhoneNumber('551234567')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('10 dígitos')
      expect(result.error).toContain('9 dígitos')
    })

    test('should reject phone number with more than 12 digits', () => {
      const result = validatePhoneNumber('+5215512345678')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('10 dígitos')
    })

    test('should reject empty string', () => {
      const result = validatePhoneNumber('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('no puede estar vacío')
    })
  })

  describe('invalid phone numbers - area code', () => {
    test('should reject invalid area code starting with 0', () => {
      const result = validatePhoneNumber('0112345678')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Código de área inválido')
    })

    test('should reject invalid area code starting with 1', () => {
      const result = validatePhoneNumber('1012345678')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Código de área inválido')
    })
  })

  describe('phone number edge cases', () => {
    test('should accept all major Mexican area codes', () => {
      const majorAreaCodes = ['55', '33', '81'] // CDMX, Guadalajara, Monterrey

      majorAreaCodes.forEach((areaCode) => {
        const result = validatePhoneNumber(`${areaCode}12345678`)
        expect(result.isValid).toBe(true)
      })
    })
  })
})

describe('validateMexicanIdentifiers', () => {
  test('should validate multiple identifiers at once', () => {
    const result = validateMexicanIdentifiers({
      curp: 'BADD110313HDFRRN09',
      rfc: 'BADD110313HDF',
      phoneNumber: '+52 55 1234 5678',
    })

    expect(result.curp?.isValid).toBe(true)
    expect(result.rfc?.isValid).toBe(true)
    expect(result.phoneNumber?.isValid).toBe(true)
  })

  test('should handle partial identifier sets', () => {
    const result = validateMexicanIdentifiers({
      phoneNumber: '+52 55 1234 5678',
    })

    expect(result.phoneNumber?.isValid).toBe(true)
    expect(result.curp).toBeUndefined()
    expect(result.rfc).toBeUndefined()
  })

  test('should return validation results for all provided identifiers', () => {
    const result = validateMexicanIdentifiers({
      curp: 'INVALID',
      rfc: 'ABC010101ABC',
      phoneNumber: '5512345678',
    })

    expect(result.curp?.isValid).toBe(false)
    expect(result.rfc?.isValid).toBe(true)
    expect(result.phoneNumber?.isValid).toBe(true)
  })

  test('should handle empty input', () => {
    const result = validateMexicanIdentifiers({})

    expect(result.curp).toBeUndefined()
    expect(result.rfc).toBeUndefined()
    expect(result.cedulaProfesional).toBeUndefined()
    expect(result.nss).toBeUndefined()
    expect(result.phoneNumber).toBeUndefined()
  })
})

describe('Validation Result Type', () => {
  test('should return correct type for valid results', () => {
    const result: ValidationResult = validateCURP('BADD110313HDFRRN09')

    expect(result.isValid).toBe(true)
    expect(result.normalized).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  test('should return correct type for invalid results', () => {
    const result: ValidationResult = validateCURP('INVALID')

    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.normalized).toBeUndefined()
  })
})

describe('Pure Function Tests', () => {
  test('validateCURP should be pure (no side effects)', () => {
    const input = 'BADD110313HDFRRN09'
    const result1 = validateCURP(input)
    const result2 = validateCURP(input)

    expect(result1).toEqual(result2)
  })

  test('validateRFC should be pure (no side effects)', () => {
    const input = 'ABC010101ABC'
    const result1 = validateRFC(input)
    const result2 = validateRFC(input)

    expect(result1).toEqual(result2)
  })

  test('validateCedulaProfesional should be pure (no side effects)', () => {
    const input = '1234567'
    const result1 = validateCedulaProfesional(input)
    const result2 = validateCedulaProfesional(input)

    expect(result1).toEqual(result2)
  })

  test('validateNSS should be pure (no side effects)', () => {
    const input = '12345678905'
    const result1 = validateNSS(input)
    const result2 = validateNSS(input)

    expect(result1).toEqual(result2)
  })

  test('validatePhoneNumber should be pure (no side effects)', () => {
    const input = '5512345678'
    const result1 = validatePhoneNumber(input)
    const result2 = validatePhoneNumber(input)

    expect(result1).toEqual(result2)
  })
})

describe('Error Message Quality', () => {
  test('CURP error messages should be in Spanish', () => {
    const result = validateCURP('INVALID')

    expect(result.error).toBeDefined()
    expect(result.error?.toLowerCase()).not.toMatch(/invalid|must|required/)
  })

  test('RFC error messages should be in Spanish', () => {
    const result = validateRFC('INVALID')

    expect(result.error).toBeDefined()
    expect(result.error?.toLowerCase()).not.toMatch(/invalid|must|required/)
  })

  test('NSS error messages should be detailed', () => {
    const result = validateNSS('12345678909')

    expect(result.error).toContain('Dígito verificador')
    expect(result.error).toContain('Se esperaba')
    expect(result.error).toContain('se recibió')
  })

  test('Phone error messages should include current state', () => {
    const result = validatePhoneNumber('551234567')

    expect(result.error).toContain('9 dígitos')
  })
})

