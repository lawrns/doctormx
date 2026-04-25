import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { AdminShell } from '@/components/AdminShell'
import type { Doctor } from '@/types'

export default async function AdminDashboard() {
  const { profile, supabase } = await requireRole('admin')

  // Get pending doctors
  const { data: pendingDoctors } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles (full_name, email, phone)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Get all doctors count by status
  const { count: draftCount } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  const { count: pendingCount } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: approvedCount } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: patientsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')

  return (
    <AdminShell profile={{ full_name: profile.full_name }} currentPath="/admin">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground mb-8">
          Gestiona doctores, usuarios y contenido de la plataforma
        </p>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doctores Aprobados</p>
                <p className="text-2xl font-bold text-foreground">{approvedCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-2xl font-bold text-foreground">{draftCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes</p>
                <p className="text-2xl font-bold text-foreground">{patientsCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/doctors"
            className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Gestionar Doctores</h3>
                <p className="text-sm text-muted-foreground">Ver y verificar</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/outbound"
            className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Outbound WhatsApp</h3>
                <p className="text-sm text-muted-foreground">Pipeline de adquisición</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/specialties"
            className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Especialidades</h3>
                <p className="text-sm text-muted-foreground">Gestionar catálogo</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Analytics</h3>
                <p className="text-sm text-muted-foreground">Reportes y métricas</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Pending Doctors */}
        <div className="bg-card rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              Doctores Pendientes de Verificación
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingDoctors?.length || 0} pendientes
            </span>
          </div>
          <div className="p-6">
            {!pendingDoctors || pendingDoctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No hay doctores pendientes de verificación</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDoctors.map((doctor: Doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-lg p-4 hover:bg-secondary/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Dr. {doctor.profile.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{doctor.profile.email}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {doctor.city}, {doctor.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/doctors/${doctor.id}`}
                          className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary"
                        >
                          Revisar
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </AdminShell>
  )
}
