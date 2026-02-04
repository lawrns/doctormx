'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageUploader } from '@/components/ImageUploader'
import { getUrgencyLabel, type UrgencyLevel } from '@/lib/ai/vision-types'

interface UploadData {
  url: string
  analysisId: string
  urgency: string
  confidence: number
}

interface FullAnalysis {
  findings: string
  possibleConditions: Array<{ condition: string; probability: string }>
  recommendations: string[]
  followUpNeeded: boolean
  imageType: string
  imageTypeLabel: string
  patientNotes: string | null
  urgencyLevel: string
  confidencePercent: number
  createdAt: string
}

export default function UploadImagePage() {
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  const handleUploadComplete = async (data: UploadData) => {
    setUploadData(data)
    setLoading(true)

    try {
      const response = await fetch(`/api/ai/vision/result/${data.analysisId}`)

      if (response.ok) {
        const result = await response.json()
        setFullAnalysis(result.analysis)
      }
    } catch (error) {
      console.error('Error fetching full analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Imagen con IA</h1>
          <p className="text-gray-500 text-sm mt-1">Sube una imagen médica para obtener una segunda opinión preliminar</p>
        </div>

        {/* Upload Area - First thing users see */}
        {!uploadData && (
          <div className="mb-6">
            <ImageUploader onUploadComplete={handleUploadComplete} />

            {/* Usage Counter - Subtle pill style */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                3 análisis gratis restantes este mes
              </span>
              <span>•</span>
              <Link href="/app/premium" className="text-primary-600 hover:text-primary-700">
                ¿Necesitas más análisis? Ver Premium →
              </Link>
            </div>
          </div>
        )}

        {/* Upload Card with Analysis Result */}
        {(uploadData || loading) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado del Análisis</h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">Cargando análisis...</span>
              </div>
            ) : fullAnalysis ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Nivel de urgencia</p>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      fullAnalysis.urgencyLevel === 'emergency' ? 'bg-red-100 text-red-800' :
                      fullAnalysis.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      fullAnalysis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-teal-50 text-teal-800'
                    }`}>
                      {getUrgencyLabel(fullAnalysis.urgencyLevel as UrgencyLevel)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Confianza del análisis</p>
                    <p className="text-lg font-semibold text-gray-900">{fullAnalysis.confidencePercent}%</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Tipo de imagen</p>
                    <p className="text-lg font-semibold text-gray-900">{fullAnalysis.imageTypeLabel}</p>
                  </div>
                </div>

                {fullAnalysis.patientNotes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Tus notas</p>
                    <p className="text-gray-700">{fullAnalysis.patientNotes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Hallazgos</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{fullAnalysis.findings}</p>
                </div>

                {fullAnalysis.possibleConditions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Posibles condiciones</h4>
                    <ul className="space-y-2">
                      {fullAnalysis.possibleConditions.map((condition, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-gray-600">
                            <span className="font-medium">{condition.condition}</span>
                            <span className="text-gray-400 ml-2">({condition.probability})</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
                  <ul className="space-y-2">
                    {fullAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setUploadData(null)
                        setFullAnalysis(null)
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Subir otra imagen
                    </button>
                    <Link
                      href="/doctors"
                      className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors text-center"
                    >
                      Consultar un doctor
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No se pudo cargar el análisis completo</p>
            )}
          </div>
        )}

        {/* Trust Badges - Single Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Rápido</h4>
            <p className="text-xs text-gray-500 mt-1">Análisis en segundos</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Seguro</h4>
            <p className="text-xs text-gray-500 mt-1">Imágenes privadas</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Revisado</h4>
            <p className="text-xs text-gray-500 mt-1">Un médico revisará</p>
          </div>
        </div>

        {/* Medical Disclaimer - Collapsible */}
        <button
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          className="w-full text-left text-gray-400 hover:text-gray-500 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Disclaimer médico</span>
          <svg className={`w-3 h-3 transition-transform ${showDisclaimer ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDisclaimer && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            Este análisis es generado por IA y <strong>NO sustituye</strong> la evaluación de un médico certificado.
            Siempre consulta con un profesional de la salud para diagnóstico y tratamiento.
          </div>
        )}
      </div>
    </div>
  )
}
