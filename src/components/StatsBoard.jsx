import { useEffect, useState } from 'react'

export default function StatsBoard() {
  const [stats, setStats] = useState({
    online: 0,
    responseTime: 0,
    consultations: 0,
    rating: 0
  })

  useEffect(() => {
    // Animate numbers counting up
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setStats({
        online: Math.floor(47 * progress),
        responseTime: (1.8 * progress).toFixed(1),
        consultations: Math.floor(1247 * progress),
        rating: (4.9 * progress).toFixed(1)
      })

      if (step >= steps) {
        clearInterval(timer)
        setStats({
          online: 47,
          responseTime: 1.8,
          consultations: 1247,
          rating: 4.9
        })
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-ink-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-medical-500"></span>
        </div>
        <h3 className="text-sm font-semibold text-ink-primary">En tiempo real</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Online doctors */}
        <div className="bg-white rounded-xl p-4 border border-ink-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-ink-secondary">Doctores</span>
          </div>
          <div className="text-2xl font-bold text-ink-primary">{stats.online}</div>
          <div className="text-xs text-medical-600 font-medium">en línea</div>
        </div>

        {/* Response time */}
        <div className="bg-white rounded-xl p-4 border border-ink-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs text-ink-secondary">Respuesta</span>
          </div>
          <div className="text-2xl font-bold text-ink-primary">{stats.responseTime}</div>
          <div className="text-xs text-brand-600 font-medium">minutos</div>
        </div>

        {/* Consultations today */}
        <div className="bg-white rounded-xl p-4 border border-ink-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs text-ink-secondary">Hoy</span>
          </div>
          <div className="text-2xl font-bold text-ink-primary">{stats.consultations.toLocaleString()}</div>
          <div className="text-xs text-medical-600 font-medium">consultas</div>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl p-4 border border-ink-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs text-ink-secondary">Calificación</span>
          </div>
          <div className="text-2xl font-bold text-ink-primary">{stats.rating}</div>
          <div className="text-xs text-yellow-600 font-medium">de 5.0</div>
        </div>
      </div>
    </div>
  )
}
