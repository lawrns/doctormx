'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageUploader } from '@/components/ImageUploader'
import { getUrgencyLabel, type UrgencyLevel } from '@/lib/ai/vision-types'
import { logger } from '@/lib/observability/logger'
import AppNavigation from '@/components/app/AppNavigation'

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
      logger.error('Error fetching full analysis', { analysisId: data.analysisId }, error as Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/upload-image" />

      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m0 0l-7 7 7M5 14v7a7 7 0 013-10l-3-3 013-10z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sube tu imagen médica</h2>
                <p className="text-gray-600 mt-1">
                  Nuestra IA analizará tu imagen y te proporcionará una segunda opinión preliminar.
                  El análisis será revisado por un médico.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01V7a2 2 0 012 2v5a2 2 0 01-2-2H6a2 2 0 01-2 2v10a2 2 0 012 2h4m1.793a1 1 0 01-1.414 1.009 1.003l-.01V7a2 2 0 012 2h-4m-2.036-.003.01a1 1 0 00-4.357 1.009 1.003l-.009 1.003z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Disclaimer médico</p>
                  <p className="mt-1">
                    Este análisis es generado por IA y NO sustituye la evaluación de un médico certificado.
                    Siempre consulta con un profesional de la salud para diagnóstico y tratamiento.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9.75 0 0 6.356 3.007 1v9a9 9 0 0118 11.011h4m1.793a1 1 0 01-1.414 1.009 1.003l-.01V7a2 2 0 012 2h-4m-2.036-.003.01a1 1 0 00-4.357 1.009 1.003l-.009 1.003z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-800">3 análisis gratis al mes</p>
                  <p className="text-sm text-blue-700">
                    Obtén 3 análisis de imagen gratuitos cada mes. ¿Necesitas más? Actualiza a Premium.
                  </p>
                </div>
                <Link
                  href="/app/premium"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Ver Premium
                </Link>
              </div>
            </div>

            {!uploadData && <ImageUploader onUploadComplete={handleUploadComplete} />}
        </div>

        {(uploadData || loading) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7m0 0l-7 7M5 14v7a7 7 0 013-10l-3-3 013-10z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m0 0l-7 7 7M5 14v7a7 7 0 013-10l-3-3 013-10z" />
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
                      href="/doctores"
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
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9.75 0 0 6.356 3.007 1v9a9 9 0 0118 11.011h4m1.793a1 1 0 01-1.414 1.009 1.003l-.01V7a2 2 0 012 2h-4m-2.036-.003.01a1 1 0 00-4.357 1.009 1.003l-.009 1.003z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Rápido</h4>
            <p className="text-sm text-gray-600 mt-1">Análisis en segundos con GPT-4 Vision</p>
          </div>

          <div className="bg-white p-4 border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m0 0l-7 7 7M5 14v7a7 7 0 013-10l-3-3 013-10z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Seguro</h4>
            <p className="text-sm text-gray-600 mt-1">Tus imágenes son privadas y protegidas</p>
          </div>

          <div className="bg-white p-4 border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m-8.954l-3.72c.7 0 1.29.676-1.635 3.486-3.486l-3.72C3 6 0 1.268-.96.1.406l1.407-1.13.594-3.167c-14.594.825.157-1.01V6a3 3 0 01-3.3V9a2 2 0 012 2h-4m-2.036-.003.01a1 1 0 00-4.357 1.009 1.003z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Revisado</h4>
            <p className="text-sm text-gray-600 mt-1">Un médico revisará tu análisis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
