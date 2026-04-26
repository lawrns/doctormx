import { requireRole } from '@/lib/auth'
import { getAllPharmacies } from '@/lib/pharmacy'
import { formatCurrency } from '@/lib/utils'
import { AdminShell } from '@/components/AdminShell'
import { EmptyState } from '@/components/EmptyState'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default async function AdminPharmacyPage() {
  const { profile, supabase } = await requireRole('admin')

  let pharmacies: Awaited<ReturnType<typeof getAllPharmacies>> = []
  try {
    pharmacies = await getAllPharmacies()
  } catch (err) {
    console.error('Failed to load pharmacies:', err)
  }

  const pendingPharmacies = pharmacies.filter((p) => p.status === 'pending')
  const approvedPharmacies = pharmacies.filter((p) => p.status === 'approved')

  let allReferrals: any[] | null = null
  try {
    const { data } = await supabase
      .from('pharmacy_referrals')
      .select('status, pharmacy_id')
    allReferrals = data
  } catch (err) {
    console.error('Failed to load referrals:', err)
  }

  let allCommissions: any[] | null = null
  try {
    const { data } = await supabase
      .from('pharmacy_commissions')
      .select('total_payout_cents, pharmacy_id')
    allCommissions = data
  } catch (err) {
    console.error('Failed to load commissions:', err)
  }

  const totalReferrals = allReferrals?.length || 0
  const totalRevenue = allCommissions?.reduce((sum: number, c: { total_payout_cents: number | null }) => sum + (c.total_payout_cents || 0), 0) || 0

  return (
    <AdminShell profile={{ full_name: profile.full_name }} currentPath="/admin/pharmacy">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Gestión de Farmacias</h1>
        <p className="text-muted-foreground mt-1">Administra farmacias afiliadas, comisiones y referidos</p>
      </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Farmacias</p>
            <p className="text-3xl font-bold text-foreground">{pharmacies.length}</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingPharmacies.length}</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Aprobadas</p>
            <p className="text-3xl font-bold text-primary">{approvedPharmacies.length}</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Referidos</p>
            <p className="text-3xl font-bold text-primary">{totalReferrals}</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Farmacias Aprobadas
              </h3>
            </div>
            <div className="p-6">
              {approvedPharmacies.length === 0 ? (
                <EmptyState iconName="wallet" title="No hay farmacias aprobadas" description="Las farmacias aprobadas aparecerán aquí." variant="subtle" />
              ) : (
                <div className="space-y-4">
                  {approvedPharmacies.slice(0, 5).map((pharmacy) => {
                    const pharmacyReferrals = allReferrals?.filter((r: { pharmacy_id: string }) => r.pharmacy_id === pharmacy.id) || []
                    const pharmacyRevenue = allCommissions
                      ?.filter((c: { pharmacy_id: string; total_payout_cents: number | null }) => c.pharmacy_id === pharmacy.id)
                      .reduce((sum: number, c: { total_payout_cents: number | null }) => sum + (c.total_payout_cents || 0), 0) || 0

                    return (
                      <div key={pharmacy.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center overflow-hidden">
                             {pharmacy.logo_url ? (
                               
                               
                              <img src={pharmacy.logo_url} alt={pharmacy.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{pharmacy.name}</p>
                            <p className="text-sm text-muted-foreground">{pharmacy.city}, {pharmacy.state}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{pharmacyReferrals.length} referidos</p>
                          <p className="text-sm text-primary">{formatCurrency(pharmacyRevenue)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Solicitudes Pendientes
              </h3>
            </div>
            <div className="p-6">
              {pendingPharmacies.length === 0 ? (
                <EmptyState iconName="wallet" title="No hay solicitudes pendientes" description="Todas las farmacias han sido revisadas." />
              ) : (
                <div className="space-y-4">
                  {pendingPharmacies.map((pharmacy) => (
                    <div key={pharmacy.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-foreground">{pharmacy.name}</p>
                          <p className="text-sm text-muted-foreground">{pharmacy.contact_email}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pharmacy.city}, {pharmacy.state}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
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

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              Todas las Farmacias
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Farmacia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Comisión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarifa Fija</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pharmacies.map((pharmacy) => {
                      const pharmacyReferrals = allReferrals?.filter((r: { pharmacy_id: string; status: string }) => r.pharmacy_id === pharmacy.id) || []
                      const redeemed = pharmacyReferrals.filter((r: { status: string }) => r.status === 'redeemed').length

                  return (
                    <tr key={pharmacy.id} className="hover:bg-secondary/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                            {pharmacy.logo_url ? (
                              
                              <img src={pharmacy.logo_url} alt={pharmacy.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{pharmacy.name}</p>
                            <p className="text-xs text-muted-foreground">{pharmacyReferrals.length} referidos ({redeemed} canjeados)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{pharmacy.contact_email}</p>
                        <p className="text-sm text-muted-foreground">{pharmacy.contact_phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{pharmacy.city}</p>
                        <p className="text-sm text-muted-foreground">{pharmacy.state}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {pharmacy.commission_rate}%
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatCurrency(pharmacy.fixed_fee_cents || 5000)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          pharmacy.status === 'approved'
                            ? 'bg-primary/10 text-green-700'
                            : pharmacy.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : pharmacy.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-secondary text-muted-foreground'
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
                          className="text-sm text-primary hover:text-primary"
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
    </AdminShell>
  )
}
