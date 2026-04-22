import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle, Search } from 'lucide-react'

type SearchParams = {
  status?: string
}

type DoctorRow = {
  id: string
  status: string
  specialty: string | null
  license_number: string | null
  city: string | null
  state: string | null
  is_listed: boolean | null
  created_at: string
  profile?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null
  doctor_subscriptions?: Array<{ status: string; tier: string | null; current_period_end: string | null }> | null
  doctor_verifications?: Array<{ sep_verified: boolean; verification_data: Record<string, unknown> | null }> | null
}

function statusIcon(status: string) {
  if (status === 'approved') return <CheckCircle className="h-4 w-4 text-green-600" />
  if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-600" />
  return <Clock className="h-4 w-4 text-yellow-600" />
}

function getConfidence(row: DoctorRow) {
  const verification = row.doctor_verifications?.[0]
  const confidence = verification?.verification_data?.confidence
  return typeof confidence === 'number' ? `${confidence}%` : 'Sin dato'
}

export default async function AdminDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { supabase } = await requireRole('admin')
  const params = await searchParams
  const status = params.status || 'pending'

  let query = supabase
    .from('doctors')
    .select(`
      id,
      status,
      specialty,
      license_number,
      city,
      state,
      is_listed,
      created_at,
      profile:profiles(id, full_name, email),
      doctor_subscriptions(status, tier, current_period_end),
      doctor_verifications(sep_verified, verification_data)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  const doctors = (data || []) as unknown as DoctorRow[]

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/admin" className="text-2xl font-bold text-foreground">
            Doctor.mx Admin
          </Link>
          <Link href="/admin/verify" className="text-sm font-medium text-primary">
            Cola de verificacion
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Doctores</h1>
            <p className="text-muted-foreground">Gestiona verificacion, suscripcion y visibilidad del directorio.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected', 'draft', 'all'].map((item) => (
              <Link
                key={item}
                href={`/admin/doctors?status=${item}`}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${status === item ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-secondary'}`}
              >
                {item === 'all' ? 'Todos' : item}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Doctor</span>
            <span>Estado</span>
            <span>SEP</span>
            <span>Suscripcion</span>
            <span className="text-right">Accion</span>
          </div>
          {doctors.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
              <Search className="h-5 w-5" />
              No hay doctores para este filtro.
            </div>
          ) : (
            doctors.map((doctor) => {
              const profile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
              const activeSubscription = doctor.doctor_subscriptions?.find((sub) => sub.status === 'active')
              return (
                <div key={doctor.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b px-5 py-4 last:border-b-0">
                  <div>
                    <p className="font-medium text-foreground">{profile?.full_name || 'Doctor sin nombre'}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email || 'Sin email'}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialty || 'Especialidad pendiente'} · {doctor.city || 'Ciudad pendiente'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {statusIcon(doctor.status)}
                    <span>{doctor.status}</span>
                    {doctor.is_listed ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Listado</span> : null}
                  </div>
                  <div className="text-sm">
                    <p>{doctor.license_number || 'Sin cedula'}</p>
                    <p className="text-muted-foreground">{getConfidence(doctor)}</p>
                  </div>
                  <div className="text-sm">
                    {activeSubscription ? (
                      <>
                        <p className="font-medium">{activeSubscription.tier || 'Plan activo'}</p>
                        <p className="text-muted-foreground">Activa</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Sin suscripcion activa</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Link href={`/admin/doctors/${doctor.id}`} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                      Revisar
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
