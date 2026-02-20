import { requireRole } from '@/lib/auth'
import { getAllPharmacies } from '@/lib/pharmacy'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default async function AdminPharmacyPage() {
  const { profile, supabase } = await requireRole('admin')

  const pharmacies = await getAllPharmacies()

  const pendingPharmacies = pharmacies.filter((p) => p.status === 'pending')
  const approvedPharmacies = pharmacies.filter((p) => p.status === 'approved')

  const { data: allReferrals } = await supabase
    .from('pharmacy_referrals')
    .select('status, pharmacy_id')

  const { data: allCommissions } = await supabase
    .from('pharmacy_commissions')
    .select('total_payout_cents, pharmacy_id')

  const totalReferrals = allReferrals?.length ?? 0
  const totalRevenue = allCommissions?.reduce((sum, c) => sum + (c.total_payout_cents ?? 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-2xl font-bold text-primary-600">
              Doctor.mx Admin
            </Link>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              👑 Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile?.full_name}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Volver al Panel de Administración
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Farmacias Asociadas
          </h2>
          <p className="text-gray-600">
            Administra las farmacias participantes en el programa de referidos
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-gray-600 mb-1">Total Farmacias</p>
            <p className="text-3xl font-bold text-gray-900">{pharmacies.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingPharmacies.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
            <p className="text-3xl font-bold text-green-600">{approvedPharmacies.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-gray-600 mb-1">Total Referidos</p>
            <p className="text-3xl font-bold text-blue-600">{totalReferrals}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-gray-900">
                Farmacias Aprobadas
              </h3>
            </div>
            <div className="p-6">
              {approvedPharmacies.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay farmacias aprobadas</p>
              ) : (
                <div className="space-y-4">
                  {approvedPharmacies.slice(0, 5).map((pharmacy) => {
                    const pharmacyReferrals = allReferrals?.filter((r) => r.pharmacy_id === pharmacy.id) || []
                    const pharmacyRevenue = allCommissions
                      ?.filter((c) => c.pharmacy_id === pharmacy.id)
                      .reduce((sum, c) => sum + (c.total_payout_cents ?? 0), 0) || 0

                    return (
                      <div key={pharmacy.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                             {pharmacy.logo_url ? (
                               
                               
                              <img src={pharmacy.logo_url} alt={pharmacy.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{pharmacy.name}</p>
                            <p className="text-sm text-gray-500">{pharmacy.city}, {pharmacy.state}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{pharmacyReferrals.length} referidos</p>
                          <p className="text-sm text-green-600">{formatCurrency(pharmacyRevenue)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-gray-900">
                Solicitudes Pendientes
              </h3>
            </div>
            <div className="p-6">
              {pendingPharmacies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No hay solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPharmacies.map((pharmacy) => (
                    <div key={pharmacy.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{pharmacy.name}</p>
                          <p className="text-sm text-gray-600">{pharmacy.contact_email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {pharmacy.city}, {pharmacy.state}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Solicitud: {format(new Date(pharmacy.applied_at), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <form action={`/api/pharmacy/affiliate?action=approve&pharmacyId=${pharmacy.id}`} method="POST">
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Aprobar
                            </button>
                          </form>
                          <form action={`/api/pharmacy/affiliate?action=reject&pharmacyId=${pharmacy.id}`} method="POST">
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Rechazar
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Todas las Farmacias
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmacia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifa Fija</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pharmacies.map((pharmacy) => {
                  const pharmacyReferrals = allReferrals?.filter((r) => r.pharmacy_id === pharmacy.id) || []
                  const redeemed = pharmacyReferrals.filter((r) => r.status === 'redeemed').length

                  return (
                    <tr key={pharmacy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {pharmacy.logo_url ? (
                              
                              <img src={pharmacy.logo_url} alt={pharmacy.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{pharmacy.name}</p>
                            <p className="text-xs text-gray-500">{pharmacyReferrals.length} referidos ({redeemed} canjeados)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{pharmacy.contact_email}</p>
                        <p className="text-sm text-gray-500">{pharmacy.contact_phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{pharmacy.city}</p>
                        <p className="text-sm text-gray-500">{pharmacy.state}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pharmacy.commission_rate}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(pharmacy.fixed_fee_cents || 5000)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          pharmacy.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : pharmacy.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : pharmacy.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {pharmacy.status === 'approved' ? 'Aprobada' :
                           pharmacy.status === 'pending' ? 'Pendiente' :
                           pharmacy.status === 'rejected' ? 'Rechazada' :
                           pharmacy.status === 'suspended' ? 'Suspendida' : pharmacy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/pharmacy/${pharmacy.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
