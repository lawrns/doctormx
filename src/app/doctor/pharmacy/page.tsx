import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DoctorPharmacyPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, status')
    .eq('id', user.id)
    .single()

  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  const isPending = !doctor || doctor.status !== 'approved'

  let earnings = null
  let referrals = []

  if (!isPending) {
    const { data: earningsData } = await supabase
      .from('pharmacy_commissions')
      .select('*')
      .eq('doctor_id', user.id)
    
    const { data: referralsData } = await supabase
      .from('pharmacy_referrals')
      .select(`
        *,
        pharmacy:pharmacy_sponsors(name, slug, logo_url, city)
      `)
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    referrals = referralsData || []

    const totalReferrals = referrals.length
    const redeemedReferrals = referrals.filter((r) => r.status === 'redeemed').length
    const pendingReferrals = referrals.filter((r) => r.status !== 'redeemed' && r.status !== 'cancelled' && r.status !== 'expired').length
    const totalReferralFees = earningsData?.reduce((sum, c) => sum + (c.referral_fee_cents || 0), 0) || 0
    const totalCommissions = earningsData?.reduce((sum, c) => sum + (c.commission_amount_cents || 0), 0) || 0
    const platformFees = earningsData?.reduce((sum, c) => sum + (c.platform_fee_cents || 0), 0) || 0
    const netEarnings = earningsData?.reduce((sum, c) => sum + (c.net_doctor_earnings_cents || 0), 0) || 0

    earnings = {
      totalReferrals,
      redeemedReferrals,
      pendingReferrals,
      totalReferralFees,
      totalCommissions,
      platformFees,
      netEarnings,
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100)
  }

  return (
    <DoctorLayout profile={profile} isPending={isPending} currentPath="/doctor/pharmacy">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Farmacias & Ganancias</h2>
          <p className="text-gray-600">Gestiona tus referidos a farmacias y consulta tus ganancias</p>
        </div>

        {isPending ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-900">Sección no disponible</h3>
                <p className="text-yellow-700 mt-1">
                  Podrás acceder a las farmacias una vez que tu perfil sea aprobado.
                </p>
              </div>
            </div>
          </div>
        ) : earnings ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-ink-muted mb-1">Total Referidos</p>
                <p className="text-2xl font-bold text-ink-primary">{earnings.totalReferrals}</p>
              </div>

              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-ink-muted mb-1">Canjeados</p>
                <p className="text-2xl font-bold text-green-600">{earnings.redeemedReferrals}</p>
              </div>

              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-ink-muted mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{earnings.pendingReferrals}</p>
              </div>

              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-ink-muted mb-1">Ganancias Netas</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(earnings.netEarnings)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <h4 className="font-medium text-ink-primary mb-2">Tarifa por Referido</h4>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(earnings.totalReferralFees)}</p>
                <p className="text-sm text-ink-muted mt-1">
                  {formatCurrency(5000)} por referido canjeado (50 MXN)
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <h4 className="font-medium text-ink-primary mb-2">Comisiones</h4>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(earnings.totalCommissions)}</p>
                <p className="text-sm text-ink-muted mt-1">
                  3-5% de ventas de medicamentos
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-card border border-border p-6">
                <h4 className="font-medium text-ink-primary mb-2">Tarifa Plataforma</h4>
                <p className="3xl font-bold text-red-600">{formatCurrency(earnings.platformFees)}</p>
                <p className="text-sm text-ink-muted mt-1">
                  20% de tarifa fija (平台 fee)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-ink-primary">Historial de Referidos</h3>
              </div>
              
              {referrals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                          Farmacia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                          Medicamentos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {referrals.map((referral: Record<string, unknown>) => (
                        <tr key={referral.id as string} className="hover:bg-secondary-50">
                          <td className="px-6 py-4">
                            <code className="text-sm font-mono bg-secondary-100 px-2 py-1 rounded">
                              {referral.referral_code as string}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {(referral.pharmacy as { logo_url: string | null })?.logo_url && (
                                
                              <img
                                  src={(referral.pharmacy as { logo_url: string }).logo_url}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-ink-primary">
                                  {(referral.pharmacy as { name: string })?.name || 'Farmacia'}
                                </p>
                                <p className="text-sm text-ink-muted">
                                  {(referral.pharmacy as { city: string })?.city}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-ink-secondary">
                            {referral.medications_summary as string || 'Sin especificar'}
                          </td>
                          <td className="px-6 py-4 text-sm text-ink-muted">
                            {format(new Date(referral.created_at as string), 'dd MMM yyyy', { locale: es })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              referral.status === 'redeemed'
                                ? 'bg-green-100 text-green-700'
                                : referral.status === 'sent'
                                ? 'bg-yellow-100 text-yellow-700'
                                : referral.status === 'viewed'
                                ? 'bg-blue-100 text-blue-700'
                                : referral.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : referral.status === 'expired'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-secondary-100 text-secondary-700'
                            }`}>
                              {referral.status === 'redeemed' ? 'Canjeado' :
                               referral.status === 'sent' ? 'Enviado' :
                               referral.status === 'viewed' ? 'Visto' :
                               referral.status === 'cancelled' ? 'Cancelado' :
                               referral.status === 'expired' ? 'Expirado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <p className="text-ink-secondary mb-2">Sin referidos aún</p>
                  <p className="text-sm text-ink-muted">
                    Cuando envíes una referencia a farmacia, aparecerá aquí
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 bg-primary-50 rounded-xl p-6 border border-primary-100">
              <h4 className="font-semibold text-primary-900 mb-2">💰 ¿Cómo funcionan las ganancias?</h4>
              <ul className="text-sm text-primary-800 space-y-2">
                <li>• <strong>Tarifa fija:</strong> 50 MXN por cada paciente que canjea su receta</li>
                <li>• <strong>Comisión:</strong> 3-5% del valor de los medicamentos comprados</li>
                <li>• <strong>Tarifa de plataforma:</strong> Se deduce el 20% de la tarifa fija</li>
                <li>• <strong>Pago mensual:</strong> Las ganancias se pagan a fin de mes</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-8 text-center">
            <p className="text-ink-muted">Cargando información...</p>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
