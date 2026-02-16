'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';

export function ConsultaHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Consulta Multi-Especialista</h1>
            <p className="text-xs text-gray-500">4 especialistas • Consenso médico IA</p>
          </div>
        </div>
        <Link
          href="/app"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Volver
        </Link>
      </div>
    </header>
  );
}
