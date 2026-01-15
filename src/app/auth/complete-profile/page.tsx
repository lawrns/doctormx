'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CompleteProfilePage() {
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState<'patient' | 'doctor'>('patient')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }

            // Check if user record already exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (existingUser) {
                // User exists, update the record
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        phone: phone || null,
                        role: role,
                    })
                    .eq('id', user.id)

                if (updateError) {
                    throw new Error(updateError.message || 'Failed to update user profile')
                }
            } else {
                // User doesn't exist, create new record
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        full_name: fullName,
                        phone: phone || null,
                        role: role,
                    })

                if (insertError) {
                    throw new Error(insertError.message || 'Failed to create user profile')
                }
            }

            // If doctor, create doctor record (will be completed in onboarding)
            if (role === 'doctor') {
                try {
                    // Check if doctor record already exists
                    const { data: existingDoctor } = await supabase
                        .from('doctors')
                        .select('id')
                        .eq('id', user.id)
                        .single()

                    if (!existingDoctor) {
                        // Doctor doesn't exist, create new record with defaults
                        // The id references profiles.id directly
                        const { error: doctorError } = await supabase
                            .from('doctors')
                            .insert({
                                id: user.id,
                                price_cents: 50000, // Default $500 MXN
                                status: 'draft',
                            })
                        
                        if (doctorError) {
                            console.error('Doctor insert error:', doctorError)
                        }
                    }
                } catch (doctorError) {
                    console.error('Doctor record error (non-blocking):', doctorError)
                    // Don't throw - doctor record will be created in onboarding if needed
                }
            }

            // Redirect to appropriate dashboard
            console.log('Redirecting to:', role === 'doctor' ? '/doctor/onboarding' : '/app')
            await router.push(role === 'doctor' ? '/doctor/onboarding' : '/app')
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear perfil'
            console.error('Profile creation error:', errorMessage)
            setError('Error al crear perfil. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold text-ink-primary">Doctor.mx</span>
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-card border border-border p-8">
                    <h1 className="text-2xl font-bold text-ink-primary mb-2 text-center">
                        Completa tu perfil
                    </h1>
                    <p className="text-ink-secondary text-center mb-6">
                        Necesitamos algunos datos para continuar
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-ink-primary mb-1">
                                Nombre completo
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="Tu nombre completo"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-ink-primary mb-1">
                                Teléfono (opcional)
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="+52 55 1234 5678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-primary mb-2">
                                ¿Cómo usarás Doctor.mx?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('patient')}
                                    className={`p-4 rounded-xl border-2 transition-all ${role === 'patient'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-border hover:border-primary-200'
                                        }`}
                                >
                                    <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="font-medium text-ink-primary">Paciente</div>
                                    <div className="text-xs text-ink-secondary">Buscar doctores</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('doctor')}
                                    className={`p-4 rounded-xl border-2 transition-all ${role === 'doctor'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-border hover:border-primary-200'
                                        }`}
                                >
                                    <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="font-medium text-ink-primary">Doctor</div>
                                    <div className="text-xs text-ink-secondary">Ofrecer consultas</div>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !fullName}
                            className="w-full py-3 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-button hover:shadow-button-hover"
                        >
                            {loading ? 'Guardando...' : 'Continuar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
