'use client'

import { useState, useRef, useCallback } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/Toast'
import { Loader2, Camera, X } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  currentPhotoUrl?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onUploadComplete?: (url: string) => void
  bucket?: string
  folder?: string
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
}

const buttonSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
}

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
}

export function AvatarUpload({
  userId,
  currentPhotoUrl,
  name,
  size = 'md',
  onUploadComplete,
  bucket = 'avatars',
  folder = 'users',
}: AvatarUploadProps) {
  const { addToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Por favor selecciona una imagen válida', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('La imagen debe ser menor a 5MB', 'error')
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Upload to API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('bucket', bucket)
      formData.append('folder', folder)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al subir la imagen')
      }

      const { url } = await response.json()
      
      // Update preview with the permanent URL
      setPreviewUrl(url)
      onUploadComplete?.(url)
      
      addToast('Foto de perfil actualizada', 'success')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      // Revert to original on error
      setPreviewUrl(currentPhotoUrl || null)
      addToast(error instanceof Error ? error.message : 'Error al subir la imagen', 'error')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [userId, bucket, folder, currentPhotoUrl, onUploadComplete, addToast])

  const handleRemove = useCallback(async () => {
    if (!previewUrl) return

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bucket, folder }),
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen')
      }

      setPreviewUrl(null)
      onUploadComplete?.('')
      addToast('Foto de perfil eliminada', 'success')
    } catch (error) {
      console.error('Error removing avatar:', error)
      addToast('Error al eliminar la imagen', 'error')
    }
  }, [userId, bucket, folder, previewUrl, onUploadComplete, addToast])

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} ring-4 ring-white shadow-lg`}>
          <AvatarImage 
            src={previewUrl || undefined} 
            alt={name || 'Avatar'}
            className="object-cover"
          />
          <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            {name ? getInitials(name) : 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Upload button overlay */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={`absolute bottom-0 right-0 ${buttonSizeClasses[size]} rounded-full shadow-md hover:shadow-lg transition-shadow`}
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
          ) : (
            <Camera className={iconSizeClasses[size]} />
          )}
        </Button>

        {/* Remove button (only show if there's a photo) */}
        {previewUrl && !isUploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className={`absolute top-0 right-0 ${buttonSizeClasses[size]} rounded-full shadow-md opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity group-hover:opacity-100`}
            onClick={handleRemove}
          >
            <X className={iconSizeClasses[size]} />
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center max-w-[150px]">
        {isUploading ? 'Subiendo...' : 'Haz clic para cambiar tu foto'}
      </p>
    </div>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default AvatarUpload
