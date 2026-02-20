// Second Opinion API - Document Upload
// POST: Upload document to request
// GET: List documents for request

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { 
  getSecondOpinionRequest, 
  getSecondOpinionDocuments,
  type SecondOpinionDocumentType 
} from '@/lib/domains/second-opinion'

interface RouteParams {
  params: Promise<{ id: string }>
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dicom',
]

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get current request
    const current = await getSecondOpinionRequest(id)
    
    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    // Only patient can upload, only in draft/submitted status
    if (current.patient_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (!['draft', 'submitted'].includes(current.status)) {
      return NextResponse.json(
        { error: 'Cannot upload documents after review has started' },
        { status: 400 }
      )
    }
    
    // Parse multipart form
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const documentType = formData.get('type') as SecondOpinionDocumentType | null
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Use PDF, JPEG, PNG, or DICOM' },
        { status: 400 }
      )
    }
    
    // Generate file path
    const fileExt = file.name.split('.').pop() ?? 'bin'
    const fileName = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `second-opinions/${fileName}`
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('medical-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })
    
    if (uploadError) {
      logger.error('[SecondOpinion] Upload error:', { err: uploadError })
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }
    
    // Create document record
    const { data: document, error: insertError } = await supabase
      .from('second_opinion_documents')
      .insert({
        request_id: id,
        type: documentType ?? 'other',
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single()
    
    if (insertError) {
      // Try to clean up uploaded file
      await supabase.storage.from('medical-documents').remove([filePath])
      throw insertError
    }
    
    return NextResponse.json(document, { status: 201 })
    
  } catch (error) {
    logger.error('[SecondOpinion] Document upload error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get current request to check access
    const current = await getSecondOpinionRequest(id)
    
    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    // Check ownership
    if (current.patient_id !== user.id && current.assigned_doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get documents
    const documents = await getSecondOpinionDocuments(id)
    
    return NextResponse.json({ documents })
    
  } catch (error) {
    logger.error('[SecondOpinion] List documents error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    )
  }
}
