'use client'

import { useState, useRef, useCallback } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/Toast'
import { Loader2, Camera, X } from 'lucide-react'
import { logger } from '@/lib/observability/logger'
import { apiRequest, APIError } from '@/lib/api'

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

      const response = await apiRequest<{ url: string }>('/api/upload/avatar', {
        method: 'POST',
        body: formData as unknown as Record<string, unknown>,
      })

      const { url } = response.data
      
      // Update preview with the permanent URL
      setPreviewUrl(url)
      onUploadComplete?.(url)
      
      addToast('Foto de perfil actualizada', 'success')
    } catch (error) {
      const apiError = error as APIError
      
      if (apiError.code === 'TIMEOUT') {
        addToast('La solicitud tardó demasiado. Por favor, intenta de nuevo.', 'error')
      } else if (apiError.code === 'NETWORK_ERROR') {
        addToast('Error de conexión. Verifica tu internet.', 'error')
      }
      
      logger.error('Error uploading avatar', { error: apiError.message })
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
      await apiRequest('/api/upload/avatar', {
        method: 'DELETE',
        body: { userId, bucket, folder },
      })

      setPreviewUrl(null)
      onUploadComplete?.('')
      addToast('Foto de perfil eliminada', 'success')
    } catch (error) {
      const apiError = error as APIError
      
      if (apiError.code === 'TIMEOUT') {
        addToast('La solicitud tardó demasiado. Por favor, intenta de nuevo.', 'error')
      } else if (apiError.code === 'NETWORK_ERROR') {
        addToast('Error de conexión. Verifica tu internet.', 'error')
      }
      
      logger.error('Error removing avatar', { error: apiError.message })
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
            alt={name ?? 'Avatar'}
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
          aria-label={isUploading ? "Subiendo foto de perfil..." : "Cambiar foto de perfil"}
        >
          {isUploading ? (
            <Loader2 className={`${iconSizeClasses[size]} animate-spin`} aria-hidden="true" />
          ) : (
            <Camera className={iconSizeClasses[size]} aria-hidden="true" />
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
            aria-label="Eliminar foto de perfil"
          >
            <X className={iconSizeClasses[size]} aria-hidden="true" />
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
        aria-label="Seleccionar archivo de imagen"
      />

      {/* Helper text */}
      <p className="text-xs text-gray-500 text-center max-w-[150px]">
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
