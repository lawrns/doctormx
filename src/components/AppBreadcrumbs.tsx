'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumbs, BreadcrumbItem, HomeIcon } from './Breadcrumbs'

// Map of route segments to Spanish labels
const routeLabels: Record<string, string> = {
  'app': 'Dashboard',
  'appointments': 'Mis Citas',
  'chat': 'Mensajes',
  'profile': 'Mi Perfil',
  'ai-consulta': 'Consulta IA',
  'followups': 'Seguimientos',
  'second-opinion': 'Segunda Opinión',
  'upload-image': 'Análisis de Imagen',
  'premium': 'Premium',
}

export function AppBreadcrumbs() {
  const pathname = usePathname()
  
  if (!pathname) return null
  
  // Don't show breadcrumbs on the main dashboard
  if (pathname === '/app') return null
  
  const segments = pathname.split('/').filter(Boolean)
  
  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/app',
      icon: <HomeIcon className="w-4 h-4" />,
    },
  ]
  
  let currentPath = ''
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    
    // Skip 'app' segment as it's the home
    if (segment === 'app') continue
    
    // Check if this is a dynamic segment (UUID or ID)
    const isDynamicSegment = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || 
                             /^\d+$/.test(segment)
    
    const isLast = i === segments.length - 1
    
    if (isDynamicSegment) {
      items.push({
        label: 'Detalle',
        href: isLast ? undefined : currentPath,
      })
    } else {
      // Regular segment
      items.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
      })
    }
  }
  
  return (
    <div className="px-6 lg:px-8 pt-6 pb-2">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={items} />
      </div>
    </div>
  )
}
