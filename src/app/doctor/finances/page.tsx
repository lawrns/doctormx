import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { EmptyState } from '@/components'
import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDoctorInsuranceClaims } from '@/lib/insurance'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    fee: 'Comisi\u00F3n',
    refund: 'Reembolso',
    payout: 'Pago',
  }
  return labels[type] || type
}

function getLedgerTypeBadge(type: LedgerEntryType) {
  const variants: Record<LedgerEntryType, 'success' | 'warning' | 'destructive' | 'info'> = {
    charge: 'success',
    fee: 'warning',
    refund: 'destructive',
    payout: 'info',
  }
  return variants[type] || 'default'
}

function getClaimStatusLabel(status: string) {
  const labels: Record<string, string> = {
    eligibility_checked: 'Elegibilidad',
    pending_folio: 'Folio pendiente',
    submitted: 'Enviado',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    paid: 'Pagado',
  }

  return labels[status] || status
}

function getClaimStatusBadge(status: string) {
  const variants: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'default'> = {
    eligibility_checked: 'info',
    pending_folio: 'warning',
    submitted: 'info',
    approved: 'success',
    rejected: 'destructive',
    paid: 'success',
  }

  return variants[status] || 'default'
}

export default async function DoctorFinancesPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status, currency')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca complet\u00F3 onboarding
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  // Si doctor es null (cache) o no est\u00E1 aprobado, mostrar como pending
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
  let insuranceClaims: Awaited<ReturnType<typeof getDoctorInsuranceClaims>> = []

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
      monthlyIncome = monthlyCharges.reduce((sum: number, entry: { amount_cents: number }) => sum + entry.amount_cents, 0)
    }

    // Get pending payouts
    const { data: pendingPayouts } = await supabase
      .from('payouts')
      .select('amount_cents')
      .eq('doctor_id', user.id)
      .eq('status', 'pending')

    if (pendingPayouts) {
      pendingAmount = pendingPayouts.reduce((sum: number, payout: { amount_cents: number }) => sum + payout.amount_cents, 0)
    }

    // Get total paid out
    const { data: paidPayouts } = await supabase
      .from('payouts')
      .select('amount_cents')
      .eq('doctor_id', user.id)
      .eq('status', 'paid')

    if (paidPayouts) {
      totalPaid = paidPayouts.reduce((sum: number, payout: { amount_cents: number }) => sum + payout.amount_cents, 0)
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

    insuranceClaims = await getDoctorInsuranceClaims(user.id)
  }

  const currency = doctor?.currency || 'MXN'
  const pendingClaimAmount = insuranceClaims
    .filter((claim: any) => !['paid', 'rejected'].includes(claim.status))
    .reduce((sum: number, claim: any) => sum + Number(claim.reimbursement_amount_cents || 0), 0)
  const paidClaimAmount = insuranceClaims
    .filter((claim: any) => claim.status === 'paid')
    .reduce((sum: number, claim: any) => {
      return sum + Number(claim.reimbursement_amount_cents_final || claim.reimbursement_amount_cents || 0)
    }, 0)

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/finances">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Finanzas</h2>
        <p className="text-muted-foreground mb-8">Gestiona tus pagos y transacciones</p>

        {isPending ? (
          <Card className="rounded-xl border border-border shadow-dx-1 p-6">
            <p className="text-foreground">
              Esta secci\u00F3n estar\u00E1 disponible una vez que tu perfil sea aprobado.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="rounded-xl border border-border shadow-dx-1 p-4 md:p-6 gap-2">
                <p className="text-sm text-muted-foreground mb-1">Ingresos este mes</p>
                <p className="text-2xl md:text-3xl font-bold text-vital">
                  {formatCurrency(monthlyIncome, currency)}
                </p>
              </Card>
              <Card className="rounded-xl border border-border shadow-dx-1 p-4 md:p-6 gap-2">
                <p className="text-sm text-muted-foreground mb-1">Pendiente de cobro</p>
                <p className="text-2xl md:text-3xl font-bold text-amber">
                  {formatCurrency(pendingAmount, currency)}
                </p>
              </Card>
              <Card className="rounded-xl border border-border shadow-dx-1 p-4 md:p-6 gap-2">
                <p className="text-sm text-muted-foreground mb-1">Total cobrado</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {formatCurrency(totalPaid, currency)}
                </p>
              </Card>
            </div>

            <Card className="rounded-xl border border-border shadow-dx-1 p-6 gap-4">
              <CardHeader className="p-0 pb-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Reclamos de seguro</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Seguimiento de copagos, folios y reembolsos por aseguradora.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[280px]">
                    <div className="rounded-lg border border-border bg-secondary/40 p-3">
                      <p className="text-muted-foreground">Por recuperar</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatCurrency(pendingClaimAmount, currency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/40 p-3">
                      <p className="text-muted-foreground">Recuperado</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatCurrency(paidClaimAmount, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {insuranceClaims.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Aseguradora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Reembolso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insuranceClaims.map((claim: any) => {
                        const appointment = Array.isArray(claim.appointment)
                          ? claim.appointment[0]
                          : claim.appointment
                        const patient = Array.isArray(claim.patient)
                          ? claim.patient[0]
                          : claim.patient
                        const patientInsurance = Array.isArray(claim.patient_insurance)
                          ? claim.patient_insurance[0]
                          : claim.patient_insurance
                        const insurance = Array.isArray(patientInsurance?.insurance)
                          ? patientInsurance.insurance[0]
                          : patientInsurance?.insurance

                        return (
                          <TableRow key={claim.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {appointment?.start_ts ? formatDate(appointment.start_ts) : formatDate(claim.created_at)}
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              {patient?.full_name || 'Paciente'}
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-vital" />
                                <span>{insurance?.name || 'Aseguradora'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant={getClaimStatusBadge(claim.status)} className="rounded-lg">
                                {getClaimStatusLabel(claim.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-foreground whitespace-nowrap">
                              {formatCurrency(
                                Number(claim.reimbursement_amount_cents_final || claim.reimbursement_amount_cents || 0),
                                currency
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    title="No hay reclamos"
                    description="Cuando una cita use seguro, el reclamo aparecera aqui para seguimiento."
                    iconName="wallet"
                  />
                )}
              </CardContent>
            </Card>

            {/* Transacciones */}
            <Card className="rounded-xl border border-border shadow-dx-1 p-6 gap-4">
              <CardHeader className="p-0 pb-0">
                <CardTitle className="text-xl font-semibold">Transacciones recientes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {ledgerEntries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descripci\u00F3n</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(entry.created_at)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={getLedgerTypeBadge(entry.type)}>
                              {getLedgerTypeLabel(entry.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {entry.description || '\u2014'}
                          </TableCell>
                          <TableCell className={`text-sm font-medium text-right whitespace-nowrap ${
                            entry.type === 'charge' ? 'text-vital' :
                            entry.type === 'refund' || entry.type === 'fee' ? 'text-coral' :
                            'text-foreground'
                          }`}>
                            {entry.type === 'fee' || entry.type === 'refund' ? '-' : '+'}
                            {formatCurrency(Math.abs(entry.amount_cents), currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    title="No hay transacciones"
                    description="Las transacciones aparecer\u00E1n aqu\u00ED cuando recibas pagos por tus consultas."
                    iconName="wallet"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
