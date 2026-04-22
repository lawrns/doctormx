import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { Check } from 'lucide-react'

type PendingDoctor = {
  id: string
  specialty?: string | null
  bio?: string | null
  license_number?: string | null
  years_experience?: number | null
  city?: string | null
  state?: string | null
  price_cents?: number | null
  currency?: string | null
  profile?: { full_name?: string | null; email?: string | null; phone?: string | null } | Array<{ full_name?: string | null; email?: string | null; phone?: string | null }> | null
}

function getProfile(doctor: PendingDoctor) {
  return Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
}

export default async function AdminVerificationPage() {
  const { supabase } = await requireRole('admin')

  // Obtener doctores pendientes con sus documentos
  const { data: pendingDoctors } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles (id, full_name, email, phone)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/admin" className="text-2xl font-bold text-foreground">
            Doctor.mx Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verificación de doctores
          </h1>
          <p className="text-muted-foreground">
            Revisa y aprueba doctores pendientes de verificación
          </p>
        </div>

        {!pendingDoctors || pendingDoctors.length === 0 ? (
          <div className="bg-card rounded-lg shadow p-12 text-center">
            <p className="text-muted-foreground">No hay doctores pendientes de verificación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(pendingDoctors as PendingDoctor[]).map((doctor) => {
              const profile = getProfile(doctor)
              const priceCents = doctor.price_cents || 0

              return (
              <div key={doctor.id} className="bg-card rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Dr. {profile?.full_name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile?.email || 'Sin email'}</p>
                    {profile?.phone && (
                      <p className="text-sm text-muted-foreground">{profile.phone}</p>
                    )}
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Pendiente
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Cédula profesional</p>
                    <p className="font-medium text-foreground">
                      {doctor.license_number || 'No proporcionada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experiencia</p>
                    <p className="font-medium text-foreground">
                      {doctor.years_experience ? `${doctor.years_experience} años` : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium text-foreground">
                      {doctor.city && doctor.state
                        ? `${doctor.city}, ${doctor.state}`
                        : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de consulta</p>
                    <p className="font-medium text-foreground">
                      ${(priceCents / 100).toFixed(2)} {doctor.currency || 'MXN'}
                    </p>
                  </div>
                </div>

                {doctor.bio && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Biografía</p>
                    <p className="text-muted-foreground">{doctor.bio}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <form action="/api/admin/verify-doctor" method="POST" className="flex-1">
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <input type="hidden" name="action" value="approve" />
                    <input type="hidden" name="redirectTo" value="/admin/verify" />
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      <Check className="w-4 h-4 inline mr-1" />Aprobar
                    </button>
                  </form>

                  <Link
                    href={`/admin/doctors/${doctor.id}`}
                    className="flex-1 border border-border text-muted-foreground py-2 rounded-lg hover:bg-secondary/50 font-medium text-center"
                  >
                    Ver detalles
                  </Link>

                  <form action="/api/admin/verify-doctor" method="POST" className="flex-1">
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <input type="hidden" name="action" value="request_docs" />
                    <input type="hidden" name="redirectTo" value="/admin/verify" />
                    <button
                      type="submit"
                      className="w-full border border-yellow-600 text-yellow-700 py-2 rounded-lg hover:bg-yellow-50 font-medium"
                    >
                      Solicitar docs
                    </button>
                  </form>

                  <form action="/api/admin/verify-doctor" method="POST" className="flex-1">
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <input type="hidden" name="action" value="reject" />
                    <input type="hidden" name="redirectTo" value="/admin/verify" />
                    <button
                      type="submit"
                      className="w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 font-medium"
                    >
                      ✗ Rechazar
                    </button>
                  </form>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
