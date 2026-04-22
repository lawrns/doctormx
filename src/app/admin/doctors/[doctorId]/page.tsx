import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type DoctorDetail = {
  id: string
  status: string
  specialty: string | null
  license_number: string | null
  bio: string | null
  city: string | null
  state: string | null
  years_experience: number | null
  is_listed: boolean | null
  created_at: string
  profile?: { full_name: string | null; email: string | null; phone: string | null } | { full_name: string | null; email: string | null; phone: string | null }[] | null
  doctor_subscriptions?: Array<{ status: string; tier: string | null; billing_interval: string | null; current_period_end: string | null }> | null
  doctor_verifications?: Array<{ cedula: string; sep_verified: boolean; verification_data: Record<string, unknown> | null; verified_at: string | null }> | null
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-md bg-secondary p-4 text-xs text-foreground">
      {JSON.stringify(data || {}, null, 2)}
    </pre>
  )
}

export default async function AdminDoctorDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = await params
  const { supabase } = await requireRole('admin')

  const { data } = await supabase
    .from('doctors')
    .select(`
      id,
      status,
      specialty,
      license_number,
      bio,
      city,
      state,
      years_experience,
      is_listed,
      created_at,
      profile:profiles(id, full_name, email, phone),
      doctor_subscriptions(status, tier, billing_interval, current_period_end),
      doctor_verifications(cedula, sep_verified, verification_data, verified_at)
    `)
    .eq('id', doctorId)
    .single()

  if (!data) notFound()

  const doctor = data as unknown as DoctorDetail
  const profile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
  const verification = doctor.doctor_verifications?.[0]
  const confidence = verification?.verification_data?.confidence
  const matchDetails = verification?.verification_data?.matchDetails

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/admin/doctors" className="text-2xl font-bold text-foreground">
            Doctor.mx Admin
          </Link>
          <Link href="/admin/verify" className="text-sm font-medium text-primary">
            Verificacion
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{profile?.full_name || 'Doctor'}</h1>
          <p className="text-muted-foreground">{profile?.email || 'Sin email'} · {profile?.phone || 'Sin telefono'}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Perfil</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{doctor.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Directorio</p>
                  <p className="font-medium">{doctor.is_listed ? 'Visible' : 'Oculto'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Especialidad</p>
                  <p className="font-medium">{doctor.specialty || 'Pendiente'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cedula</p>
                  <p className="font-medium">{doctor.license_number || verification?.cedula || 'Pendiente'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experiencia</p>
                  <p className="font-medium">{doctor.years_experience ? `${doctor.years_experience} anos` : 'Pendiente'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicacion</p>
                  <p className="font-medium">{[doctor.city, doctor.state].filter(Boolean).join(', ') || 'Pendiente'}</p>
                </div>
              </div>
              {doctor.bio ? <p className="mt-4 text-sm text-muted-foreground">{doctor.bio}</p> : null}
            </div>

            <div className="rounded-lg border bg-card p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Revision SEP</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Verificado</p>
                  <p className="font-medium">{verification?.sep_verified ? 'Si' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confianza</p>
                  <p className="font-medium">{typeof confidence === 'number' ? `${confidence}%` : 'Sin dato'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coincidencia</p>
                  <p className="font-medium">{typeof matchDetails === 'object' && matchDetails ? JSON.stringify(matchDetails) : 'Sin dato'}</p>
                </div>
              </div>
              <div className="mt-4">
                <JsonBlock data={verification?.verification_data} />
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Suscripciones</h2>
              {doctor.doctor_subscriptions?.length ? (
                <div className="space-y-3">
                  {doctor.doctor_subscriptions.map((sub, index) => (
                    <div key={`${sub.status}-${index}`} className="rounded-md border p-3">
                      <p className="font-medium">{sub.tier || 'Plan'} · {sub.status}</p>
                      <p className="text-sm text-muted-foreground">{sub.billing_interval || 'intervalo'} · vence {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('es-MX') : 'sin fecha'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay suscripciones registradas.</p>
              )}
            </div>
          </section>

          <aside className="rounded-lg border bg-card p-6 shadow h-fit">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Acciones</h2>
            <form action="/api/admin/verify-doctor" method="POST" className="space-y-3">
              <input type="hidden" name="doctorId" value={doctor.id} />
              <input type="hidden" name="redirectTo" value={`/admin/doctors/${doctor.id}`} />
              <textarea
                name="note"
                className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
                placeholder="Nota interna o mensaje para el doctor"
              />
              <button name="action" value="approve" className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white">
                Aprobar
              </button>
              <button name="action" value="request_docs" className="w-full rounded-md border border-yellow-600 px-4 py-2 font-medium text-yellow-700">
                Solicitar documentos
              </button>
              <button name="action" value="reject" className="w-full rounded-md border border-red-600 px-4 py-2 font-medium text-red-700">
                Rechazar
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  )
}
