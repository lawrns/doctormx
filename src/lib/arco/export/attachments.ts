/**
 * ARCO Data Export - Attachments
 *
 * Handles creation of data export attachments for ARCO requests
 */

import { createClient } from '@/lib/supabase/server'
import type { DataTableScope } from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'
import { exportUserDataToJson } from './json'
import { exportUserDataToText } from './text'
import { exportUserDataToPdf } from './pdf'
import { logger } from '@/lib/observability/logger'

/**
 * Export format type
 */
export type ExportFormat = 'json' | 'text' | 'pdf'

/**
 * Attachment result type
 */
export interface AttachmentResult {
  filename: string
  content: string | Buffer
  mime_type: string
}

/**
 * Get data scope from ARCO request
 *
 * @param requestId - ARCO request ID
 * @returns Data scope array
 * @throws ArcoError if request not found
 */
async function getRequestDataScope(requestId: string): Promise<DataTableScope[]> {
  const supabase = await createClient()

  const { data: request } = await supabase
    .from('arco_requests')
    .select('data_scope')
    .eq('id', requestId)
    .single()

  if (!request) {
    throw new ArcoError('Request not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  return request.data_scope as DataTableScope[]
}

/**
 * Generate filename for export
 *
 * @param userId - User ID
 * @param format - Export format
 * @returns Generated filename
 */
function generateFilename(userId: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const extension = format === 'pdf' ? 'pdf' : format === 'text' ? 'txt' : 'json'
  return `datos_arco_${userId}_${timestamp}.${extension}`
}

/**
 * Get MIME type for export format
 *
 * @param format - Export format
 * @returns MIME type string
 */
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'text':
      return 'text/plain'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Create JSON attachment
 *
 * @param userId - User ID
 * @param scope - Data scope
 * @returns Attachment result
 */
async function createJsonAttachment(
  userId: string,
  scope: DataTableScope[]
): Promise<AttachmentResult> {
  const content = await exportUserDataToJson(userId, scope)

  return {
    filename: generateFilename(userId, 'json'),
    content,
    mime_type: getMimeType('json'),
  }
}

/**
 * Create text attachment
 *
 * @param userId - User ID
 * @param scope - Data scope
 * @returns Attachment result
 */
async function createTextAttachment(
  userId: string,
  scope: DataTableScope[]
): Promise<AttachmentResult> {
  const content = await exportUserDataToText(userId, scope)

  return {
    filename: generateFilename(userId, 'text'),
    content,
    mime_type: getMimeType('text'),
  }
}

/**
 * Create PDF attachment
 *
 * @param userId - User ID
 * @param scope - Data scope
 * @returns Attachment result
 */
async function createPdfAttachment(
  userId: string,
  scope: DataTableScope[]
): Promise<AttachmentResult> {
  const content = await exportUserDataToPdf(userId, scope)

  return {
    filename: generateFilename(userId, 'pdf'),
    content,
    mime_type: getMimeType('pdf'),
  }
}

/**
 * Create data export attachment
 *
 * Generates a single attachment in the specified format
 *
 * @param userId - User ID
 * @param scope - Data scope
 * @param format - Export format
 * @returns Attachment result
 */
export async function createDataExportAttachment(
  userId: string,
  scope: DataTableScope[],
  format: ExportFormat = 'json'
): Promise<AttachmentResult> {
  switch (format) {
    case 'json':
      return createJsonAttachment(userId, scope)
    case 'text':
      return createTextAttachment(userId, scope)
    case 'pdf':
      return createPdfAttachment(userId, scope)
    default:
      return createJsonAttachment(userId, scope)
  }
}

/**
 * Create multi-format attachments
 *
 * Generates all three format attachments for an ARCO request
 *
 * @param userId - User ID
 * @param scope - Data scope
 * @returns Array of attachment results
 */
export async function createMultiFormatAttachments(
  userId: string,
  scope: DataTableScope[]
): Promise<AttachmentResult[]> {
  const results: AttachmentResult[] = []

  try {
    const [json, text, pdf] = await Promise.allSettled([
      createJsonAttachment(userId, scope),
      createTextAttachment(userId, scope),
      createPdfAttachment(userId, scope),
    ])

    if (json.status === 'fulfilled') {
      results.push(json.value)
    } else {
      logger.error('[attachments] Failed to create JSON attachment', json.reason)
    }

    if (text.status === 'fulfilled') {
      results.push(text.value)
    } else {
      logger.error('[attachments] Failed to create text attachment', text.reason)
    }

    if (pdf.status === 'fulfilled') {
      results.push(pdf.value)
    } else {
      logger.error('[attachments] Failed to create PDF attachment', pdf.reason)
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[attachments] Error creating attachments', {
      error: err.message,
      stack: err.stack,
    })
    throw new ArcoError(
      'Failed to create export attachments',
      ArcoErrorCode.INVALID_DATA_SCOPE,
      500
    )
  }

  return results
}

/**
 * Create attachment from ARCO request ID
 *
 * Helper function to get data scope from request and create attachment
 *
 * @param requestId - ARCO request ID
 * @param format - Export format
 * @returns Attachment result
 */
export async function createAttachmentFromRequest(
  requestId: string,
  format: ExportFormat = 'json'
): Promise<AttachmentResult> {
  const scope = await getRequestDataScope(requestId)

  // Extract user ID from first scope item or request
  const { data: request } = await (await createClient())
    .from('arco_requests')
    .select('user_id')
    .eq('id', requestId)
    .single()

  if (!request) {
    throw new ArcoError('Request not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  return createDataExportAttachment(request.user_id, scope, format)
}
