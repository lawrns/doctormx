import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'

interface ValidationResult {
  isValid: boolean
  error?: string
}

interface FileValidationOptions {
  maxSize?: number
  allowedExtensions?: string[]
  validateMagicNumbers?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const MAGIC_NUMBERS = {
  jpeg: new Uint8Array([0xFF, 0xD8, 0xFF]),
  png: new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
}

export async function validateFile(file: File, options: FileValidationOptions = {}): Promise<ValidationResult> {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedExtensions = ALLOWED_EXTENSIONS,
    validateMagicNumbers = true
  } = options

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024)
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
    }
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(fileExtension)) {
    const allowedExtensionsStr = allowedExtensions.join(', ')
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Extensiones válidas: ${allowedExtensionsStr}`
    }
  }

  // Check magic numbers if requested
  if (validateMagicNumbers) {
    const validationResult = await validateMagicNumbersFromFile(file)
    if (!validationResult.isValid) {
      return validationResult
    }
  }

  return { isValid: true }
}

export async function validateMagicNumbersFromFile(file: File): Promise<ValidationResult> {
  try {
    const arrayBuffer = await file.slice(0, 16).arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Check for JPEG
    if (bytes.length >= 3 && bytes[0] === MAGIC_NUMBERS.jpeg[0] &&
        bytes[1] === MAGIC_NUMBERS.jpeg[1] && bytes[2] === MAGIC_NUMBERS.jpeg[2]) {
      return { isValid: true }
    }

    // Check for PNG
    if (bytes.length >= 4 && bytes[0] === MAGIC_NUMBERS.png[0] &&
        bytes[1] === MAGIC_NUMBERS.png[1] && bytes[2] === MAGIC_NUMBERS.png[2] &&
        bytes[3] === MAGIC_NUMBERS.png[3]) {
      return { isValid: true }
    }

    return {
      isValid: false,
      error: 'El archivo no contiene el formato de imagen esperado (JPEG o PNG)'
    }
  } catch (error) {
    logger.error('Error validating file signature', { error: (error as Error).message }, error as Error)
    return {
      isValid: false,
      error: 'Error al validar el archivo'
    }
  }
}

export function createValidationErrorResponse(validationResult: ValidationResult): NextResponse {
  return NextResponse.json(
    { error: validationResult.error },
    { status: 400 }
  )
}

