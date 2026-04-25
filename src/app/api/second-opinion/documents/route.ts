// Second Opinion API - Document Upload (top-level endpoint)
// POST: Upload document (PDF, image, DICOM) to Supabase Storage
// Links to a second opinion request, returns file URL

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSecondOpinionRequest,
  type SecondOpinionDocumentType,
} from '@/lib/domains/second-opinion'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dicom',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestId = formData.get('request_id') as string | null
    const documentType = (formData.get('type') || 'other') as SecondOpinionDocumentType

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Use PDF, JPEG, PNG, WebP, or DICOM' },
        { status: 400 }
      )
    }

    const current = await getSecondOpinionRequest(requestId)
    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (current.patient_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!['draft', 'submitted'].includes(current.status)) {
      return NextResponse.json(
        { error: 'Cannot upload documents after review has started' },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${requestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `second-opinions/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('medical-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[SecondOpinion] Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(filePath)

    const { data: document, error: insertError } = await supabase
      .from('second_opinion_documents')
      .insert({
        request_id: requestId,
        type: documentType,
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      await supabase.storage.from('medical-documents').remove([filePath])
      throw insertError
    }

    return NextResponse.json({
      document,
      file_url: publicUrlData?.publicUrl || null,
    }, { status: 201 })
  } catch (error) {
    console.error('[SecondOpinion] Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
