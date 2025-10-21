import { useState, useEffect } from 'react';
import Icon from './ui/Icon';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Card from './ui/Card';
import Alert from './ui/Alert';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: 'chart-bar' },
    { id: 'appointments', label: 'Citas', icon: 'calendar-days' },
    { id: 'patients', label: 'Pacientes', icon: 'users' },
    { id: 'profile', label: 'Perfil', icon: 'user' },
    { id: 'prescriptions', label: 'Recetas', icon: 'document-text' },
    { id: 'payments', label: 'Pagos', icon: 'currency-dollar' },
    { id: 'settings', label: 'Configuración', icon: 'cog-6-tooth' }
  ];

  useEffect(() => {
    // Simulate loading doctor data
    const mockDoctor = {
      id: 1,
      full_name: "Dr. María González",
      specialty: "Cardiología",
      email: "maria.gonzalez@doctor.mx",
      phone: "+52 55 1234 5678",
      cedula: "12345678",
      experience_years: 15,
      rating_avg: 4.8,
      total_reviews: 156,
      consultation_fees: {
        base_fee: 1200,
        telemedicine_fee: 960,
        follow_up_fee: 800
      },
      availability: {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "09:00", end: "13:00", available: true },
        sunday: { start: "", end: "", available: false }
      }
    };

    const mockAppointments = [
      {
        id: 1,
        patient_name: "Ana Martínez",
        patient_email: "ana.martinez@email.com",
        type: "presencial",
        date: "2024-01-20",
        time: "10:00",
        status: "confirmed",
        reason: "Consulta de seguimiento",
        notes: "Paciente con hipertensión controlada"
      },
      {
        id: 2,
        patient_name: "Carlos Rodríguez",
        patient_email: "carlos.rodriguez@email.com",
        type: "telemedicina",
        date: "2024-01-20",
        time: "14:00",
        status: "pending",
        reason: "Primera consulta",
        notes: ""
      },
      {
        id: 3,
        patient_name: "Laura Sánchez",
        patient_email: "laura.sanchez@email.com",
        type: "presencial",
        date: "2024-01-21",
        time: "11:30",
        status: "confirmed",
        reason: "Evaluación cardiológica",
        notes: "Paciente refiere dolor en el pecho"
      }
    ];

    setTimeout(() => {
      setDoctor(mockDoctor);
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalAppointments: appointments.length,
    confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length,
    pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
    totalPatients: 89,
    monthlyEarnings: 45600,
    averageRating: doctor?.rating_avg || 4.8
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Panel de Control
              </h1>
              <p className="text-neutral-600">
                Bienvenido, {doctor?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="success" size="sm">
                <Icon name="check-circle" size="xs" className="mr-1" />
                Verificado
              </Badge>
              <Button variant="outline" size="sm" icon="cog-6-tooth">
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalAppointments}</p>
              </div>
              <Icon name="calendar-days" size="lg" className="text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pacientes</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalPatients}</p>
              </div>
              <Icon name="users" size="lg" className="text-accent-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Calificación</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.averageRating}/5</p>
              </div>
              <Icon name="star" size="lg" className="text-warning-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Ingresos Mes</p>
                <p className="text-2xl font-bold text-neutral-900">${stats.monthlyEarnings.toLocaleString()}</p>
              </div>
              <Icon name="currency-dollar" size="lg" className="text-success-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-8">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon name={tab.icon} size="sm" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Próximas Citas
                    </h3>
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div>
                            <p className="font-medium text-neutral-900">{appointment.patient_name}</p>
                            <p className="text-sm text-neutral-600">{appointment.time} - {appointment.type}</p>
                          </div>
                          <Badge 
                            variant={appointment.status === 'confirmed' ? 'success' : 'warning'} 
                            size="sm"
                          >
                            {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Reseñas Recientes
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon key={star} name="star" size="sm" className="text-yellow-400" />
                          ))}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Excelente atención</p>
                          <p className="text-xs text-neutral-500">Por Ana M. - Hace 2 días</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon key={star} name="star" size="sm" className="text-yellow-400" />
                          ))}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Muy profesional</p>
                          <p className="text-xs text-neutral-500">Por Carlos R. - Hace 5 días</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Gestión de Citas
                  </h3>
                  <Button variant="primary" size="sm" icon="plus">
                    Nueva Cita
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Paciente</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Fecha</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Hora</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Tipo</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-neutral-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-neutral-900">{appointment.patient_name}</p>
                              <p className="text-sm text-neutral-500">{appointment.patient_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-700">{appointment.date}</td>
                          <td className="py-3 px-4 text-neutral-700">{appointment.time}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" size="sm">
                              {appointment.type === 'presencial' ? 'Presencial' : 'Telemedicina'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={appointment.status === 'confirmed' ? 'success' : 'warning'} 
                              size="sm"
                            >
                              {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" icon="eye">
                                Ver
                              </Button>
                              <Button variant="ghost" size="sm" icon="pencil">
                                Editar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Información del Perfil
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold text-neutral-900 mb-4">Información Básica</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={doctor?.full_name}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Especialidad</label>
                        <input
                          type="text"
                          value={doctor?.specialty}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Cédula Profesional</label>
                        <input
                          type="text"
                          value={doctor?.cedula}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold text-neutral-900 mb-4">Tarifas</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Consulta General</label>
                        <input
                          type="number"
                          value={doctor?.consultation_fees?.base_fee}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Telemedicina</label>
                        <input
                          type="number"
                          value={doctor?.consultation_fees?.telemedicine_fee}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Seguimiento</label>
                        <input
                          type="number"
                          value={doctor?.consultation_fees?.follow_up_fee}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" size="lg">
                    <Icon name="check" size="sm" className="mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {!['overview', 'appointments', 'profile'].includes(activeTab) && (
              <div className="text-center py-12">
                <Icon name="cog-6-tooth" size="xl" className="text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-neutral-600">
                  Esta sección está en desarrollo y estará disponible pronto.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
