// Componente simple - Tarjeta de acción rápida
import Link from 'next/link'
import { ReactNode } from 'react'

type QuickActionCardProps = {
  href: string
  icon: ReactNode
  title: string
  description: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export function QuickActionCard({ 
  href, 
  icon, 
  title, 
  description,
  color = 'blue'
}: QuickActionCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}
