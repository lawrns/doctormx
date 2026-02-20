'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Mail, Phone, Calendar, MapPin, Shield, Settings, LogOut, Camera } from 'lucide-react'
import { logger } from '@/lib/observability/logger'
import AppNavigation from '@/components/app/AppNavigation'

interface ProfileData {
  id: string
  full_name: string
  email?: string
  photo_url: string | null
  phone: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  city: string | null
  state: string | null
  country: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    city: '',
    state: '',
    country: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/patient/profile')
      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setFormData({
          full_name: data.profile.full_name ?? '',
          phone: data.profile.phone ?? '',
          date_of_birth: data.profile.date_of_birth ?? '',
          gender: data.profile.gender ?? '',
          city: data.profile.city ?? '',
          state: data.profile.state ?? '',
          country: data.profile.country ?? '',
        })
      } else {
        setErrorMessage(data.error ?? 'Error al cargar perfil')
        logger.error('Error fetching profile', { error: data.error ?? 'Error desconocido' })
      }
    } catch (error) {
      setErrorMessage('Error al cargar perfil')
      logger.error('Error fetching profile', { error })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setProfile((prev: ProfileData | null) => prev ? { 
          ...prev, 
          ...formData,
          gender: formData.gender as ProfileData['gender']
        } : null)
        setEditing(false)
      } else {
        const data = await response.json()
        setErrorMessage(data.error ?? 'Error al actualizar perfil')
      }
    } catch (error) {
      setErrorMessage('Error al actualizar perfil')
      logger.error('Error updating profile', { error })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        date_of_birth: profile.date_of_birth ?? '',
        gender: profile.gender ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        country: profile.country ?? '',
      })
    }
    setEditing(false)
    setErrorMessage(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getGenderLabel = (gender: string | null) => {
    const labels: Record<string, string> = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      prefer_not_to_say: 'Prefiero no decirlo',
    }
    return labels[gender ?? ''] ?? 'No especificado'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation currentPage="/app/profile" />
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/profile" />

      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-lg text-gray-600">Gestiona tu información personal</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.full_name ?? 'Perfil'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-primary-600" />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold mb-1">{profile.full_name}</h2>
                  <p className="text-primary-100">{profile.email ?? ''}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8">
              {!editing ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      Editar Perfil
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nombre completo</p>
                        <p className="font-medium text-gray-900">{profile.full_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Correo electrónico</p>
                        <p className="font-medium text-gray-900">{profile.email ?? 'No registrado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium text-gray-900">{profile.phone ?? 'No registrado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                        <p className="font-medium text-gray-900">{formatDate(profile.date_of_birth ?? '')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Género</p>
                        <p className="font-medium text-gray-900">{getGenderLabel(profile.gender)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ubicación</p>
                        <p className="font-medium text-gray-900">
                          {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') ?? 'No registrada'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Editar Perfil</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de nacimiento
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                        <option value="prefer_not_to_say">Prefiero no decirlo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Link
            href="/app/data-rights"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Datos y Privacidad</p>
              <p className="text-sm text-gray-500">Gestiona tus datos personales</p>
            </div>
          </Link>

          <a
            href="/auth/signout"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cerrar Sesión</p>
              <p className="text-sm text-gray-500">Salir de tu cuenta</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
