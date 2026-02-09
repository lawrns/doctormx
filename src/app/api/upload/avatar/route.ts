import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { validateFile, createValidationErrorResponse } from '@/lib/file-security'

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user } = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const bucket = (formData.get('bucket') as string) || 'avatars'
    const folder = (formData.get('folder') as string) || 'users'

    // Validate user can only upload their own avatar
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Can only upload your own avatar' },
        { status: 403 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Use enhanced file validation
    const fileValidation = await validateFile(file, {
      maxSize: MAX_SIZE,
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      validateMagicNumbers: true
    })

    if (!fileValidation.isValid) {
      return createValidationErrorResponse(fileValidation)
    }

    const supabase = createServiceClient()

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucket)
    
    if (!bucketExists) {
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      })
      
      if (createError) {
        console.error('Error creating bucket:', createError)
        return NextResponse.json(
          { error: 'Failed to create storage bucket' },
          { status: 500 }
        )
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder}/${userId}/${Date.now()}.${fileExt}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Delete old avatar if exists
    const { data: oldProfile } = await supabase
      .from('profiles')
      .select('photo_url')
      .eq('id', userId)
      .single()

    if (oldProfile?.photo_url) {
      // Extract path from URL
      const oldUrl = new URL(oldProfile.photo_url)
      const pathMatch = oldUrl.pathname.match(/\/avatars\/(.*)/)
      if (pathMatch) {
        await supabase.storage.from(bucket).remove([pathMatch[1]])
      }
    }

    // Upload new file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    // Update profile with new photo URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        photo_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Don't fail the upload, just log the error
    }

    return NextResponse.json({ 
      url: publicUrl,
      message: 'Avatar uploaded successfully' 
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { user } = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, bucket = 'avatars' } = body

    // Validate user can only delete their own avatar
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Can only delete your own avatar' },
        { status: 403 }
      )
    }

    const supabase = createServiceClient()

    // Get current photo URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('photo_url')
      .eq('id', userId)
      .single()

    if (profile?.photo_url) {
      // Extract path from URL and delete file
      const url = new URL(profile.photo_url)
      const pathMatch = url.pathname.match(/\/avatars\/(.*)/)
      
      if (pathMatch) {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([pathMatch[1]])

        if (deleteError) {
          console.error('Error deleting file:', deleteError)
        }
      }
    }

    // Update profile to remove photo_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        photo_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Avatar removed successfully' 
    })

  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
