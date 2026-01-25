'use client'

export default function StatsBoard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-6 text-white">
        <p className="text-primary-100 text-sm font-medium">Pacientes atendidos</p>
        <p className="text-3xl font-bold">50K+</p>
      </div>
      <div className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl p-6 text-white">
        <p className="text-accent-100 text-sm font-medium">Doctores activos</p>
        <p className="text-3xl font-bold">200+</p>
      </div>
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm font-medium">Satisfacción</p>
        <p className="text-3xl font-bold">4.8</p>
      </div>
      <div className="bg-gradient-to-br from-warning-400 to-warning-600 rounded-2xl p-6 text-white">
        <p className="text-warning-100 text-sm font-medium">Respuesta</p>
        <p className="text-3xl font-bold">&lt;5min</p>
      </div>
    </div>
  )
}
