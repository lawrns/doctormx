                  <li>
                    <Link
                      to="/dashboard/broadcasts"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard/broadcasts'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BellRing size={20} className="mr-3" />
                      <span>Mensajes</span>
                    </Link>
                  </li>import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, User, Settings, LogOut, 
  Users, BarChart, Zap, AlertCircle, 
  MessageSquare, Clipboard, Star,
  Shield, CheckCircle, Heart, BellRing
} from 'lucide-react';
import ReferralLinkGenerator from '../components/connect/ReferralLinkGenerator';
import BroadcastCreator from '../components/doctor/BroadcastCreator';
import BroadcastList from '../components/doctor/BroadcastList';

// Mock data for doctor
const mockDoctorData = {
  name: 'Dra. Ana García',
  specialty: 'Medicina General',
  email: 'ana.garcia@example.com',
  phone: '+52 55 1234 5678',
  address: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México',
  verified: true,
  premium: true,
  premiumUntil: new Date('2025-09-14'), // 6 months from now
  stats: {
    appointments: 235,
    patients: 154,
    rating: 4.9,
    reviews: 87
  },
  recentAppointments: [
    {
      id: '1',
      patient: 'Juan Pérez',
      date: '2025-03-15T10:00:00',
      type: 'in-person',
      status: 'confirmed'
    },
    {
      id: '2',
      patient: 'María Rodríguez',
      date: '2025-03-15T11:00:00',
      type: 'in-person',
      status: 'confirmed'
    },
    {
      id: '3',
      patient: 'Carlos López',
      date: '2025-03-15T12:00:00',
      type: 'telemedicine',
      status: 'confirmed'
    },
    {
      id: '4',
      patient: 'Laura Sánchez',
      date: '2025-03-16T09:00:00',
      type: 'in-person',
      status: 'pending'
    }
  ]
};

function DoctorDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const remainingPremiumDays = () => {
    const now = new Date();
    const premiumEnd = new Date(mockDoctorData.premiumUntil);
    const diffTime = premiumEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {user?.email?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-900">{mockDoctorData.name}</h2>
                    <p className="text-gray-600 text-sm">{mockDoctorData.specialty}</p>
                  </div>
                </div>
                {mockDoctorData.premium && (
                  <div className="mt-4 bg-blue-50 rounded-md p-3 flex items-start">
                    <Shield className="text-blue-600 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Premium activo</p>
                      <p className="text-xs text-blue-700">
                        {remainingPremiumDays()} días restantes
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart size={20} className="mr-3" />
                      <span>Panel principal</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/appointments"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard/appointments'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Calendar size={20} className="mr-3" />
                      <span>Citas</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/broadcasts"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard/broadcasts'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BellRing size={20} className="mr-3" />
                      <span>Mensajes</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/connect"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard/connect'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Zap size={20} className="mr-3" />
                      <span>Doctor.mx Connect</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/profile"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard/profile'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User size={20} className="mr-3" />
                      <span>Perfil</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/settings"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/dashboard/settings'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Settings size={20} className="mr-3" />
                      <span>Configuración</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut size={20} className="mr-3" />
                      <span>Cerrar sesión</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="mt-6 bg-blue-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">Soporte prioritario</h3>
              <p className="text-blue-100 mb-4">
                Como miembro Premium, tienes acceso a soporte prioritario.
              </p>
              <Link
                to="/contacto"
                className="inline-block w-full py-2 px-4 bg-white text-blue-600 font-medium rounded-lg text-center hover:bg-blue-50 transition-colors"
              >
                Contactar soporte
              </Link>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route index element={<DashboardTab doctorData={mockDoctorData} />} />
              <Route path="connect" element={<ConnectTab />} />
              <Route path="profile" element={<ProfileTab doctorData={mockDoctorData} />} />
              <Route path="broadcasts" element={<BroadcastsTab />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ doctorData }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel principal</h1>
        <p className="text-gray-600">
          Bienvenido de nuevo, {doctorData.name.split(' ')[0]}. Aquí tienes un resumen de tu actividad.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats cards */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Citas</p>
              <h3 className="text-2xl font-semibold text-gray-900">{doctorData.stats.appointments}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pacientes</p>
              <h3 className="text-2xl font-semibold text-gray-900">{doctorData.stats.patients}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Calificación</p>
              <h3 className="text-2xl font-semibold text-gray-900">{doctorData.stats.rating}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reseñas</p>
              <h3 className="text-2xl font-semibold text-gray-900">{doctorData.stats.reviews}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium status */}
      {doctorData.premium && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <Shield className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-semibold">Estado Premium activo</h3>
              </div>
              <p className="text-blue-100">
                Tu membresía Premium está activa hasta el {new Date(doctorData.premiumUntil).toLocaleDateString('es-MX')}
              </p>
            </div>
            <div>
              <Link
                to="/dashboard/connect"
                className="inline-flex items-center bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Zap size={16} className="mr-2" />
                Invitar colegas
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Upcoming appointments section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {doctorData.recentAppointments.map((appointment) => (
            <div key={appointment.id} className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium text-gray-900">{appointment.patient}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {new Date(appointment.date).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(appointment.date).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                  
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.type === 'telemedicine' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {appointment.type === 'telemedicine' ? 'Telemedicina' : 'Presencial'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 text-center">
          <Link to="/dashboard/appointments" className="text-blue-600 font-medium hover:text-blue-800">
            Ver todas las citas
          </Link>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Horarios de consulta</h3>
          <p className="text-gray-600 text-sm mb-4">
            Configura tus horarios de disponibilidad para citas.
          </p>
          <button className="btn-outline w-full">
            Administrar horarios
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <Clipboard className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Registros médicos</h3>
          <p className="text-gray-600 text-sm mb-4">
            Accede a los registros médicos de tus pacientes.
          </p>
          <button className="btn-outline w-full">
            Ver registros
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-3 rounded-full mb-4">
            <Heart className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Mejorar perfil</h3>
          <p className="text-gray-600 text-sm mb-4">
            Actualiza tu perfil para atraer más pacientes.
          </p>
          <Link to="/dashboard/profile" className="btn-outline w-full">
            Editar perfil
          </Link>
        </div>
      </div>
    </div>
  );
}

// Connect Tab Component
function ConnectTab() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor.mx Connect</h1>
        <p className="text-gray-600">
          Invita a tus colegas a unirse a la plataforma y obtén beneficios exclusivos.
        </p>
      </div>
      
      <ReferralLinkGenerator />
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ doctorData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: doctorData.name,
    specialty: doctorData.specialty,
    email: doctorData.email,
    phone: doctorData.phone,
    address: doctorData.address,
    bio: 'Médico general con más de 10 años de experiencia en medicina familiar. Especializada en atención preventiva y manejo de condiciones crónicas.',
    education: [
      {
        institution: 'Universidad Nacional Autónoma de México',
        degree: 'Licenciatura en Medicina',
        year: '2010'
      },
      {
        institution: 'Hospital General de México',
        degree: 'Residencia en Medicina Familiar',
        year: '2014'
      }
    ],
    certifications: [
      {
        name: 'Certificación del Consejo Mexicano de Medicina Familiar',
        year: '2015'
      }
    ],
    languages: ['Español', 'Inglés'],
    specialInterests: ['Medicina preventiva', 'Salud de la mujer', 'Control de diabetes']
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call
    setTimeout(() => {
      setIsEditing(false);
      // Update user data would happen here
    }, 1000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-outline"
          >
            Editar perfil
          </button>
        )}
      </div>
      
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-4xl">
                      {doctorData.name.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-2">
                    {doctorData.verified && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Verificado
                      </div>
                    )}
                    
                    {doctorData.premium && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield size={12} className="mr-1" />
                        Premium
                      </div>
                    )}
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Cambiar foto
                  </button>
                </div>
              </div>
              
              <div className="md:w-2/3 md:pl-8">
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="input-field"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                          Especialidad
                        </label>
                        <input
                          type="text"
                          id="specialty"
                          name="specialty"
                          className="input-field"
                          value={formData.specialty}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="input-field"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="input-field"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Dirección del consultorio
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="input-field"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                          Biografía profesional
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          className="input-field"
                          value={formData.bio}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn-outline"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{doctorData.name}</h2>
                    <p className="text-blue-600 font-medium mb-4">{doctorData.specialty}</p>
                    
                    <p className="text-gray-700 mb-4">{formData.bio}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Correo electrónico</h3>
                        <p className="text-gray-900">{doctorData.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                        <p className="text-gray-900">{doctorData.phone}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Dirección del consultorio</h3>
                        <p className="text-gray-900">{doctorData.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((language) => (
                        <span key={language} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {language}
                        </span>
                      ))}
                      
                      {formData.specialInterests.map((interest) => (
                        <span key={interest} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Educación</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {formData.education.map((item, index) => (
                <div key={index} className="border-l-2 border-blue-600 pl-4">
                  <h3 className="font-medium text-gray-900">{item.institution}</h3>
                  <p className="text-gray-600">{item.degree}</p>
                  <p className="text-sm text-gray-500">{item.year}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Añadir educación
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Certificaciones</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {formData.certifications.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Shield size={18} className="text-green-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.year}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Añadir certificación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Broadcasts Tab Component
function BroadcastsTab() {
  const [showCreator, setShowCreator] = useState(false);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mensajes a Pacientes</h1>
        <p className="text-gray-600">
          Mantén informados a tus pacientes con mensajes, consejos de salud y actualizaciones.
        </p>
      </div>
      
      {showCreator ? (
        <BroadcastCreator 
          onSuccess={() => setShowCreator(false)}
          onCancel={() => setShowCreator(false)}
        />
      ) : (
        <BroadcastList 
          onCreateNew={() => setShowCreator(true)}
        />
      )}
    </div>
  );
}

export default DoctorDashboardPage;