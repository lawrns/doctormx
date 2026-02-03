import { Users, FileText, Building2, Star } from 'lucide-react'

const stats = [
  { value: '500+', label: 'Doctores con cédula verificada', icon: Users },
  { value: '10,000+', label: 'Consultas realizadas', icon: FileText },
  { value: '50+', label: 'Especialidades médicas', icon: Building2 },
  { value: '98%', label: 'Satisfacción de pacientes', icon: Star },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Números que respaldan nuestra misión
          </h2>
          <p className="text-lg text-gray-600">
            Datos actualizados • Enero 2025
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-blue-600" />
              </div>
              {/* Value */}
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              {/* Label */}
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 mt-12">
          Estadísticas basadas en datos internos de Doctor.mx. Satisfacción medida por encuestas post-consulta.
        </p>
      </div>
    </section>
  )
}
