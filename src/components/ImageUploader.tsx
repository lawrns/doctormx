'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { LoadingButton } from './LoadingButton'
import { Select } from './Select'
import { Textarea } from './Input'
import { Modal } from './Modal'

export interface ImageUploaderProps {
  onUploadComplete?: (data: UploadResult & { analysisId: string; urgency: string; confidence: number }) => void
  onError?: (error: string) => void
  maxFileSizeMB?: number
  requirePremium?: boolean
}

export interface UploadResult {
  url: string
  fileName: string
  fileType: string
  fileSize: number
  analysisId?: string
  urgency?: string
  confidence?: number
}

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error' | 'locked'

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/dicom', 'application/dicom']
const IMAGE_TYPE_OPTIONS = [
  { value: 'skin', label: 'Piel (rash, eczema, lesión)' },
  { value: 'xray', label: 'Rayos X (fractura, pecho)' },
  { value: 'lab_result', label: 'Resultado de laboratorio' },
  { value: 'wound', label: 'Herida o lesión' },
  { value: 'eye', label: 'Ojo (conjuntivitis, lesión)' },
  { value: 'other', label: 'Otro tipo de imagen' }
]

export function ImageUploader({
  onUploadComplete,
  onError,
  maxFileSizeMB = 10,
  requirePremium = true
}: ImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageType, setImageType] = useState<string>('')
  const [patientNotes, setPatientNotes] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [usage, setUsage] = useState({ used: 0, limit: 0 })
  const [loadingUsage, setLoadingUsage] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (requirePremium) {
      const checkAccess = async () => {
        try {
          const response = await fetch('/api/premium/status?feature=image_analysis')
          if (response.ok) {
          const data = await response.json()
          setUsage({ used: data.used, limit: data.limit })
          if (!data.hasAccess && data.needsUpgrade) {
              setStatus('locked')
            }
          }
        } catch (error) {
          console.error('Error checking premium access:', error)
        } finally {
          setLoadingUsage(false)
        }
      }
      checkAccess()
    } else {
      setLoadingUsage(false)
    }
  }, [requirePremium])

  const handleFileSelect = useCallback((file: File) => {
    setErrorMessage(null)
    
    if (!SUPPORTED_TYPES.includes(file.type)) {
      const error = 'Formato no soportado. Por favor, sube un archivo JPG, PNG o DICOM.'
      setErrorMessage(error)
      onError?.(error)
      return
    }

    const maxSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const error = `El archivo es muy grande. Máximo ${maxFileSizeMB}MB.`
      setErrorMessage(error)
      onError?.(error)
      return
    }

    setSelectedFile(file)
    
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }, [maxFileSizeMB, onError])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.add('border-primary-500', 'bg-primary-50')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('border-primary-500', 'bg-primary-50')
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }, [handleFileSelect])

  const handleUpload = async () => {
    if (!selectedFile || !imageType) {
      setErrorMessage('Por favor selecciona un tipo de imagen')
      return
    }

    setStatus('uploading')
    setUploadProgress(0)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('imageType', imageType)
      if (patientNotes) {
        formData.append('patientNotes', patientNotes)
      }

      const response = await fetch('/api/ai/vision/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar la imagen')
      }

      setUploadProgress(100)
      setStatus('analyzing')

      const data = await response.json()
      
      setResult({
        url: data.imageUrl,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        analysisId: data.analysisId,
        urgency: data.urgency,
        confidence: data.confidence
      })

      setStatus('success')
      onUploadComplete?.({
        url: data.imageUrl,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        analysisId: data.analysisId,
        urgency: data.urgency,
        confidence: data.confidence
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(message)
      setStatus('error')
      onError?.(message)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setImageType('')
    setPatientNotes('')
    setStatus('idle')
    setUploadProgress(0)
    setErrorMessage(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {status === 'locked' ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Límite de análisis alcanzado</h3>
          <p className="text-gray-600 mb-4">
            {loadingUsage
              ? 'Verificando acceso...'
              : `Has usado tus ${usage.limit} análisis gratuitos este mes.`
            }
          </p>
          {usage.limit > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Usado</span>
                <span>{usage.used} / {usage.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowPaywall(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
            >
              Obtener más análisis
            </button>
          </div>

          <Modal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            title="Límite de análisis alcanzado"
            size="md"
          >
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600">
                  Has usado tus 3 análisis gratuitos este mes. Obtén más análisis actualizando a Premium.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Análisis Individual</h4>
                  <p className="text-2xl font-bold text-gray-900">$50 MXN</p>
                  <p className="text-sm text-gray-500">Por análisis</p>
                  <button
                    onClick={() => {
                      setShowPaywall(false)
                      window.location.href = '/app/premium?purchase=image_analysis&type=single'
                    }}
                    className="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Comprar Ahora
                  </button>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">Pack de 10</h4>
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">-20%</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$400 MXN</p>
                  <p className="text-sm text-gray-500">$40 por análisis</p>
                  <button
                    onClick={() => {
                      setShowPaywall(false)
                      window.location.href = '/app/premium?purchase=image_analysis&type=bundle'
                    }}
                    className="mt-3 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors text-sm"
                  >
                    Comprar Pack
                  </button>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="/app/premium"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver todos los planes premium
                </a>
              </div>
            </div>
          </Modal>
        </div>
      ) : !result ? (
        <>
          {usage.limit > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {usage.limit - usage.used} análisis gratis restantes este mes
                    </p>
                    <p className="text-xs text-blue-700">Límite mensual: {usage.limit} análisis</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${selectedFile
                ? 'border-primary-300 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }
              ${status === 'uploading' || status === 'analyzing' ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.dicom"
              onChange={handleInputChange}
              className="hidden"
              disabled={status === 'uploading' || status === 'analyzing'}
            />

            {previewUrl ? (
              <div className="space-y-4">
                /* eslint-disable-next-line @next/next/no-img-element */ <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedFile?.name}</p>
                  <p className="text-gray-500">{formatFileSize(selectedFile?.size || 0)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReset()
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Eliminar y seleccionar otra
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arrastra tu imagen aquí
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    o haz clic para seleccionar
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Formatos soportados: JPG, PNG, DICOM • Máximo {maxFileSizeMB}MB
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <Select
                label="Tipo de imagen médica"
                placeholder="Selecciona el tipo de imagen"
                options={IMAGE_TYPE_OPTIONS}
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
                required
              />

              <Textarea
                label="Notas adicionales (opcional)"
                placeholder="Describe síntomas, duración, antecedentes relevantes..."
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                rows={3}
              />

              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <LoadingButton
                onClick={handleUpload}
                isLoading={status === 'uploading' || status === 'analyzing'}
                disabled={!imageType || status === 'uploading' || status === 'analyzing'}
                loadingText={status === 'uploading' ? 'Subiendo...' : 'Analizando con IA...'}
                className="w-full"
              >
                {status === 'uploading' ? 'Subiendo imagen...' : 'Analizar imagen'}
              </LoadingButton>

              {status === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progreso</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-teal-900">Imagen analizada exitosamente</h3>
                <p className="text-sm text-teal-700">El análisis de IA está listo para revisión</p>
              </div>
            </div>
            
            <div className="text-sm text-teal-800 space-y-1">
              <p><strong>Archivo:</strong> {result.fileName}</p>
              <p><strong>Tamaño:</strong> {formatFileSize(result.fileSize)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Subir otra imagen
            </button>
            <a
              href={`/app/upload-image/result/${result.url.split('/').pop()}`}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors text-center"
            >
              Ver resultado completo
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
