'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClinicalCopilot } from '@/components/ClinicalCopilot'
import type { PatientMedicalHistory, PatientProfile } from '@/lib/patient-types'

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
    const supabase = createClient()

    useEffect(() => {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Cita no encontrada</h1>
                    <p className="text-gray-600">La cita que buscas no existe o no tienes acceso.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">Doctor.mx</h1>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Sala de Consulta
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {formatDate(appointment.start_ts)} - {formatTime(appointment.start_ts)}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex">
                <main className="flex-1 p-6">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-2xl overflow-hidden">
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
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {appointment.patient?.full_name || 'Paciente'}
                                    </h2>
                                    <p className="text-gray-500">
                                        {patientProfile?.date_of_birth && (
                                            <>
                                                {calculateAge(patientProfile.date_of_birth)} años
                                                {' • '}
                                            </>
                                        )}
                                        {patientProfile?.gender === 'male' ? 'Masculino' :
                                         patientProfile?.gender === 'female' ? 'Femenino' :
                                         patientProfile?.gender || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">Videollamada</p>
                                    <p className="text-sm opacity-75">Conectando con el paciente...</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex gap-4">
                                <button className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                                    Finalizar Consulta
                                </button>
                                <button className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    Generar Receta
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Notas de la consulta</h3>
                        <textarea
                            className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Escribe tus notas aqui..."
                        />
                    </div>
                </main>

                <aside className="w-80 bg-white border-l p-6 hidden lg:block">
                    <h3 className="font-semibold text-gray-900 mb-4">Informacion del paciente</h3>

                    {patientHistory ? (
                        <div className="space-y-4">
                            {patientHistory.allergies.length > 0 && (
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm font-medium text-red-700 mb-1">Alergias</p>
                                    <p className="text-sm text-red-600">{patientHistory.allergies.join(', ')}</p>
                                </div>
                            )}

                            {patientHistory.chronic_conditions.length > 0 && (
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-700 mb-1">Condiciones cronicas</p>
                                    <p className="text-sm text-yellow-600">{patientHistory.chronic_conditions.join(', ')}</p>
                                </div>
                            )}

                            {patientHistory.current_medications.length > 0 && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-700 mb-1">Medicamentos actuales</p>
                                    <ul className="text-sm text-blue-600 space-y-1">
                                        {patientHistory.current_medications.map((med, i) => (
                                            <li key={i}>
                                                {typeof med === 'string' ? med : `${(med as { name?: string; dosage?: string; frequency?: string }).name} ${(med as { name?: string; dosage?: string; frequency?: string }).dosage} - ${(med as { name?: string; dosage?: string; frequency?: string }).frequency}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {patientHistory.past_surgeries.length > 0 && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Cirugias previas</p>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {patientHistory.past_surgeries.map((surgery, i) => (
                                            <li key={i}>
                                                {typeof surgery === 'string' ? surgery : `${(surgery as { procedure?: string; year?: string }).procedure} ${(surgery as { procedure?: string; year?: string }).year ? `(${(surgery as { procedure?: string; year?: string }).year})` : ''}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {patientHistory.family_history.length > 0 && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Antecedentes familiares</p>
                                    <ul className="text-sm text-gray-600 space-y-1">
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
                        <p className="text-gray-500 text-sm">No hay historial medico disponible</p>
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
