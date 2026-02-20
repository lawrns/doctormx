'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  urgencyLevel: string
  confidencePercent: number
}

export default function UploadImagePage() {
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = async (data: UploadData) => {
    setUploadData(data)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/ai/vision/result/${data.analysisId}`)
      if (response.ok) {
        const result = await response.json()
        setFullAnalysis(result.analysis)
      } else {
        setError('No se pudo cargar el análisis completo')
      }
    } catch (err) {
      setError('Error al obtener el análisis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <AppNavigation currentPage="/app/upload-image" />
      
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Análisis de Imagen con IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sube una imagen médica para obtener un análisis preliminar impulsado por inteligencia artificial
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-teal-500 transition-colors">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                Seleccionar imagen
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Formatos soportados: JPG, PNG, DICOM. Máximo 20MB.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Analizando imagen...</p>
            </div>
          )}

          {/* Results */}
          {fullAnalysis && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultados del Análisis</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hallazgos</h3>
                  <p className="text-gray-700">{fullAnalysis.findings}</p>
                </div>

                {fullAnalysis.possibleConditions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Condiciones Posibles</h3>
                    <ul className="space-y-2">
                      {fullAnalysis.possibleConditions.map((condition, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span>{condition.condition}</span>
                          <span className="text-sm text-gray-500">{condition.probability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fullAnalysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recomendaciones</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {fullAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Nivel de urgencia</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      fullAnalysis.urgencyLevel === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : fullAnalysis.urgencyLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {fullAnalysis.urgencyLevel === 'high' ? 'Alta' : 
                       fullAnalysis.urgencyLevel === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Confianza</p>
                    <p className="font-medium">{fullAnalysis.confidencePercent}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1">Rápido</h4>
              <p className="text-sm text-gray-600">Análisis en segundos con IA</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1">Seguro</h4>
              <p className="text-sm text-gray-600">Tus imágenes están protegidas</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1">Preciso</h4>
              <p className="text-sm text-gray-600">Resultados validados por médicos</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Nota importante:</strong> Este análisis es preliminar y no reemplaza 
              la consulta con un médico. Siempre busca atención médica profesional para 
              diagnósticos y tratamientos.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
