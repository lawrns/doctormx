/**
 * ARCO Data Export - PDF
 *
 * Handles PDF generation for ARCO data export requests
 * Uses dynamic import for pdfkit (Node.js only module)
 */

import type { DataTableScope } from '@/types/arco'
import { logger } from '@/lib/observability/logger'

/**
 * PDF export configuration
 */
interface PdfConfig {
  /** Page margin in points */
  margin?: number
  /** Font size */
  fontSize?: number
  /** Line height multiplier */
  lineHeight?: number
  /** Whether to include headers */
  includeHeaders?: boolean
}

/**
 * PDF export result
 */
interface PdfResult {
  /** PDF as Buffer */
  buffer: Buffer
  /** Number of pages */
  pageCount: number
  /** File size in bytes */
  sizeBytes: number
}

/**
 * Initialize PDFKit modules (server-side only)
 *
 * Uses dynamic import to avoid client-side bundling issues
 */
async function initPdfModules() {
  if (typeof window !== 'undefined') {
    throw new Error('PDF generation is server-side only')
  }

  try {
    const pdfkitModule = await import('pdfkit')
    return {
      PDFDocument: pdfkitModule.default || pdfkitModule,
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[pdf] Failed to load PDFKit', {
      error: err.message,
      stack: err.stack,
    })
    throw new Error(
      'PDF generation unavailable. Please ensure pdfkit is installed for server-side use.'
    )
  }
}

/**
 * Generate filename for PDF export
 */
function generatePdfFilename(userId: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `datos_arco_${userId}_${timestamp}.pdf`
}

/**
 * Create PDF document with user data
 */
async function createPdfDocument(
  title: string,
  content: string,
  config: PdfConfig = {}
): Promise<PdfResult> {
  const { PDFDocument } = await initPdfModules()

  const {
    margin = 50,
    fontSize = 10,
    lineHeight = 1.5,
    includeHeaders = true,
  } = config

  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []
      let pageCount = 0

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: margin,
          bottom: margin,
          left: margin,
          right: margin,
        },
        bufferPages: true,
      })

      // Track page additions
      doc.on('pageAdded', () => {
        pageCount++
      })

      // Collect PDF data chunks
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve({
          buffer,
          pageCount: pageCount || 1,
          sizeBytes: buffer.length,
        })
      })

      doc.on('error', (error: Error) => {
        reject(error)
      })

      // Add title if headers enabled
      if (includeHeaders) {
        doc.fontSize(fontSize + 4)
          .font('Helvetica-Bold')
          .text(title, { align: 'center' })
          .moveDown(lineHeight)
          .fontSize(fontSize)
          .font('Helvetica')
      }

      // Add content with line wrapping
      doc
        .fontSize(fontSize)
        .font('Helvetica')
        .text(content, {
          align: 'left',
          lineGap: fontSize * (lineHeight - 1),
        })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Format data scope as text for PDF
 */
function formatScopeAsText(scope: DataTableScope[]): string {
  const lines: string[] = []

  for (const tableName of scope) {
    lines.push(`=== ${tableName.toUpperCase()} ===`)
    lines.push('') // Empty line between sections
  }

  return lines.join('\n')
}

/**
 * Export user data to PDF
 *
 * @param userId - User ID
 * @param scope - Data scope array
 * @param config - PDF configuration
 * @returns PDF export result
 */
export async function exportUserDataToPdf(
  userId: string,
  scope: DataTableScope[],
  config: PdfConfig = {}
): Promise<Buffer> {
  try {
    const title = `Exportación de Datos ARCO - ${new Date().toLocaleDateString('es-MX')}`
    const content = formatScopeAsText(scope)

    const result = await createPdfDocument(title, content, config)

    logger.info('[pdf] PDF generated successfully', {
      userId,
      pageCount: result.pageCount,
      sizeBytes: result.sizeBytes,
    })

    return result.buffer
  } catch (error) {
    logger.error('[pdf] Failed to generate PDF', { userId, error })
    throw error
  }
}

/**
 * Export single table to PDF
 *
 * @param userId - User ID
 * @param tableName - Table name
 * @param data - Table data
 * @returns PDF buffer
 */
export async function exportTableToPdf(
  userId: string,
  tableName: string,
  data: Record<string, unknown>[]
): Promise<Buffer> {
  try {
    const title = `${tableName} - ${new Date().toLocaleDateString('es-MX')}`
    const content = JSON.stringify(data, null, 2)

    const result = await createPdfDocument(title, content)

    logger.info('[pdf] Table PDF generated', {
      userId,
      tableName,
      pageCount: result.pageCount,
    })

    return result.buffer
  } catch (error) {
    logger.error('[pdf] Failed to generate table PDF', { userId, tableName, error })
    throw error
  }
}

/**
 * Get PDF export metadata without generating file
 *
 * @param userId - User ID
 * @param scope - Data scope
 * @returns Estimated size and page count
 */
export async function estimatePdfSize(
  userId: string,
  scope: DataTableScope[]
): Promise<{ estimatedSizeBytes: number; estimatedPages: number }> {
  // Rough estimation: 1 page ≈ 3000 characters, 1 KB ≈ 1000 characters
  const totalChars = formatScopeAsText(scope).length
  const estimatedPages = Math.max(1, Math.ceil(totalChars / 3000))
  const estimatedSizeBytes = totalChars * 1.5 // PDF is typically ~1.5x text size

  return {
    estimatedSizeBytes,
    estimatedPages,
  }
}

/**
 * Validate PDF buffer
 *
 * @param buffer - PDF buffer to validate
 * @returns True if valid PDF
 */
export function isValidPdfBuffer(buffer: Buffer): boolean {
  // PDF files start with %PDF-
  const header = buffer.slice(0, 5).toString('ascii')
  if (header !== '%PDF-') {
    return false
  }

  // PDF files end with %%EOF
  const footer = buffer.slice(-5).toString('ascii')
  return footer.includes('%%EOF')
}

/**
 * PDF generation options
 */
export type PdfExportOptions = PdfConfig & {
  /** Whether to compress output */
  compress?: boolean
  /** PDF metadata */
  metadata?: {
    title?: string
    author?: string
    subject?: string
    keywords?: string
  }
}
