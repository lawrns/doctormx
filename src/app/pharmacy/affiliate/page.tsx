import { requireRole } from '@/lib/auth'
import { getPharmacyByEmail, getPharmacyReferrals, getPharmacyStats } from '@/lib/pharmacy'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default async function PharmacyAffiliateDashboard() {
  const { user } = await requireRole('doctor')

  const pharmacy = await getPharmacyByEmail(user.email || '')

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes una cuenta de farmacia asociada. Si deseas unirte al programa de referidos,
            contacta a Doctory.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Volver al inicio
          </Link>
        </div>
        </div>
    )
  }

  const stats = await getPharmacyStats(pharmacy.id)
  const referrals = await getPharmacyReferrals(pharmacy.id)

  const recentReferrals = referrals.slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Doctory</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🏥 Farmacia Asociada
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{pharmacy.name}</span>
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Farmacia Asociada
          </h2>
          <p className="text-gray-600">
            Gestiona tus referidos y comisiones
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReferrals}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Canjeados</p>
                <p className="text-2xl font-bold text-green-600">{stats.redeemedReferrals}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Información de la Cuenta
            </h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{pharmacy.name}</h4>
                <p className="text-sm text-gray-600">{pharmacy.address}</p>
                <p className="text-sm text-gray-600">{pharmacy.city}, {pharmacy.state}</p>
                <p className="text-sm text-gray-600 mt-2">Email: {pharmacy.contact_email}</p>
                {pharmacy.contact_phone && (
                  <p className="text-sm text-gray-600">Teléfono: {pharmacy.contact_phone}</p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Comisiones</h4>
                <p className="text-sm text-gray-600">Tarifa de Comisión: {pharmacy.commission_rate}%</p>
                <p className="text-sm text-gray-600">Tarifa Fija por Referido: {formatCurrency(pharmacy.fixed_fee_cents)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Estado: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {pharmacy.status === 'approved' ? 'Aprobado' : pharmacy.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Referidos Recientes
            </h3>
            <span className="text-sm text-gray-600">{referrals.length} referidos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Medicamentos</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Expira</th>
                </tr>
              </thead>
              <tbody>
                {recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No hay referidos todavía
                    </td>
                  </tr>
                ) : (
                  recentReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b last:border-0">
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {referral.referral_code}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(referral.medications || []).join(', ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(referral.created_at), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'redeemed'
                            ? 'bg-green-100 text-green-800'
                            : referral.status === 'sent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {referral.status === 'redeemed' ? 'Canjeado' : 
                           referral.status === 'sent' ? 'Enviado' : 
                           referral.status === 'pending' ? 'Pendiente' : referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(referral.expires_at), 'dd MMM yyyy', { locale: es })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
