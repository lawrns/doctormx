/**
 * Privacy Preferences Dashboard Component
 *
 * Comprehensive dashboard for users to manage their privacy preferences
 * and data sharing consent across all services.
 *
 * @component PrivacyPreferences
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, EyeOff, Bell, BellOff, Download, Save } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ConsentType } from '@/types/global'
import { logger } from '@/lib/observability/logger'

// Mock preference types - replace with actual API calls
interface PrivacyPreferences {
  // Marketing consents
  marketing_emails: boolean
  marketing_sms: boolean
  marketing_push: boolean

  // Analytics and personalization
  analytics_consent: boolean
  personalization_consent: boolean
  research_consent: boolean
  ai_training_consent: boolean

  // Data sharing
  share_with_insurance: boolean
  share_with_pharmacies: boolean
  share_with_labs: boolean

  // Voice and recording
  voice_recording_consent: boolean
}

interface PrivacyPreferencesProps {
  userId: string
  onSave?: () => void
}

const CATEGORIES = {
  marketing: {
    icon: Bell,
    title: 'Comunicaciones de Marketing',
    description: 'Controla cómo deseas recibir comunicaciones promocionales.',
    color: 'bg-blue-50 text-blue-800',
  },
  data: {
    icon: Shield,
    title: 'Uso de Datos',
    description: 'Gestiona cómo se utilizan tus datos para mejorar servicios.',
    color: 'bg-green-50 text-green-800',
  },
  sharing: {
    icon: Eye,
    title: 'Compartir Datos',
    description: 'Controla con quién compartimos tu información.',
    color: 'bg-purple-50 text-purple-800',
  },
  voice: {
    icon: Save,
    title: 'Voz y Grabación',
    description: 'Ajusta las preferencias para consultas con grabación.',
    color: 'bg-orange-50 text-orange-800',
  },
} as const

type CategoryKey = 'marketing' | 'data' | 'sharing' | 'voice'

const PREFERENCE_DESCRIPTIONS: Record<keyof PrivacyPreferences, { title: string; description: string }> = {
  marketing_emails: {
    title: 'Correos Electrónicos',
    description: 'Recibe novedades, ofertas y actualizaciones sobre servicios médicos por correo electrónico.',
  },
  marketing_sms: {
    title: 'Mensajes de Texto',
    description: 'Recibe notificaciones de citas, recordatorios y promociones por SMS.',
  },
  marketing_push: {
    title: 'Notificaciones Push',
    description: 'Recibe alertas y recordatorios en tu dispositivo móvil.',
  },
  analytics_consent: {
    title: 'Analíticas de Uso',
    description: 'Permite análisis anónimo de tu uso para mejorar la calidad del servicio.',
  },
  personalization_consent: {
    title: 'Personalización',
    description: 'Permite recomendaciones personalizadas basadas en tu historial médico.',
  },
  research_consent: {
    title: 'Investigación',
    description: 'Permite uso de datos anonimizados para investigación médica.',
  },
  ai_training_consent: {
    title: 'Entrenamiento de IA',
    description: 'Permite uso de tus datos para entrenar modelos de inteligencia artificial.',
  },
  share_with_insurance: {
    title: 'Compañía de Seguros',
    description: 'Comparte tus datos médicos con tu aseguradora para agilizar tramites.',
  },
  share_with_pharmacies: {
    title: 'Farmacias',
    description: 'Permite que tus recetas se envíen electrónicamente a farmacias afiliadas.',
  },
  share_with_labs: {
    title: 'Laboratorios',
    description: 'Permite compartir resultados de estudios con laboratorios para tu seguimiento.',
  },
  voice_recording_consent: {
    title: 'Grabación de Consultas',
    description: 'Permite grabar consultas médicas para referencia futura.',
  },
}

export function PrivacyPreferences({ userId, onSave }: PrivacyPreferencesProps) {
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    marketing_emails: true,
    marketing_sms: false,
    marketing_push: false,
    analytics_consent: true,
    personalization_consent: true,
    research_consent: false,
    ai_training_consent: false,
    share_with_insurance: false,
    share_with_pharmacies: false,
    share_with_labs: true,
    voice_recording_consent: false,
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<CategoryKey>('marketing')
  const [hasChanges, setHasChanges] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      setLoading(true)
      try {
        // MOCK IMPLEMENTATION: Load preferences from API
        // In production, replace with:
        // const response = await fetch(`/api/privacy/preferences?userId=${userId}`)
        // const data = await response.json()
        const mockPrefs: PrivacyPreferences = {
          marketing_emails: true,
          marketing_sms: false,
          marketing_push: false,
          analytics_consent: true,
          personalization_consent: true,
          research_consent: false,
          ai_training_consent: false,
          share_with_insurance: false,
          share_with_pharmacies: false,
          share_with_labs: true,
          voice_recording_consent: false,
        }

        setPreferences(mockPrefs)
      } catch (error) {
        logger.error('Error loading privacy preferences', { error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  const handleToggle = (key: keyof PrivacyPreferences) => {
    setPreferences((prev) => {
      const newPreferences = { ...prev, [key]: !prev[key] }
      setHasChanges(true)
      return newPreferences
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // MOCK IMPLEMENTATION: Save preferences to API
      // In production, replace with:
      // await fetch('/api/privacy/preferences', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences),
      // })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setHasChanges(false)
      onSave?.()
    } catch (error) {
      logger.error('Error saving privacy preferences', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // MOCK IMPLEMENTATION: Export user data via ARCO API
      // In production, replace with:
      // await fetch('/api/arco/export', { method: 'POST' })
      logger.info('Export user data requested')
    } catch (error) {
      logger.error('Error exporting data', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const enabledCount = Object.values(preferences).filter(Boolean).length
  const totalCount = Object.keys(preferences).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Preferencias de Privacidad</h2>
          <p className="text-gray-600">
            Controla cómo se utilizan y comparten tus datos personales
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Mis Datos
        </Button>
      </div>

      {/* AI Training Notice */}
      <Alert variant="default" className="border-amber-200 bg-amber-50">
        <AlertDescription className="text-sm text-amber-800">
          <strong>IMPORTANTE:</strong> Si habilitas el entrenamiento de IA,
          tus datos serán anonimizados antes de su uso. Consulta nuestra política de
          privacidad para más detalles.
        </AlertDescription>
      </Alert>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Preferencias</CardTitle>
          <CardDescription>
            {enabledCount} de {totalCount} preferencias activadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-blue-900">{enabledCount}</div>
              <div className="text-sm text-blue-700">Activadas</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-100">
              <div className="text-3xl font-bold text-gray-700">{totalCount - enabledCount}</div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs by Category */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryKey)}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(CATEGORIES).map(([key, { icon: Icon, title, color }]) => (
            <TabsTrigger key={key} value={key as CategoryKey} className="data-[state]">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{title}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['marketing_emails', 'marketing_sms', 'marketing_push'] as const).map((pref) => (
              <Card key={pref}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {PREFERENCE_DESCRIPTIONS[pref].title}
                    </CardTitle>
                    <Switch
                      checked={preferences[pref]}
                      onCheckedChange={() => handleToggle(pref)}
                      disabled={loading}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    {PREFERENCE_DESCRIPTIONS[pref].description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    {preferences[pref] ? (
                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Usage Tab */}
        <TabsContent value="data" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['analytics_consent', 'personalization_consent', 'research_consent', 'ai_training_consent'] as const).map((pref) => (
              <Card key={pref}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pref === 'ai_training_consent' && (
                        <EyeOff className="h-4 w-4 text-amber-600" />
                      )}
                      <CardTitle className="text-base">
                        {PREFERENCE_DESCRIPTIONS[pref].title}
                      </CardTitle>
                    </div>
                    <Switch
                      checked={preferences[pref]}
                      onCheckedChange={() => handleToggle(pref)}
                      disabled={loading}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <p className="text-sm text-gray-600">
                    {PREFERENCE_DESCRIPTIONS[pref].description}
                  </p>
                  {pref === 'ai_training_consent' && (
                    <Alert variant="default" className="mt-3 border-amber-200 bg-amber-50">
                      <AlertDescription className="text-xs text-amber-800">
                        <strong>Nota:</strong> Esta función utiliza
                        datos anonimizados para entrenar modelos. No se comparten
                        datos personales identificables.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Sharing Tab */}
        <TabsContent value="sharing" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['share_with_insurance', 'share_with_pharmacies', 'share_with_labs'] as const).map((pref) => (
              <Card key={pref}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {PREFERENCE_DESCRIPTIONS[pref].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    {PREFERENCE_DESCRIPTIONS[pref].description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={preferences[pref]}
                      onCheckedChange={() => handleToggle(pref)}
                      disabled={loading}
                    />
                    <Badge variant={preferences[pref] ? 'default' : 'outline'}>
                      {preferences[pref] ? 'Compartido' : 'No compartido'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Voice Tab */}
        <TabsContent value="voice" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Grabación de Voz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Switch
                  checked={preferences.voice_recording_consent}
                  onCheckedChange={() => handleToggle('voice_recording_consent')}
                  disabled={loading}
                />
                <div className="flex-1">
                  <Label>Permitir grabación de consultas</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Al habilitar esta opción, las consultas médicas pueden ser
                    grabadas para referencia futura. Solo tú y tu médico tendrán acceso
                    a estas grabaciones.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LFPDPPP Notice */}
        <Alert variant="default" className="mt-6">
          <AlertDescription className="text-sm text-gray-700">
            <strong>Derechos ARCO:</strong> Conforme a la Ley Federal de Protección
            de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho a:
            acceder, rectificar, cancelar u oponerte al tratamiento de tus datos
            en cualquier momento. Ejercicio estos derechos no afectará la calidad de
            los servicios médicos.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 min-w-[200px]"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  )
}
