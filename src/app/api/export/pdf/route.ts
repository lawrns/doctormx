/**
 * PDF Export API Route
 *
 * Server-side PDF generation using pdfkit.
 * This route handles PDF generation in a server context where
 * Node.js modules (fs, crypto, zlib) are available.
 *
 * POST /api/export/pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/observability/logger'

// Validation schema for PDF export requests
const exportSchema = z.object({
  title: z.string().min(1).max(200),
  fontSize: z.number().min(8).max(24).default(12),
  content: z.array(z.object({
    type: z.enum(['heading', 'paragraph', 'bullet']),
    text: z.string().min(1),
    fontSize: z.number().min(8).max(24).optional(),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = exportSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Import pdfkit only in this server context where Node.js modules are available
    const PDFDocument = (await import('pdfkit')).default
    const fs = (await import('fs')).default
    const path = (await import('path')).default

    // Create PDF
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    })

    // Pipe output to response
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks)

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${data.title}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
    })

    // Build PDF content
    doc.fontSize(data.fontSize || 12)

    data.content.forEach((item) => {
      if (item.type === 'heading') {
        doc.fontSize((data.fontSize || 12) + 4)
          doc.text(item.text, { underline: true })
          doc.fontSize(data.fontSize || 12)
          doc.moveDown(10)
      } else if (item.type === 'paragraph') {
        doc.text(item.text, { width: 500, align: 'left' })
        doc.moveDown(14)
      } else if (item.type === 'bullet') {
        doc.text('• ' + item.text, { indent: 10 })
        doc.moveDown(14)
      }
    })

    doc.end()

    // Wait for PDF to complete (handled by data/end events)
  } catch (error) {
    logger.error('PDF generation error', { error: error instanceof Error ? error.message : String(error) })

    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

// GET method for simple test export
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'PDF Export API is available. Use POST to generate PDFs.',
    endpoint: '/api/export/pdf',
  })
}
