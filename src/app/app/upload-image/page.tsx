'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageUploader } from '@/components/ImageUploader'
import { getUrgencyLabel, type UrgencyLevel } from '@/lib/ai/vision-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Shield, BookOpen, AlertTriangle } from 'lucide-react'

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
      console.error('Error fetching full analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'emergency':
        return <Badge variant="destructive">{getUrgencyLabel(level as UrgencyLevel)}</Badge>
      case 'high':
        return <Badge variant="warning">{getUrgencyLabel(level as UrgencyLevel)}</Badge>
      case 'medium':
        return <Badge variant="secondary">{getUrgencyLabel(level as UrgencyLevel)}</Badge>
      default:
        return <Badge variant="success">{getUrgencyLabel(level as UrgencyLevel)}</Badge>
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sube tu imagen médica</h2>
              <p className="text-muted-foreground mt-1">
                Nuestra IA analizará tu imagen y te proporcionará una segunda opinión preliminar.
                El análisis será revisado por un médico.
              </p>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Disclaimer médico</p>
                <p className="mt-1">
                  Este análisis es generado por IA y NO sustituye la evaluación de un médico certificado.
                  Siempre consulta con un profesional de la salud para diagnóstico y tratamiento.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">3 análisis gratis al mes</p>
                <p className="text-sm text-muted-foreground">
                  Obtén 3 análisis de imagen gratuitos cada mes. ¿Necesitas más? Actualiza a Premium.
                </p>
              </div>
              <Link href="/app/premium">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Ver Premium
                </Button>
              </Link>
            </div>
          </div>

          {!uploadData && <ImageUploader onUploadComplete={handleUploadComplete} />}
        </Card>

        {(uploadData || loading) && (
          <Card className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resultado del Análisis</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-muted-foreground">Cargando análisis...</span>
              </div>
            ) : fullAnalysis ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nivel de urgencia</p>
                    <div className="mt-1">
                      {getUrgencyBadge(fullAnalysis.urgencyLevel)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Confianza del análisis</p>
                    <p className="text-lg font-semibold text-foreground">{fullAnalysis.confidencePercent}%</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Tipo de imagen</p>
                    <p className="text-lg font-semibold text-foreground">{fullAnalysis.imageTypeLabel}</p>
                  </div>
                </div>

                {fullAnalysis.patientNotes && (
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Tus notas</p>
                    <p className="text-foreground">{fullAnalysis.patientNotes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-foreground mb-2">Hallazgos</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fullAnalysis.findings}</p>
                </div>

                {fullAnalysis.possibleConditions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Posibles condiciones</h4>
                    <ul className="space-y-2">
                      {fullAnalysis.possibleConditions.map((condition, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-muted-foreground mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">{condition.condition}</span>
                            <span className="text-muted-foreground ml-2">({condition.probability})</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-foreground mb-2">Recomendaciones</h4>
                  <ul className="space-y-2">
                    {fullAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[hsl(var(--trust))] mt-0.5" />
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadData(null)
                        setFullAnalysis(null)
                      }}
                      className="flex-1"
                    >
                      Subir otra imagen
                    </Button>
                    <Link href="/doctors" className="flex-1">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Consultar un doctor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No se pudo cargar el análisis completo</p>
            )}
          </Card>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground">Rápido</h4>
            <p className="text-sm text-muted-foreground mt-1">Análisis en segundos con GPT-4 Vision</p>
          </Card>
          
          <Card className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground">Seguro</h4>
            <p className="text-sm text-muted-foreground mt-1">Tus imágenes son privadas y protegidas</p>
          </Card>
          
          <Card className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground">Revisado</h4>
            <p className="text-sm text-muted-foreground mt-1">Un médico revisará tu análisis</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
