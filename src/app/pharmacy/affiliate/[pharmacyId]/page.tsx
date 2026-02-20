import { getReferralByCode, getPharmacySponsorById, updateReferralStatus } from '@/lib/pharmacy'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ pharmacyId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PharmacyAffiliatePage({ params, searchParams }: PageProps) {
  const { pharmacyId } = await params
  const search = await searchParams
  const referralCode = search.ref as string | undefined

  const pharmacy = await getPharmacySponsorById(pharmacyId)

  if (!pharmacy) {
    notFound()
  }

  let referral = null
  let prescription = null

  if (referralCode) {
    referral = await getReferralByCode(referralCode)
    
    if (referral) {
      await updateReferralStatus(referral.id, 'viewed')

      const { createServiceClient } = await import('@/lib/supabase/server')
      const supabase = createServiceClient()

      const { data: prescriptionData } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', referral.prescription_id)
        .single()

      prescription = prescriptionData

      const { data: patientData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', referral.patient_id)
        .single()

      if (patientData) {
        referral = {
          ...referral,
          patient_name: patientData.full_name,
          patient_phone: patientData.phone,
        }
      }
    }
  }

  const medications = prescription ? JSON.parse(prescription.medications ?? '[]') : []
  const instructions = prescription?.instructions ?? ''

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Doctor.mx
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800">
            <Building2 className="w-4 h-4 mr-1 inline" />Farmacia Asociada
          </span>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
        {referral ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
                <h2 className="text-xl font-bold text-primary-900">Tu Receta Médica</h2>
                <p className="text-sm text-primary-700">Código de referencia: <span className="font-mono font-bold">{referral.referral_code}</span></p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-ink-primary mb-2">Diagnóstico</h3>
                  <p className="text-ink-secondary">{prescription?.diagnosis ?? 'No especificado'}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-ink-primary mb-2">Medicamentos</h3>
                  <ul className="space-y-2">
                    {medications.map((med: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-ink-secondary">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {med}
                      </li>
                    ))}
                  </ul>
                </div>

                {instructions && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-ink-primary mb-2">Instrucciones</h3>
                    <p className="text-ink-secondary">{instructions}</p>
                  </div>
                )}

                {referral.estimated_total_cents && (
                  <div className="bg-secondary-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-ink-muted">Costo estimado de medicamentos</p>
                    <p className="text-2xl font-bold text-ink-primary">
                      {formatCurrency(referral.estimated_total_cents)}
                    </p>
                    {pharmacy.discount_percentage && (
                      <p className="text-sm text-teal-600 mt-1">
                        🎉 {pharmacy.discount_percentage}% de descuento para pacientes Doctor.mx
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-border p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-secondary-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {pharmacy.logo_url ? (
                    
                              <img src={pharmacy.logo_url} alt={pharmacy.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-ink-primary">{pharmacy.name}</h3>
                  <p className="text-ink-secondary">{pharmacy.address}</p>
                  <p className="text-sm text-ink-muted">{pharmacy.city}, {pharmacy.state}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {pharmacy.offers_pickup && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${pharmacy.address}, ${pharmacy.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-ink-primary">Recoger en tienda</p>
                      <p className="text-sm text-ink-muted">Visítanos directamente</p>
                    </div>
                  </a>
                )}

                {pharmacy.offers_delivery && pharmacy.whatsapp_number && (
                  <a
                    href={`https://wa.me/${pharmacy.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola, tengo una referencia de Doctor.mx. Código: ${referral.referral_code}. Me gustaría pedir delivery de mis medicamentos.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-ink-primary">WhatsApp</p>
                      <p className="text-sm text-ink-muted">Solicitar delivery</p>
                    </div>
                  </a>
                )}

                {pharmacy.phone && (
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-ink-primary">Teléfono</p>
                      <p className="text-sm text-ink-muted">{pharmacy.phone}</p>
                    </div>
                  </a>
                )}

                {pharmacy.doctory_discount_code && (
                  <div className="flex items-center gap-3 p-4 border border-primary-200 bg-primary-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-ink-primary">Código de descuento</p>
                      <p className="text-sm text-primary-600 font-mono">{pharmacy.doctory_discount_code}</p>
                    </div>
                  </div>
                )}
              </div>

              {pharmacy.delivery_time_hours && (
                <div className="mt-4 p-4 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-ink-muted">Tiempo estimado de entrega</p>
                  <p className="text-lg font-semibold text-ink-primary">
                    {pharmacy.delivery_time_hours} horas
                  </p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Presenta este código de referencia <span className="font-mono font-bold">{referral.referral_code}</span> en la farmacia para validar tu descuento de Doctor.mx.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Válido hasta: {format(new Date(referral.expires_at), 'dd MMMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-border p-8 text-center">
            <div className="w-20 h-20 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ink-primary mb-2">{pharmacy.name}</h2>
            <p className="text-ink-secondary mb-6">{pharmacy.address}</p>
            <p className="text-ink-muted">
              Para ver tu receta médica, necesitas un enlace de referencia de tu doctor.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver a Doctor.mx
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-ink-muted">
          <p>© {new Date().getFullYear()} Doctor.mx - Tu salud, simplificada</p>
        </div>
      </footer>
    </div>
  )
}
