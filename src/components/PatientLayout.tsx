'use client'

import { Calendar, MessageCircle, User, ClipboardList, Image as ImageIcon, Sparkles, Users, Home, Stethoscope, LogOut, Bot, LayoutDashboard, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface PatientLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  icon: any
  label: string
  highlight?: boolean
  badge?: { count?: number; dot?: boolean; color?: string }
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [badges, setBadges] = useState({
    messages: 0,
    appointmentsJoinable: false,
  })

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    loadProfile()
  }, [])

  // Check for joinable video appointments (within 15 minutes)
  useEffect(() => {
    async function checkBadges() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        let messagesCount = 0
        let joinableAppointment = false

        // Check for messages - wrap in try/catch as table may not exist
        try {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .is('read_at', null)
          messagesCount = count || 0
        } catch (e) {
          // chat_messages table may not exist yet
          console.log('chat_messages check failed:', e)
        }

        // Check for joinable appointments (within 15 minutes, have video_room_url, and are video type)
        try {
          const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000).toISOString()
          const { data: appointments } = await supabase
            .from('appointments')
            .select('id, start_ts, video_room_url')
            .eq('patient_id', user.id)
            .in('status', ['confirmed', 'pending_payment'])
            .lte('start_ts', fifteenMinutesFromNow)
            .order('start_ts', { ascending: true })

          joinableAppointment = appointments?.some((apt: { video_room_url: string | null; start_ts: string }) =>
            apt.video_room_url && new Date(apt.start_ts) <= new Date(Date.now() + 15 * 60 * 1000)
          ) || false
        } catch (e) {
          // Appointments query may fail due to schema issues
          console.log('Appointments check failed:', e)
        }

        setBadges({
          messages: messagesCount,
          appointmentsJoinable: joinableAppointment,
        })
      } catch (error) {
        console.error('Error checking badges:', error)
      }
    }

    checkBadges()
    // Refresh badges every 30 seconds
    const interval = setInterval(checkBadges, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems: NavItem[] = [
    { href: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app/ai-consulta', icon: Bot, label: 'Consulta IA', highlight: true },
    { href: '/app/second-opinion', icon: Users, label: 'IA Multi-Especialista' },
    { href: '/doctors', icon: Stethoscope, label: 'Buscar Doctor' },
    {
      href: '/app/appointments',
      icon: Calendar,
      label: 'Mis Citas',
      badge: { dot: badges.appointmentsJoinable, color: 'bg-green-500' }
    },
    {
      href: '/app/chat',
      icon: MessageCircle,
      label: 'Mensajes',
      badge: badges.messages > 0 ? { count: badges.messages, color: 'bg-red-500' } : undefined
    },
    { href: '/app/followups', icon: ClipboardList, label: 'Seguimientos' },
    { href: '/app/upload-image', icon: ImageIcon, label: 'Análisis Imagen' },
    { href: '/app/profile', icon: User, label: 'Mi Perfil' },
  ]

  const isActive = (href: string) => {
    // For root paths like /app, only match exactly (not /app/something)
    if (href === '/app') {
      return pathname === href
    }
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Doctor.mx</span>
            </Link>
          </div>
          <Link href="/app/ai-consulta">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Bot className="w-4 h-4 mr-1" />
              Consulta
            </Button>
          </Link>
        </div>
      </header>

      {/* Sidebar - Desktop (always visible) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Doctor.mx</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.highlight && isActive(item.href) ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : isActive(item.href) ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge?.dot && (
                <span className={`w-2 h-2 rounded-full ${item.badge.color || 'bg-red-500'}`} />
              )}
              {item.badge?.count && item.badge.count > 0 && (
                <span className={`min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold text-white ${item.badge.color || 'bg-red-500'} flex items-center justify-center`}>
                  {item.badge.count > 99 ? '99+' : item.badge.count}
                </span>
              )}
              {item.highlight && isActive(item.href) && <Sparkles className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-gray-500">Paciente</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" type="submit" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Sidebar (slides in) */}
      <aside
        className={`
          fixed lg:hidden inset-y-0 left-0 z-50 w-72 bg-white border-r transform transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile sidebar header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Doctor.mx</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.highlight && isActive(item.href) ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : isActive(item.href) ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge?.dot && (
                <span className={`w-2 h-2 rounded-full ${item.badge.color || 'bg-red-500'}`} />
              )}
              {item.badge?.count && item.badge.count > 0 && (
                <span className={`min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold text-white ${item.badge.color || 'bg-red-500'} flex items-center justify-center`}>
                  {item.badge.count > 99 ? '99+' : item.badge.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-gray-500">Paciente</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" type="submit" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
