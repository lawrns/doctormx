import {
  Search,
  Calendar,
  MessageCircle,
  User,
  ClipboardList,
  Image as ImageIcon,
  Sparkles,
  Users,
  Home,
  Stethoscope,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bot,
} from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/appointments'
import { PatientDashboardContent, HealthTips, QuickStats } from '@/components/PatientDashboardContent'
import { WelcomeBanner } from '@/components/OnboardingChecklist'
import Link from 'next/link'
import type { Appointment, Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Sidebar Navigation Component
function Sidebar({ userName }: { userName: string }) {
  const navItems = [
    { href: '/', icon: Home, label: 'Inicio', isExternal: true },
    { href: '/app', icon: LayoutDashboard, label: 'Dashboard', isActive: true },
    { href: '/app/ai-consulta', icon: Bot, label: 'Consulta IA', highlight: true },
    { href: '/doctors', icon: Stethoscope, label: 'Buscar Doctor' },
    { href: '/app/appointments', icon: Calendar, label: 'Mis Citas' },
    { href: '/app/chat', icon: MessageCircle, label: 'Mensajes' },
    { href: '/app/followups', icon: ClipboardList, label: 'Seguimientos' },
    { href: '/app/upload-image', icon: ImageIcon, label: 'Análisis Imagen' },
    { href: '/app/profile', icon: User, label: 'Mi Perfil' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Doctor.mx</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.highlight
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                : item.isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.highlight ? 'text-white' : ''}`} />
            <span>{item.label}</span>
            {item.highlight && <Sparkles className="w-4 h-4 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500">Paciente</p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <Button
            variant="ghost"
            type="submit"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}

import { LayoutDashboard } from 'lucide-react'

export default async function PatientDashboard() {
  const { user, profile } = await requireRole('patient')
  const appointments = await getPatientAppointments(user.id)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
      completed: 'bg-blue-50 text-primary-500 border-blue-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-gray-50 text-gray-600 border-gray-200',
      refunded: 'bg-gray-50 text-gray-600 border-gray-200',
    }
    return styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar userName={profile?.full_name || 'Usuario'} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Doctor.mx</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{profile?.full_name?.split(' ')[0]}</span>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit" className="text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
          
          {/* Mobile Quick Links */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            <Link href="/app/ai-consulta">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 py-1.5">
                <Bot className="w-3.5 h-3.5 mr-1" />
                Consulta IA
              </Badge>
            </Link>
            <Link href="/doctors">
              <Badge variant="secondary" className="px-3 py-1.5">Buscar Doctor</Badge>
            </Link>
            <Link href="/app/appointments">
              <Badge variant="secondary" className="px-3 py-1.5">Mis Citas</Badge>
            </Link>
            <Link href="/">
              <Badge variant="outline" className="px-3 py-1.5">Inicio</Badge>
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Hero CTA - AI Consultation */}
          <div className="mb-8">
            <Link href="/app/ai-consulta">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-8 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bot className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Nuevo</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Consulta con IA Multi-Especialista</h1>
                    <p className="text-lg text-blue-100 mb-4">Obtén un diagnóstico preliminar con consenso de 4 especialistas virtuales</p>
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8"
                    >
                      Iniciar Consulta IA
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Welcome Banner */}
          <WelcomeBanner patientName={profile?.full_name?.split(' ')[0] || 'Usuario'} />

          {/* Review Trigger */}
          <PatientDashboardContent appointments={appointments as Array<Appointment & { doctor: Doctor }>} />

        {/* Quick Stats */}
        <QuickStats appointments={appointments as Appointment[]} />

        {/* Health Tips */}
        <HealthTips />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/app/ai-consulta">
            <Card className="group p-6 border-gradient-to-r from-blue-200 to-cyan-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl hover:border-blue-400 transition-all h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Nuevo</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">Consulta Multi-Especialista</h3>
                    <p className="text-sm text-gray-500">4 especialistas • Consenso IA</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/doctors">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Buscar Doctor</h3>
                  <p className="text-sm text-gray-500">Encuentra especialistas</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/appointments">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Mis Consultas</h3>
                  <p className="text-sm text-gray-500">Ver historial</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/chat">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Mensajes</h3>
                  <p className="text-sm text-gray-500">Chatea con doctores</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/profile">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Mi Perfil</h3>
                  <p className="text-sm text-gray-500">Configuración</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Additional Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/app/followups">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Seguimientos</h3>
                  <p className="text-sm text-gray-500">Ver mensajes de doctores</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/upload-image">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Subir Imagen</h3>
                  <p className="text-sm text-gray-500">Análisis médico con IA</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/premium">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Premium</h3>
                  <p className="text-sm text-gray-500">Funciones IA avanzadas</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Appointments */}
        <Card className="overflow-hidden border-gray-200">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consultas Recientes
            </h2>
            <Link href="/app/appointments" className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="p-6">
            {!appointments || appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2">No tienes consultas aún</p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Buscar un doctor
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment: Appointment & { doctor: Doctor }) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Dr. {appointment.doctor.profile.full_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(appointment.start_ts).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(appointment.status)}>
                        {appointment.status === 'pending_payment' && 'Pendiente de pago'}
                        {appointment.status === 'confirmed' && 'Confirmada'}
                        {appointment.status === 'completed' && 'Completada'}
                        {appointment.status === 'cancelled' && 'Cancelada'}
                        {appointment.status === 'no_show' && 'No asistió'}
                        {appointment.status === 'refunded' && 'Reembolsada'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Doctor.mx</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </div>
  )
}
