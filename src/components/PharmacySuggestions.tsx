'use client'

import { useState, useEffect } from 'react'
import { MapPin, DollarSign, Send } from 'lucide-react'

interface Pharmacy {
  pharmacyId: string
  pharmacyName: string
  pharmacyAddress: string
  pharmacyCity: string
  distanceKm: number | null
  estimatedPrice: number
  savingsVsAverage: number
  matchScore: number
}

interface PharmacySuggestionsProps {
  appointmentId: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
  }>
  patientPhone?: string
  onPharmacySelected?: (pharmacyId: string, referralCode: string) => void
}

export default function PharmacySuggestions({
  appointmentId,
  medications,
  patientPhone,
  onPharmacySelected,
}: PharmacySuggestionsProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sentPharmacy, setSentPharmacy] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPharmacies() {
      try {
        const medicationNames = medications.map((m) => m.name).join(',')
        const response = await fetch(
          `/api/pharmacy/recommend?appointmentId=${appointmentId}&medications=${encodeURIComponent(medicationNames)}`
        )

        if (response.ok) {
          const data = await response.json()
          setPharmacies(data.recommendations || [])
        }
      } catch (error) {
        console.error('Error fetching pharmacy recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (medications.length > 0) {
      fetchPharmacies()
    } else {
      setLoading(false)
    }
  }, [appointmentId, medications])

  const handleSendToPharmacy = async (pharmacy: Pharmacy) => {
    if (!patientPhone) {
      alert('El paciente no tiene número de teléfono registrado')
      return
    }

    setSending(true)
    setSelectedPharmacy(pharmacy.pharmacyId)

    try {
      const response = await fetch('/api/pharmacy/refer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId: pharmacy.pharmacyId,
          appointmentId,
          medications: medications.map((m) => m.name),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSentPharmacy(pharmacy.pharmacyId)
        if (onPharmacySelected && data.referral.referralCode) {
          onPharmacySelected(pharmacy.pharmacyId, data.referral.referralCode)
        }
        alert(`Referencia enviada a ${pharmacy.pharmacyName}`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'No se pudo enviar la referencia'}`)
      }
    } catch (error) {
      console.error('Error sending referral:', error)
      alert('Error al enviar la referencia')
    } finally {
      setSending(false)
      setSelectedPharmacy(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmacias Recomendadas</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pharmacies.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-green-600" />
        Farmacias Recomendadas
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Farmacias cercanas con los mejores precios para tus medicamentos
      </p>

      <div className="space-y-4">
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.pharmacyId}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{pharmacy.pharmacyName}</h4>
                  {pharmacy.matchScore >= 70 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      ⭐ Mejor opción
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{pharmacy.pharmacyAddress}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  {pharmacy.distanceKm !== null && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {pharmacy.distanceKm} km
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {(pharmacy.estimatedPrice / 100).toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    })}
                  </div>
                  {pharmacy.savingsVsAverage > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      Ahorro: ${pharmacy.savingsVsAverage} MXN
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4">
                {sentPharmacy === pharmacy.pharmacyId ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default"
                  >
                    ✓ Enviado
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendToPharmacy(pharmacy)}
                    disabled={sending || !patientPhone}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {sending && selectedPharmacy === pharmacy.pharmacyId
                      ? 'Enviando...'
                      : 'Enviar a Farmacia'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!patientPhone && (
        <p className="text-xs text-yellow-600 mt-4">
          ⚠️ El paciente no tiene número de teléfono registrado. No se podrá enviar la referencia por WhatsApp.
        </p>
      )}
    </div>
  )
}
