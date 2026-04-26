import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { AdminShell } from '@/components/AdminShell'
import { AdminLinkCard } from '@/components/AdminLinkCard'
import {
  BarChart3,
  Bell,
  MessageCircle,
  Pill,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react'
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
          <div className="bg-card p-[var(--space-4)] rounded-lg shadow">
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

          <div className="bg-card p-[var(--space-4)] rounded-lg shadow">
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

          <div className="bg-card p-[var(--space-4)] rounded-lg shadow">
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

          <div className="bg-card p-[var(--space-4)] rounded-lg shadow">
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
        <div className="mb-8 space-y-6">
          {/* Monitoreo */}
          <div>
            <h3 className="font-semibold text-[hsl(var(--ink))] mb-3">Monitoreo</h3>
            <div className="grid grid-cols-2 gap-3">
              <AdminLinkCard href="/admin/analytics" label="Analytics" icon={BarChart3} />
              <AdminLinkCard href="/admin/doctors" label="Doctores" icon={Stethoscope} />
            </div>
          </div>

          {/* Adquisición */}
          <div>
            <h3 className="font-semibold text-[hsl(var(--ink))] mb-3">Adquisición</h3>
            <div className="grid grid-cols-2 gap-3">
              <AdminLinkCard href="/admin/outbound" label="WhatsApp Outbound" icon={MessageCircle} />
              <AdminLinkCard href="/admin/specialties" label="Especialidades" icon={Stethoscope} />
            </div>
          </div>
        </div>

        {/* Pending Doctors */}
        <div className="bg-card rounded-lg shadow">
          <div className="px-[var(--space-4)] py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              Doctores Pendientes de Verificación
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingDoctors?.length || 0} pendientes
            </span>
          </div>
          <div className="p-[var(--space-4)]">
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
