'use client'

import { Calendar, MessageCircle, User, ClipboardList, Image as ImageIcon, Sparkles, Users, Home, Stethoscope, LogOut, Bot, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface PatientLayoutProps {
  children: React.ReactNode
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)

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

  const navItems = [
    { href: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app/ai-consulta', icon: Bot, label: 'Consulta IA', highlight: true },
    { href: '/app/second-opinion', icon: Users, label: 'IA Multi-Especialista' },
    { href: '/doctors', icon: Stethoscope, label: 'Buscar Doctor' },
    { href: '/app/appointments', icon: Calendar, label: 'Mis Citas' },
    { href: '/app/chat', icon: MessageCircle, label: 'Mensajes' },
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
              <span>{item.label}</span>
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
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
