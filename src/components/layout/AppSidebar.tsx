'use client'

import * as React from 'react'
import {
  Bot,
  Calendar,
  ChevronRight,
  ClipboardList,
  ImageIcon,
  LayoutDashboard,
  MessageCircle,
  Stethoscope,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        url: '/app',
        icon: LayoutDashboard,
      },
      {
        title: 'Consulta IA',
        url: '/app/ai-consulta',
        icon: Bot,
        isNew: true,
      },
      {
        title: 'Multi-Especialista',
        url: '/app/second-opinion',
        icon: Users,
      },
    ],
  },
  {
    title: 'Citas y Doctores',
    items: [
      {
        title: 'Buscar Doctor',
        url: '/doctors',
        icon: Stethoscope,
      },
      {
        title: 'Mis Citas',
        url: '/app/appointments',
        icon: Calendar,
      },
      {
        title: 'Mensajes',
        url: '/app/chat',
        icon: MessageCircle,
      },
    ],
  },
  {
    title: 'Salud',
    items: [
      {
        title: 'Seguimientos',
        url: '/app/followups',
        icon: ClipboardList,
      },
      {
        title: 'Análisis Imagen',
        url: '/app/upload-image',
        icon: ImageIcon,
      },
      {
        title: 'Mi Perfil',
        url: '/app/profile',
        icon: User,
      },
    ],
  },
]

interface AppSidebarProps {
  user?: {
    full_name?: string
    email?: string
  } | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === '/app') {
      return pathname === url
    }
    return pathname === url || pathname?.startsWith(url + '/')
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-100 p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 group-data-[collapsible=icon]:hidden">
            Doctor.mx
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.isNew && (
                          <span className="ml-auto flex h-5 items-center rounded-full bg-blue-100 px-2 text-xs font-medium text-blue-700">
                            Nuevo
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || 'Usuario'}
            </span>
            <span className="text-xs text-gray-500 truncate">{user?.email}</span>
          </div>
        </div>
        <form action="/auth/signout" method="post" className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors group-data-[collapsible=icon]:justify-center"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="group-data-[collapsible=icon]:hidden">
              Cerrar sesión
            </span>
          </button>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
