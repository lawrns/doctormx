'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

interface ClinicalCopilotProps {
    appointmentId: string
    patientId: string
    patientName: string
    patientAge?: number
    patientGender?: string
    medicalHistory?: {
        allergies: string[]
        chronicConditions: string[]
        currentMedications: Array<{ name: string; dosage: string; frequency: string }>
    }
}

interface Suggestion {
    type: 'question' | 'diagnosis' | 'warning' | 'icd' | 'reply'
    title: string
    content: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    onCopy?: () => void
}

export function ClinicalCopilot({
    appointmentId,
    patientName,
    patientAge,
    patientGender,
    medicalHistory,
}: ClinicalCopilotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showPaywall, setShowPaywall] = useState(false)
    const [hasAccess, setHasAccess] = useState(false)
    const [activeTab, setActiveTab] = useState<'suggestions' | 'diagnosis' | 'summary' | 'prescription'>('suggestions')
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [transcription, setTranscription] = useState('')
    const [loading, setLoading] = useState(false)
    const [symptoms, setSymptoms] = useState<string[]>([])
    const supabase = createClient()

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await fetch('/api/premium/status?feature=clinical_copilot')
                if (response.ok) {
                    const data = await response.json()
                    setHasAccess(data.hasAccess)
                    if (!data.hasAccess && data.needsUpgrade) {
                        setShowPaywall(true)
                    }
                }
            } catch (error) {
                console.error('Error checking premium access:', error)
            }
        }
        checkAccess()
    }, [])

    const loadSuggestions = useCallback(async () => {
        setLoading(true)
        try {
            const { data: messages } = await supabase
                .from('chat_messages')
                .select('content')
                .eq('appointment_id', appointmentId)
                .order('created_at', { ascending: true })

            const conversationText = messages?.map(m => m.content).join(' ') || ''
            setTranscription(conversationText)

            const extractedSymptoms = extractSymptoms(conversationText)
            setSymptoms(extractedSymptoms)

            const newSuggestions: Suggestion[] = []

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const response = await fetch('/api/ai/copilot/suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        symptoms: extractedSymptoms,
                        history: medicalHistory?.chronicConditions || [],
                    }),
                })

                if (response.ok) {
                    const data = await response.json()
                    data.questions?.forEach((q: string) => {
                        newSuggestions.push({
                            type: 'question',
                            title: 'Pregunta sugerida',
                            content: q,
                            onCopy: () => navigator.clipboard.writeText(q),
                        })
                    })

                    data.redFlags?.forEach((f: { message: string; severity: string }) => {
                        newSuggestions.push({
                            type: 'warning',
                            title: 'Alerta de peligro',
                            content: f.message,
                            severity: f.severity as 'low' | 'medium' | 'high' | 'critical',
                        })
                    })
                }
            }

            if (medicalHistory?.currentMedications?.length) {
                const medResponse = await fetch('/api/ai/copilot/suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        medications: medicalHistory.currentMedications,
                    }),
                })

                if (medResponse.ok) {
                    const medData = await medResponse.json()
                    medData.interactions?.forEach((i: { drug1: string; drug2: string; severity: string; description: string }) => {
                        newSuggestions.push({
                            type: 'warning',
                            title: `Interaccion: ${i.drug1} + ${i.drug2}`,
                            content: i.description,
                            severity: i.severity as 'low' | 'medium' | 'high' | 'critical',
                        })
                    })
                }
            }

            setSuggestions(newSuggestions)
        } catch (error) {
            console.error('Error loading suggestions:', error)
        } finally {
            setLoading(false)
        }
    }, [appointmentId, medicalHistory, supabase])

    useEffect(() => {
        if (isOpen) {
            loadSuggestions()
        }
    }, [isOpen, loadSuggestions])

    const extractSymptoms = (text: string): string[] => {
        const symptomPatterns = [
            /dolor(?: de)? ([^,.]+)/gi,
            /fiebre/gi,
            /tos/gi,
            /nauseas?/gi,
            /vomit/gi,
            /diarrea/gi,
            /dolor de cabeza/gi,
            /mareo/gi,
            /fatiga/gi,
            /dificultad para respirar/gi,
        ]

        const found: string[] = []
        for (const pattern of symptomPatterns) {
            const matches = text.match(pattern)
            if (matches) {
                found.push(...matches)
            }
        }

        return [...new Set(found)].slice(0, 10)
    }

    const generateSummary = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai/copilot/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcription }),
            })

            if (response.ok) {
                const data = await response.json()
                setSuggestions(prev => [...prev, {
                    type: 'reply',
                    title: 'Resumen de consulta',
                    content: `Motivo: ${data.chiefComplaint}\n\nSintomas: ${data.symptoms.join(', ')}\n\nDiagnostico: ${data.diagnosis}\n\nTratamiento: ${data.treatment}\n\nSeguimiento: ${data.followUp}`,
                }])
            }
        } catch (error) {
            console.error('Error generating summary:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateICDCodes = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai/copilot/diagnosis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms, diagnosis: '' }),
            })

            if (response.ok) {
                const data = await response.json()
                data.diagnoses?.forEach((d: { diagnosis: string; probability: number; reasoning: string }) => {
                    setSuggestions(prev => [...prev, {
                        type: 'diagnosis',
                        title: `Diagnostico: ${d.diagnosis}`,
                        content: `Probabilidad: ${d.probability}%\n${d.reasoning}`,
                    }])
                })

                data.icdCodes?.forEach((c: { code: string; description: string; category: string }) => {
                    setSuggestions(prev => [...prev, {
                        type: 'icd',
                        title: `ICD-10: ${c.code}`,
                        content: `${c.description}\nCategoria: ${c.category}`,
                        onCopy: () => navigator.clipboard.writeText(c.code),
                    }])
                })
            }
        } catch (error) {
            console.error('Error generating ICD codes:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <>
                <button
                    onClick={() => {
                        if (hasAccess) {
                            setIsOpen(true)
                        } else {
                            setShowPaywall(true)
                        }
                    }}
                    className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors z-50 ${
                        hasAccess
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
                    }`}
                    title={hasAccess ? 'Abrir Clinical Copilot' : 'Clinical Copilot - Upgrade necesario'}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {!hasAccess && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                    )}
                </button>

                <Modal
                    isOpen={showPaywall}
                    onClose={() => setShowPaywall(false)}
                    title="Desbloquear Clinical Copilot"
                    size="md"
                >
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Clinical Copilot</h3>
                            <p className="text-gray-600 mt-2">
                                Esta funcionalidad requiere un plan Pro o Elite
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Incluye:</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Sugerencias de preguntas clínicas
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Detección de síntomas con IA
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Generación de diagnósticos ICD-10
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Resumen automático de consultas
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Ahora no
                            </button>
                            <a
                                href="/app/premium"
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium text-center"
                            >
                                Ver Planes
                            </a>
                        </div>
                    </div>
                </Modal>
            </>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-semibold">Clinical Copilot</span>
                    <span className="ml-1 px-2 py-0.5 bg-white/20 text-xs font-bold rounded-full">ELITE</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-blue-700 rounded"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="border-b">
                <nav className="flex">
                    {[
                        { id: 'suggestions', label: 'Sugerencias' },
                        { id: 'diagnosis', label: 'Diagnostico' },
                        { id: 'summary', label: 'Resumen' },
                        { id: 'prescription', label: 'Receta' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="h-80 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'suggestions' && (
                            <div className="space-y-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Paciente</h4>
                                    <p className="text-sm text-gray-600">{patientName}</p>
                                    {(patientAge || patientGender) && (
                                        <p className="text-xs text-gray-500">
                                            {patientAge && `${patientAge} años`}
                                            {patientAge && patientGender && ' • '}
                                            {patientGender}
                                        </p>
                                    )}
                                </div>

                                {medicalHistory && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Antecedentes</h4>
                                        {medicalHistory.allergies.length > 0 && (
                                            <p className="text-sm text-red-600">
                                                <span className="font-medium">Alergias:</span> {medicalHistory.allergies.join(', ')}
                                            </p>
                                        )}
                                        {medicalHistory.chronicConditions.length > 0 && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Cronicos:</span> {medicalHistory.chronicConditions.join(', ')}
                                            </p>
                                        )}
                                        {medicalHistory.currentMedications.length > 0 && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Medicamentos:</span> {medicalHistory.currentMedications.map(m => m.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {symptoms.length > 0 && (
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <h4 className="font-medium text-sm text-blue-700 mb-2">Sintomas detectados</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {symptoms.map((s, i) => (
                                                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {suggestions.filter(s => s.type === 'question').length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Preguntas sugeridas</h4>
                                        {suggestions.filter(s => s.type === 'question').map((s, i) => (
                                            <SuggestionCard key={i} suggestion={s} />
                                        ))}
                                    </div>
                                )}

                                {suggestions.filter(s => s.type === 'warning').length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Alertas</h4>
                                        {suggestions.filter(s => s.type === 'warning').map((s, i) => (
                                            <SuggestionCard key={i} suggestion={s} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'diagnosis' && (
                            <div className="space-y-3">
                                <button
                                    onClick={generateICDCodes}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Generar diagnosticos e ICD-10
                                </button>

                                {suggestions.filter(s => s.type === 'diagnosis').map((s, i) => (
                                    <SuggestionCard key={i} suggestion={s} />
                                ))}

                                {suggestions.filter(s => s.type === 'icd').map((s, i) => (
                                    <SuggestionCard key={i} suggestion={s} />
                                ))}
                            </div>
                        )}

                        {activeTab === 'summary' && (
                            <div className="space-y-3">
                                <button
                                    onClick={generateSummary}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Generar resumen de consulta
                                </button>

                                {suggestions.filter(s => s.type === 'reply' && s.title.includes('Resumen')).map((s, i) => (
                                    <SuggestionCard key={i} suggestion={s} />
                                ))}
                            </div>
                        )}

                        {activeTab === 'prescription' && (
                            <div className="space-y-3">
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm">La plantilla de receta se generara al finalizar la consulta</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="bg-gray-50 p-3 text-xs text-gray-500 text-center">
                AI assistance - Always verify clinical decisions
            </div>
        </div>
    )
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(suggestion.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        suggestion.onCopy?.()
    }

    const severityColors = {
        low: 'bg-yellow-50 border-yellow-200',
        medium: 'bg-orange-50 border-orange-200',
        high: 'bg-red-50 border-red-200',
        critical: 'bg-red-100 border-red-300',
    }

    const severityBadgeColors = {
        low: 'bg-yellow-100 text-yellow-700',
        medium: 'bg-orange-100 text-orange-700',
        high: 'bg-red-100 text-red-700',
        critical: 'bg-red-200 text-red-800',
    }

    return (
        <div className={`rounded-lg border p-3 ${suggestion.severity ? severityColors[suggestion.severity] : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {suggestion.severity && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadgeColors[suggestion.severity]}`}>
                                {suggestion.severity.toUpperCase()}
                            </span>
                        )}
                        <span className="text-xs font-medium text-gray-500">{suggestion.title}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{suggestion.content}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar"
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}
