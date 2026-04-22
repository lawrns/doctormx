'use client'

import { Calendar, MessageCircle, User, ClipboardList, Home, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PatientLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  icon: any
  label: string
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

        // Check for unread chat messages using existing conversation and receipt schema
        try {
          const { data: conversations } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('patient_id', user.id)

          const conversationIds = conversations?.map((conversation: { id: string }) => conversation.id) || []

          if (conversationIds.length > 0) {
            const { data: incomingMessages } = await supabase
              .from('chat_messages')
              .select('id')
              .in('conversation_id', conversationIds)
              .neq('sender_id', user.id)

            const messageIds = incomingMessages?.map((message: { id: string }) => message.id) || []

            if (messageIds.length > 0) {
              const { data: receipts } = await supabase
                .from('chat_message_receipts')
                .select('message_id')
                .eq('user_id', user.id)
                .in('message_id', messageIds)

              const readMessageIds = new Set((receipts || []).map((receipt: { message_id: string }) => receipt.message_id))
              messagesCount = messageIds.filter((messageId: string) => !readMessageIds.has(messageId)).length
            }
          }
        } catch (e) {
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
    { href: '/app', icon: Home, label: 'Inicio' },
    {
      href: '/app/appointments',
      icon: Calendar,
      label: 'Citas',
      badge: { dot: badges.appointmentsJoinable, color: 'bg-green-500' }
    },
    {
      href: '/app/chat',
      icon: MessageCircle,
      label: 'Chat',
      badge: badges.messages > 0 ? { count: badges.messages, color: 'bg-red-500' } : undefined
    },
    { href: '/app/followups', icon: ClipboardList, label: 'Seguimientos' },
    { href: '/app/profile', icon: User, label: 'Perfil' },
  ]

  const isActive = (href: string) => {
    // For root paths like /app, only match exactly (not /app/something)
    if (href === '/app') {
      return pathname === href
    }
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <header className="lg:hidden glass-nav sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-md text-muted-foreground hover:bg-secondary"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <DoctorMxLogo />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background sticky top-0 h-screen">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2.5">
              <DoctorMxLogo />
            </Link>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge?.dot && (
                  <span className={cn("w-2 h-2 rounded-full", item.badge.color || 'bg-red-500')} />
                )}
                {item.badge?.count && item.badge.count > 0 && (
                  <span className={cn("min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center", item.badge.color || 'bg-red-500')}>
                    {item.badge.count > 99 ? '99+' : item.badge.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{profile?.full_name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">Paciente</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* Mobile Sidebar (slides in) */}
        <aside
          className={cn(
            "fixed lg:hidden inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <DoctorMxLogo />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md text-muted-foreground hover:bg-secondary"
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge?.dot && (
                  <span className={cn("w-2 h-2 rounded-full", item.badge.color || 'bg-red-500')} />
                )}
                {item.badge?.count && item.badge.count > 0 && (
                  <span className={cn("min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center", item.badge.color || 'bg-red-500')}>
                    {item.badge.count > 99 ? '99+' : item.badge.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{profile?.full_name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">Paciente</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
