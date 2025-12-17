// Componente simple y reutilizable - Header del dashboard
import Link from 'next/link'

type DashboardHeaderProps = {
  title?: string
  userName: string
  badge?: {
    text: string
    color: 'green' | 'yellow' | 'blue'
  }
}

export function DashboardHeader({
  title = 'Doctory',
  userName,
  badge
}: DashboardHeaderProps) {
  const badgeColors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
          {title}
        </Link>

        <div className="flex items-center gap-4">
          {badge && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColors[badge.color]}`}>
              {badge.text}
            </span>
          )}

          <span className="text-sm text-gray-600">{userName}</span>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
