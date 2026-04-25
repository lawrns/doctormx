'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import {
  LayoutDashboard, Users, PhoneCall, TrendingUp, Shield,
  ArrowRightLeft, BarChart3, Star, Activity, LogOut
} from 'lucide-react'

interface AdminShellProps {
  children: ReactNode
  profile: { full_name: string; id?: string }
  currentPath?: string
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Doctores', href: '/admin/doctors', icon: Users },
  { name: 'Outbound', href: '/admin/outbound', icon: PhoneCall },
  { name: 'Churn', href: '/admin/churn', icon: ArrowRightLeft },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Farmacias', href: '/admin/pharmacy', icon: Activity },
  { name: 'Premium', href: '/admin/premium', icon: Star },
]

export function AdminShell({ children, profile, currentPath = '/admin' }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <DoctorMxLogo />
            </Link>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Admin
          </span>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-card sticky top-0 h-screen">
          <div className="p-5">
            <Link href="/" className="flex items-center gap-2.5">
              <DoctorMxLogo />
            </Link>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* Mobile sidebar (slides in) */}
        <aside
          className={cn(
            "fixed lg:hidden inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-200 ease-dx",
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-semibold text-foreground">Admin</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md text-muted-foreground hover:bg-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border mt-auto">
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="w-full justify-start text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
