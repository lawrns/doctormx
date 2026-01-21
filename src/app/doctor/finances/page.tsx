import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { Badge, EmptyState } from '@/components'
import { Wallet } from 'lucide-react'

function formatCurrency(cents: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type LedgerEntryType = 'charge' | 'fee' | 'refund' | 'payout'

function getLedgerTypeLabel(type: LedgerEntryType) {
  const labels: Record<LedgerEntryType, string> = {
    charge: 'Cobro',
    fee: 'Comisión',
    refund: 'Reembolso',
    payout: 'Pago',
  }
  return labels[type] || type
}

function getLedgerTypeBadge(type: LedgerEntryType) {
  const variants: Record<LedgerEntryType, 'success' | 'warning' | 'error' | 'info'> = {
    charge: 'success',
    fee: 'warning',
    refund: 'error',
    payout: 'info',
  }
  return variants[type] || 'neutral'
}

export default async function DoctorFinancesPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status, currency')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca completó onboarding
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  // Si doctor es null (cache) o no está aprobado, mostrar como pending
  const isPending = !doctor || doctor.status !== 'approved'

  // Fetch financial data
  let monthlyIncome = 0
  let pendingAmount = 0
  let totalPaid = 0
  let ledgerEntries: Array<{
    id: string
    type: LedgerEntryType
    amount_cents: number
    description: string | null
    created_at: string
  }> = []

  if (!isPending) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    // Get monthly income (charges this month)
    const { data: monthlyCharges } = await supabase
      .from('ledger_entries')
      .select('amount_cents')
      .eq('doctor_id', user.id)
      .eq('type', 'charge')
      .gte('created_at', startOfMonth)
      .lt('created_at', endOfMonth)

    if (monthlyCharges) {
      monthlyIncome = monthlyCharges.reduce((sum, entry) => sum + entry.amount_cents, 0)
    }

    // Get pending payouts
    const { data: pendingPayouts } = await supabase
      .from('payouts')
      .select('amount_cents')
      .eq('doctor_id', user.id)
      .eq('status', 'pending')

    if (pendingPayouts) {
      pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount_cents, 0)
    }

    // Get total paid out
    const { data: paidPayouts } = await supabase
      .from('payouts')
      .select('amount_cents')
      .eq('doctor_id', user.id)
      .eq('status', 'paid')

    if (paidPayouts) {
      totalPaid = paidPayouts.reduce((sum, payout) => sum + payout.amount_cents, 0)
    }

    // Get recent ledger entries
    const { data: entries } = await supabase
      .from('ledger_entries')
      .select('id, type, amount_cents, description, created_at')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (entries) {
      ledgerEntries = entries as Array<{
        id: string
        type: LedgerEntryType
        amount_cents: number
        description: string | null
        created_at: string
      }>
    }
  }

  const currency = doctor?.currency || 'MXN'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/finances">
      <div className="max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Finanzas</h2>
        <p className="text-gray-600 mb-8">Gestiona tus pagos y transacciones</p>

        {isPending ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-900">
              Esta sección estará disponible una vez que tu perfil sea aprobado.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
                <p className="text-sm text-gray-600 mb-1">Ingresos este mes</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  {formatCurrency(monthlyIncome, currency)}
                </p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
                <p className="text-sm text-gray-600 mb-1">Pendiente de cobro</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                  {formatCurrency(pendingAmount, currency)}
                </p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
                <p className="text-sm text-gray-600 mb-1">Total cobrado</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatCurrency(totalPaid, currency)}
                </p>
              </div>
            </div>

            {/* Transacciones */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transacciones recientes</h3>

              {ledgerEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(entry.created_at)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant={getLedgerTypeBadge(entry.type)}>
                              {getLedgerTypeLabel(entry.type)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.description || '—'}
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${
                            entry.type === 'charge' ? 'text-green-600' :
                            entry.type === 'refund' || entry.type === 'fee' ? 'text-red-600' :
                            'text-gray-900'
                          }`}>
                            {entry.type === 'fee' || entry.type === 'refund' ? '-' : '+'}
                            {formatCurrency(Math.abs(entry.amount_cents), currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No hay transacciones"
                  description="Las transacciones aparecerán aquí cuando recibas pagos por tus consultas."
                  icon={Wallet}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
