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
import { requireAuth, AuthError } from '@/lib/auth'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-logger'

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
    // 1. Require authentication
    const { user } = await requireAuth()

    // 2. Rate limiting - 10 PDF exports per minute per user
    const ipAddress = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const rateLimitId = getRateLimitIdentifier(user.id, ipAddress)
    const rateLimitResult = await checkRateLimit(
      rateLimitId,
      { requests: 10, window: 60 },
      'pdf:export'
    )

    if (!rateLimitResult.success) {
      await logSecurityEvent({
        eventType: 'rate_limit_exceeded',
        severity: 'medium',
        userId: user.id,
        description: 'PDF export rate limit exceeded',
        ipAddress,
        details: { remaining: rateLimitResult.remaining, resetIn: rateLimitResult.resetInSeconds }
      })
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      )
    }

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

    // Collect PDF data
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      doc.on('error', reject)
    })

    doc.end()

    // 3. Log audit event for successful PDF export
    await logSecurityEvent({
      eventType: 'data_export',
      severity: 'low',
      userId: user.id,
      description: 'PDF export completed successfully',
      ipAddress,
      details: { title: data.title, contentItems: data.content.length }
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.title}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError || (error instanceof Error && error.name === 'AuthError')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.error('PDF generation error', { error: error instanceof Error ? error.message : String(error) })

    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

// GET method for simple test export
export async function GET(request: NextRequest) {
  try {
    // Require authentication for GET as well
    await requireAuth()
    
    return NextResponse.json({
      success: true,
      message: 'PDF Export API is available. Use POST to generate PDFs.',
      endpoint: '/api/export/pdf',
    })
  } catch (error) {
    if (error instanceof AuthError || (error instanceof Error && error.name === 'AuthError')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    throw error
  }
}
