'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SPECIALTIES, PAYMENT_CONFIG } from '@/config/constants'
import type { Doctor, Profile } from '@/types'

type OnboardingFormProps = {
  doctor: Doctor | null
  profile: Profile
}

export default function OnboardingForm({ doctor, profile }: OnboardingFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // SEP Verification state
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    message: string;
    confidence?: number;
  } | null>(null)

  // Todos los campos en un solo form
  const [specialty, setSpecialty] = useState(doctor?.specialty || '')
  const [yearsExperience, setYearsExperience] = useState(doctor?.years_experience?.toString() || '')
  const [bio, setBio] = useState(doctor?.bio || '')
  const [licenseNumber, setLicenseNumber] = useState(doctor?.license_number || '')
  const [city, setCity] = useState(doctor?.city || '')
  const [state, setState] = useState(doctor?.state || '')
  const [price, setPrice] = useState(doctor?.price_cents ? (doctor.price_cents / 100).toString() : (PAYMENT_CONFIG.DEFAULT_PRICE_CENTS / 100).toString())

  const [availability, setAvailability] = useState({
    monday: { enabled: false, start: '09:00', end: '17:00' },
    tuesday: { enabled: false, start: '09:00', end: '17:00' },
    wednesday: { enabled: false, start: '09:00', end: '17:00' },
    thursday: { enabled: false, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' },
  })

  const isComplete = yearsExperience && bio && licenseNumber && price
  const isVerified = doctor?.status === 'approved'

  // SEP Verification handler
  const handleVerifyCedula = useCallback(async () => {
    if (!licenseNumber || licenseNumber.length < 7) {
      setVerificationStatus({
        verified: false,
        message: 'Ingresa una cédula válida (mínimo 7 dígitos)'
      })
      return
    }

    setVerifying(true)
    setVerificationStatus(null)

    try {
      const res = await fetch('/api/doctor/verify-cedula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: licenseNumber,
          fullName: profile?.full_name
        })
      })

      const data = await res.json()

      if (data.success && data.verification) {
        setVerificationStatus({
          verified: data.verification.verified,
          message: data.verification.message,
          confidence: data.verification.confidence
        })

        // Auto-fill data if verified
        if (data.verification.verified && data.autoFillData) {
          if (data.autoFillData.yearsExperience && !yearsExperience) {
            setYearsExperience(data.autoFillData.yearsExperience.toString())
          }
          if (data.autoFillData.specialty && !specialty) {
            const matchingSpec = SPECIALTIES.find(
              s => s.name.toLowerCase().includes(data.autoFillData.specialty.toLowerCase())
            )
            if (matchingSpec) setSpecialty(matchingSpec.slug)
          }
        }
      } else {
        setVerificationStatus({
          verified: false,
          message: data.error || 'Error al verificar'
        })
      }
    } catch {
      setVerificationStatus({
        verified: false,
        message: 'Error de conexión al verificar'
      })
    } finally {
      setVerifying(false)
    }
  }, [licenseNumber, profile?.full_name, yearsExperience, specialty])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/doctor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // specialty, // Temporalmente comentado por cache de Supabase
          yearsExperience: parseInt(yearsExperience),
          bio,
          licenseNumber,
          // city, // Temporalmente comentado por cache de Supabase
          // state, // Temporalmente comentado por cache de Supabase
          availability,
          priceCents: Math.round(parseFloat(price) * 100),
        }),
      })

      if (res.ok) {
        router.push('/doctor')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al guardar')
        setSubmitting(false)
      }
    } catch {
      alert('Error al guardar')
      setSubmitting(false)
    }
  }

  const dayNames: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  }

  const stateOptions = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'CDMX', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero',
    'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
    'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ]

  const cityByState: Record<string, string[]> = {
    'CDMX': ['Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa',
      'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'Magdalena Contreras',
      'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco', 'Puerto Vallarta'],
    'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'Guadalupe', 'San Nicolás de los Garza', 'Apodaca', 'Santa Catarina'],
    'Puebla': ['Puebla', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Cholula'],
    'Querétaro': ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués'],
    'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato', 'San Miguel de Allende'],
    'Yucatán': ['Mérida', 'Valladolid', 'Progreso', 'Tizimín'],
    'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal', 'Cozumel', 'Tulum'],
    'Veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Poza Rica', 'Córdoba', 'Boca del Río'],
    'Chihuahua': ['Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc'],
    'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Rosarito'],
    'México': ['Ecatepec', 'Nezahualcóyotl', 'Naucalpan', 'Toluca', 'Tlalnepantla', 'Atizapán'],
    'Sonora': ['Hermosillo', 'Cajeme', 'Nogales', 'San Luis Río Colorado'],
    'Coahuila': ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras'],
    'Tamaulipas': ['Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Victoria'],
  }

  const availableCities = state ? (cityByState[state] || [state]) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctor.mx</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Dr. {profile?.full_name}</span>
            {isVerified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                ✓ Verificado
              </span>
            )}
            {!isVerified && isComplete && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                ⏳ En revisión
              </span>
            )}
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isComplete ? 'Mi perfil profesional' : 'Completa tu perfil'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isVerified
                ? 'Tu perfil está verificado y publicado en el catálogo'
                : isComplete
                  ? 'Tu perfil está en revisión. Puedes actualizarlo mientras tanto.'
                  : 'Completa tu información para comenzar a recibir pacientes'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-8">
              {/* Sección: Información Profesional */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Información profesional
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Especialidad *
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Selecciona una especialidad</option>
                      {SPECIALTIES.map((spec) => (
                        <option key={spec.slug} value={spec.slug}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Años de experiencia *
                    </label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      min="0"
                      max="50"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cédula profesional * 
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        Verificamos con la SEP
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => {
                          setLicenseNumber(e.target.value)
                          setVerificationStatus(null)
                        }}
                        required
                        placeholder="Ej: 12345678"
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                          verificationStatus?.verified 
                            ? 'border-green-500 bg-green-50' 
                            : verificationStatus && !verificationStatus.verified
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCedula}
                        disabled={verifying || !licenseNumber}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                      >
                        {verifying ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Verificando...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verificar SEP
                          </>
                        )}
                      </button>
                    </div>
                    {verificationStatus && (
                      <div className={`mt-2 p-3 rounded-lg text-sm ${
                        verificationStatus.verified 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          {verificationStatus.verified ? (
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <div>
                            <p className="font-medium">
                              {verificationStatus.verified ? '✓ Cédula verificada' : 'Verificación pendiente'}
                            </p>
                            <p className="text-xs mt-0.5 opacity-90">{verificationStatus.message}</p>
                            {verificationStatus.confidence && (
                              <p className="text-xs mt-1 opacity-75">
                                Confianza: {verificationStatus.confidence}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Biografía profesional *
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      required
                      maxLength={500}
                      placeholder="Describe tu experiencia y enfoque profesional..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
                  </div>
                </div>
              </div>

              {/* Sección: Ubicación */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Ubicación
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Estado *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value)
                        setCity('') // Reset city when state changes
                      }}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Selecciona un estado</option>
                      {stateOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Ciudad *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      disabled={!state}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {state ? 'Selecciona una ciudad' : 'Primero selecciona un estado'}
                      </option>
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección: Disponibilidad */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Horarios disponibles
                </h2>
                <div className="space-y-3">
                  {Object.entries(availability).map(([day, config]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            [day]: { ...config, enabled: e.target.checked },
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="w-24 font-medium text-gray-900">
                        {dayNames[day]}
                      </span>
                      {config.enabled && (
                        <>
                          <input
                            type="time"
                            value={config.start}
                            onChange={(e) =>
                              setAvailability({
                                ...availability,
                                [day]: { ...config, start: e.target.value },
                              })
                            }
                            className="px-3 py-1 border border-gray-300 rounded text-gray-900"
                          />
                          <span className="text-gray-900 font-medium">a</span>
                          <input
                            type="time"
                            value={config.end}
                            onChange={(e) =>
                              setAvailability({
                                ...availability,
                                [day]: { ...config, end: e.target.value },
                              })
                            }
                            className="px-3 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>

              </div>

              {/* Sección: Precio */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Precio de consulta
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2 text-sm">
                      Precios de referencia
                    </h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Medicina General: $300 - $500 MXN</li>
                      <li>• Especialistas: $500 - $1,000 MXN</li>
                      <li>• Psicología/Nutrición: $400 - $800 MXN</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Rango: ${PAYMENT_CONFIG.MIN_PRICE_CENTS / 100} - ${PAYMENT_CONFIG.MAX_PRICE_CENTS / 100} MXN
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Precio por consulta *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">$</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min={PAYMENT_CONFIG.MIN_PRICE_CENTS / 100}
                        max={PAYMENT_CONFIG.MAX_PRICE_CENTS / 100}
                        step="50"
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      <span className="text-gray-900">{PAYMENT_CONFIG.CURRENCY}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes cambiar tu precio en cualquier momento
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón submit */}
            <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {!isComplete && <span>* Completa todos los campos requeridos</span>}
                {isComplete && !isVerified && (
                  <span className="text-yellow-700">
                    ⏳ Tu perfil está en revisión. Serás notificado cuando sea verificado.
                  </span>
                )}
                {isVerified && (
                  <span className="text-green-700">
                    ✓ Perfil verificado y publicado
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!isComplete || submitting}
                title={submitting ? 'Guardando...' : 'Guardar cambios'}
                className="group relative w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 disabled:hover:scale-100 flex items-center justify-center shadow-lg"
              >
                {submitting ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
