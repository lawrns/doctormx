'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClinicalCopilot } from '@/components/ClinicalCopilot'
import type { PatientMedicalHistory, PatientProfile } from '@/lib/patient-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface DoctorConsultationPageProps {
    params: Promise<{ appointmentId: string }>
}

export default function DoctorConsultationPage({ params }: DoctorConsultationPageProps) {
    const resolvedParams = use(params)
    const appointmentId = resolvedParams.appointmentId
    const [appointment, setAppointment] = useState<{
        id: string
        patient_id: string
        start_ts: string
        status: string
        patient?: { full_name: string; photo_url: string | null }
    } | null>(null)
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null)
    const [patientHistory, setPatientHistory] = useState<PatientMedicalHistory | null>(null)
    const [loading, setLoading] = useState(true)
    const [supabase] = useState(() => {
        try {
            return createClient()
        } catch {
            return null
        }
    })

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        const init = async () => {
            const { data: apt } = await supabase
                .from('appointments')
                .select(`
                    id,
                    patient_id,
                    start_ts,
                    status,
                    patient:profiles!appointments_patient_id_fkey(id, full_name, photo_url)
                `)
                .eq('id', appointmentId)
                .single()

            if (apt && apt.patient) {
                setAppointment({
                    ...apt,
                    patient: {
                        full_name: apt.patient[0]?.full_name || 'Paciente',
                        photo_url: apt.patient[0]?.photo_url || null,
                    },
                })
            }

            if (apt?.patient_id) {
                // Fetch patient profile directly
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', apt.patient_id)
                    .single()
                
                // Fetch patient medical history directly
                const { data: history } = await supabase
                    .from('patient_medical_history')
                    .select('*')
                    .eq('patient_id', apt.patient_id)
                    .single()
                
                if (profile) setPatientProfile(profile as PatientProfile)
                if (history) setPatientHistory(history as PatientMedicalHistory)
            }
            setLoading(false)
        }
        init()
    }, [appointmentId, supabase])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const calculateAge = (birthDate: string | null): number | undefined => {
        if (!birthDate) return undefined
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Cita no encontrada</h1>
                    <p className="text-muted-foreground">La cita que buscas no existe o no tienes acceso.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="font-display text-xl font-bold text-foreground">Doctor.mx</h1>
                        <Badge variant="default">Sala de Consulta</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {formatDate(appointment.start_ts)} - {formatTime(appointment.start_ts)}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex">
                <main className="flex-1 p-6">
                    <Card className="rounded-2xl border border-border shadow-dx-1 overflow-hidden">
                        <CardContent className="p-6 border-b border-border">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                                    {appointment.patient?.photo_url ? (
                                        <img
                                            src={appointment.patient.photo_url}
                                            alt={appointment.patient.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        (appointment.patient?.full_name?.charAt(0) || 'P').toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        {appointment.patient?.full_name || 'Paciente'}
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        {patientProfile?.date_of_birth && (
                                            <>
                                                {calculateAge(patientProfile.date_of_birth)} años
                                                {' · '}
                                            </>
                                        )}
                                        {patientProfile?.gender === 'male' ? 'Masculino' :
                                         patientProfile?.gender === 'female' ? 'Femenino' :
                                         patientProfile?.gender || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardContent className="p-6">
                            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg font-medium text-foreground">Videollamada</p>
                                    <p className="text-sm opacity-75">Conectando con el paciente...</p>
                                </div>
                            </div>
                        </CardContent>

                        <CardContent className="p-6 border-t border-border bg-secondary/30">
                            <div className="flex gap-4">
                                <Button variant="destructive" className="flex-1">
                                    Finalizar Consulta
                                </Button>
                                <Button className="flex-1">
                                    Generar Receta
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 rounded-2xl border border-border shadow-dx-1">
                        <CardHeader>
                            <CardTitle className="font-display text-lg font-semibold">Notas de la consulta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="min-h-[160px] resize-none"
                                placeholder="Escribe tus notas aqui..."
                            />
                        </CardContent>
                    </Card>
                </main>

                <aside className="w-80 bg-card border-l border-border p-6 hidden lg:block">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">Informacion del paciente</h3>

                    {patientHistory ? (
                        <div className="space-y-4">
                            {patientHistory.allergies.length > 0 && (
                                <div className="p-3 bg-destructive/10 rounded-xl">
                                    <p className="text-sm font-medium text-destructive mb-1">Alergias</p>
                                    <p className="text-sm text-destructive/80">{patientHistory.allergies.join(', ')}</p>
                                </div>
                            )}

                            {patientHistory.chronic_conditions.length > 0 && (
                                <div className="p-3 bg-yellow-100 rounded-xl">
                                    <p className="text-sm font-medium text-yellow-800 mb-1">Condiciones cronicas</p>
                                    <p className="text-sm text-yellow-700">{patientHistory.chronic_conditions.join(', ')}</p>
                                </div>
                            )}

                            {patientHistory.current_medications.length > 0 && (
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <p className="text-sm font-medium text-primary mb-1">Medicamentos actuales</p>
                                    <ul className="text-sm text-primary/80 space-y-1">
                                        {patientHistory.current_medications.map((med, i) => (
                                            <li key={i}>
                                                {typeof med === 'string' ? med : `${(med as { name?: string; dosage?: string; frequency?: string }).name} ${(med as { name?: string; dosage?: string; frequency?: string }).dosage} - ${(med as { name?: string; dosage?: string; frequency?: string }).frequency}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {patientHistory.past_surgeries.length > 0 && (
                                <div className="p-3 bg-secondary rounded-xl">
                                    <p className="text-sm font-medium text-foreground mb-1">Cirugias previas</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {patientHistory.past_surgeries.map((surgery, i) => (
                                            <li key={i}>
                                                {typeof surgery === 'string' ? surgery : `${(surgery as { procedure?: string; year?: string }).procedure} ${(surgery as { procedure?: string; year?: string }).year ? `(${(surgery as { procedure?: string; year?: string }).year})` : ''}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {patientHistory.family_history.length > 0 && (
                                <div className="p-3 bg-secondary rounded-xl">
                                    <p className="text-sm font-medium text-foreground mb-1">Antecedentes familiares</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {patientHistory.family_history.map((fh, i) => (
                                            <li key={i}>
                                                {typeof fh === 'string' ? fh : `${(fh as { condition?: string; relationship?: string }).condition} (${(fh as { condition?: string; relationship?: string }).relationship})`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No hay historial medico disponible</p>
                    )}
                </aside>
            </div>

            <ClinicalCopilot
                appointmentId={appointmentId}
                patientId={appointment.patient_id}
                patientName={appointment.patient?.full_name || 'Paciente'}
                patientAge={patientProfile?.date_of_birth ? calculateAge(patientProfile.date_of_birth) : undefined}
                patientGender={patientProfile?.gender || undefined}
                medicalHistory={patientHistory ? {
                    allergies: patientHistory.allergies,
                    chronicConditions: patientHistory.chronic_conditions,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    currentMedications: patientHistory.current_medications as any,
                } : undefined}
            />
        </div>
    )
}
