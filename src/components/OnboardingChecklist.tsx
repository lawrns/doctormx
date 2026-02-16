'use client'

import { useState } from 'react'
import Link from 'next/link'

interface OnboardingChecklistProps {
  profileCompleted: boolean
  availabilitySet: boolean
  subscriptionActive: boolean
}

export function OnboardingChecklist({
  profileCompleted,
  availabilitySet,
  subscriptionActive,
}: OnboardingChecklistProps) {
  const steps = [
    {
      id: 'profile',
      label: 'Completa tu perfil',
      description: 'Añade tu información profesional, especialidad y foto',
      href: '/doctor/profile',
      completed: profileCompleted,
      icon: 'user',
    },
    {
      id: 'availability',
      label: 'Configura tu disponibilidad',
      description: 'Define tus horarios de atención',
      href: '/doctor/availability',
      completed: availabilitySet,
      icon: 'calendar',
    },
    {
      id: 'subscription',
      label: 'Activa tu suscripción',
      description: 'Elige un plan para comenzar a recibir pacientes',
      href: '/doctor/subscription',
      completed: subscriptionActive,
      icon: 'star',
    },
  ]

  const completedSteps = steps.filter(s => s.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Completa tu configuración</h2>
          <p className="text-sm text-gray-600">Sigue estos pasos para comenzar</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{completedSteps}/{steps.length}</p>
          <p className="text-xs text-gray-500">completado</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              step.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              step.completed ? 'bg-green-100' : 'bg-gray-200'
            }`}>
              {step.completed ? (
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.icon === 'user' ? (
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : step.icon === 'calendar' ? (
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                {step.label}
              </p>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step.completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </Link>
        ))}
      </div>

      {completedSteps === steps.length && (
        <div className="mt-6 p-4 bg-green-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-900">Configuración completa</p>
            <p className="text-sm text-green-700">Tu perfil ya está visible en la búsqueda de doctores.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Welcome Banner for first-time users
export function WelcomeBanner({ patientName }: { patientName: string }) {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bienvenido a Doctor.mx, {patientName}
            </h1>
            <p className="text-primary-100 mb-4 max-w-lg">
              Tu plataforma de telemedicina de confianza. Encuentra doctores verificados, 
              consulta desde casa y cuida tu salud de manera fácil y segura.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/doctores"
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Buscar un doctor
              </Link>
              <Link
                href="/app/profile"
                className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Completar mi perfil
              </Link>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-white/60 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Features highlights */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm">Doctores verificados</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Videoconsultas</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Recetas digitales</span>
          </div>
        </div>
      </div>
    </div>
  )
}
