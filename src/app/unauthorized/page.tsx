// Unauthorized Access Page
// Shown when users attempt to access resources they don't have permission for

import Link from 'next/link'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 p-6 rounded-full">
            <ShieldX className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Acceso No Autorizado
          </h1>
          <p className="text-gray-600">
            No tienes permiso para acceder a esta página.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
          <p className="text-sm text-yellow-800">
            <strong>¿Por qué estás viendo esto?</strong>
          </p>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li>Tu cuenta no tiene el rol requerido</li>
            <li>Tu sesión puede haber expirado</li>
            <li>La página que buscas no existe</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Ir a Mi Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Página Principal
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          Si crees que esto es un error, contacta a soporte
        </p>
      </div>
    </div>
  )
}
