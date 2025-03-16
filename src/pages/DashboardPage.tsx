import { useState, useEffect } from 'react';
import { getCurrentUserProfile, getUserMedicalRecords, getUserInsurance, updateUserProfile } from '../lib/api/users';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Clock, User, Settings, LogOut, 
  ChevronRight, MapPin, Video, AlertCircle, CheckCircle, X,
  Users, Heart
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data for appointments
const mockAppointments = [
  {
    id: '1',
    doctor: {
      id: '1',
      name: 'Dra. Ana García',
      specialty: 'Medicina General',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    },
    date: '2025-06-15T10:00:00',
    type: 'in-person',
    address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
    status: 'upcoming'
  },
  {
    id: '2',
    doctor: {
      id: '3',
      name: 'Dra. Laura Sánchez',
      specialty: 'Ginecología',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    },
    date: '2025-06-20T16:30:00',
    type: 'telemedicine',
    status: 'upcoming'
  },
  {
    id: '3',
    doctor: {
      id: '4',
      name: 'Dr. Miguel Ángel Torres',
      specialty: 'Dermatología',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    },
    date: '2025-05-10T11:00:00',
    type: 'in-person',
    address: 'Av. Gonzalitos 123, Col. Mitras Centro',
    status: 'completed'
  },
  {
    id: '4',
    doctor: {
      id: '2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Pediatría',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    },
    date: '2025-05-05T15:00:00',
    type: 'telemedicine',
    status: 'cancelled'
  }
];

// We'll load real user data from Supabase instead of using mock data

function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await getCurrentUserProfile();
        setUserData(profileData);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('No se pudo cargar tu perfil de usuario');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCancelAppointment = (appointmentId) => {
    setCancelAppointmentId(appointmentId);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = () => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setShowCancelModal(false);
      setCancelSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setCancelSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Format date for display
  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  };

  // Format time for display
  const formatAppointmentTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "h:mm a", { locale: es });
  };

  // Get status badge color and text
  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return {
          color: 'bg-blue-100 text-blue-800',
          text: 'Próxima'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'Completada'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          text: 'Cancelada'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: status
        };
    }
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
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-900">{userData?.name || 'Cargando...'}</h2>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>
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
                      <Calendar size={20} className="mr-3" />
                      <span>Mis citas</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/comunidad"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        location.pathname === '/comunidad'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users size={20} className="mr-3" />
                      <span>Mi comunidad</span>
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
                      <span>Mi perfil</span>
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
              <h3 className="font-semibold text-lg mb-2">¿Necesitas ayuda?</h3>
              <p className="text-blue-100 mb-4">
                Nuestro equipo de soporte está disponible para asistirte.
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
              <Route index element={<AppointmentsTab 
                appointments={mockAppointments} 
                onCancelAppointment={handleCancelAppointment}
                cancelSuccess={cancelSuccess}
                formatAppointmentDate={formatAppointmentDate}
                formatAppointmentTime={formatAppointmentTime}
                getStatusBadge={getStatusBadge}
              />} />
              <Route path="profile" element={<ProfileTab user={userData} loading={loading} error={error} />} />
              <Route path="settings" element={<SettingsTab />} />
            </Routes>
          </div>
        </div>
      </div>
      
      {/* Cancel appointment modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cancelar cita</h3>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </p>
              
              <div className="mb-4">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de cancelación (opcional)
                </label>
                <textarea
                  id="cancelReason"
                  rows={3}
                  className="input-field"
                  placeholder="Indica el motivo de la cancelación"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-outline"
                >
                  Volver
                </button>
                <button
                  onClick={confirmCancelAppointment}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Appointments Tab Component
function AppointmentsTab({ appointments, onCancelAppointment, cancelSuccess, formatAppointmentDate, formatAppointmentTime, getStatusBadge }) {
  const [filter, setFilter] = useState('all');
  
  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });
  
  // Group appointments by status
  const upcomingAppointments = appointments.filter(app => app.status === 'upcoming');
  const pastAppointments = appointments.filter(app => app.status === 'completed' || app.status === 'cancelled');
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis citas</h1>
        <Link to="/buscar" className="btn-primary">
          Agendar nueva cita
        </Link>
      </div>
      
      {cancelSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
          <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>La cita ha sido cancelada exitosamente.</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-4 text-sm font-medium ${
                filter === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-4 text-sm font-medium ${
                filter === 'upcoming'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-4 text-sm font-medium ${
                filter === 'completed'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Completadas
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-6 py-4 text-sm font-medium ${
                filter === 'cancelled'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Canceladas
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-6">
              {filteredAppointments.map(appointment => {
                const statusBadge = getStatusBadge(appointment.status);
                
                return (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                            <img 
                              src={appointment.doctor.image} 
                              alt={appointment.doctor.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{appointment.doctor.name}</h3>
                            <p className="text-gray-600">{appointment.doctor.specialty}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar size={18} className="text-gray-500 mr-2" />
                          <span className="text-gray-700">{formatAppointmentDate(appointment.date)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock size={18} className="text-gray-500 mr-2" />
                          <span className="text-gray-700">{formatAppointmentTime(appointment.date)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {appointment.type === 'telemedicine' ? (
                            <>
                              <Video size={18} className="text-gray-500 mr-2" />
                              <span className="text-gray-700">Consulta por telemedicina</span>
                            </>
                          ) : (
                            <>
                              <MapPin size={18} className="text-gray-500 mr-2" />
                              <span className="text-gray-700">{appointment.address}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {appointment.status === 'upcoming' && (
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                          {appointment.type === 'telemedicine' && (
                            <button className="btn-primary">
                              Iniciar consulta
                            </button>
                          )}
                          <button className="btn-outline">
                            Reprogramar
                          </button>
                          <button 
                            onClick={() => onCancelAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-800 font-medium py-2 px-4 rounded-lg border border-red-600 hover:border-red-800 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      
                      {appointment.status === 'completed' && (
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                          <button className="btn-outline">
                            Ver detalles
                          </button>
                          <button className="btn-primary">
                            Agendar seguimiento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes citas {filter !== 'all' ? `${filter}s` : ''} en este momento.</p>
              <Link to="/buscar" className="btn-primary">
                Agendar una cita
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {filter === 'all' && upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                    <img 
                      src={appointment.doctor.image} 
                      alt={appointment.doctor.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{appointment.doctor.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatAppointmentDate(appointment.date)}, {formatAppointmentTime(appointment.date)}</span>
                    </div>
                  </div>
                </div>
                
                <Link to={`/dashboard/appointments/${appointment.id}`} className="text-blue-600 hover:text-blue-800">
                  <ChevronRight size={20} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {filter === 'all' && pastAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historial de citas</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pastAppointments.slice(0, 3).map(appointment => {
              const statusBadge = getStatusBadge(appointment.status);
              
              return (
                <div key={appointment.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                      <img 
                        src={appointment.doctor.image} 
                        alt={appointment.doctor.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{appointment.doctor.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatAppointmentDate(appointment.date)}</span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/dashboard/appointments/${appointment.id}`} className="text-blue-600 hover:text-blue-800">
                    <ChevronRight size={20} />
                  </Link>
                </div>
              );
            })}
          </div>
          
          {pastAppointments.length > 3 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link to="/dashboard/history" className="text-blue-600 font-medium hover:text-blue-800">
                Ver historial completo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user, loading, error }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Add state for medical records
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [medicalLoading, setMedicalLoading] = useState(true);
  const [medicalError, setMedicalError] = useState(null);
  
  // Add state for insurance info
  const [insuranceInfo, setInsuranceInfo] = useState(null);
  const [insuranceLoading, setInsuranceLoading] = useState(true);
  const [insuranceError, setInsuranceError] = useState(null);
  
  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);
  
  // Load medical records and insurance info when component mounts
  useEffect(() => {
    async function loadMedicalData() {
      if (!user) return;
      
      // Load medical records
      try {
        setMedicalLoading(true);
        const records = await getUserMedicalRecords();
        setMedicalRecords(records);
      } catch (err) {
        console.error('Error loading medical records:', err);
        setMedicalError('No se pudieron cargar los registros médicos');
      } finally {
        setMedicalLoading(false);
      }
      
      // Load insurance info
      try {
        setInsuranceLoading(true);
        const insurance = await getUserInsurance();
        setInsuranceInfo(insurance);
      } catch (err) {
        console.error('Error loading insurance info:', err);
        setInsuranceError('No se pudo cargar la información del seguro');
      } finally {
        setInsuranceLoading(false);
      }
    }
    
    loadMedicalData();
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Make the actual API call to update profile
      await updateUserProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSaveError('No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle loading and error states
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-red-600">{error || 'No se pudo cargar la información del perfil'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Intentar nuevamente
        </button>
      </div>
    );
  }
  
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
      
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
          <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>Tu perfil ha sido actualizado exitosamente.</span>
        </div>
      )}
      
      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6">
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
              
              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  className="input-field"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="input-field"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
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
              
              <div>
                <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-1">
                  Seguro médico
                </label>
                <input
                  type="text"
                  id="insurance"
                  name="insurance"
                  className="input-field"
                  value={formData.insurance}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de póliza
                </label>
                <input
                  type="text"
                  id="policyNumber"
                  name="policyNumber"
                  className="input-field"
                  value={formData.policyNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto de emergencia
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  className="input-field"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de emergencia
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  className="input-field"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  required
                />
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
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nombre completo</h3>
                <p className="mt-1 text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Correo electrónico</h3>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                <p className="mt-1 text-gray-900">{user.phone}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha de nacimiento</h3>
                <p className="mt-1 text-gray-900">{new Date(user.birthdate).toLocaleDateString('es-MX')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Género</h3>
                <p className="mt-1 text-gray-900">{user.gender}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                <p className="mt-1 text-gray-900">{user.address}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Seguro médico</h3>
                <p className="mt-1 text-gray-900">{user.insurance || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Número de póliza</h3>
                <p className="mt-1 text-gray-900">{user.policyNumber || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contacto de emergencia</h3>
                <p className="mt-1 text-gray-900">{user.emergencyContact}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teléfono de emergencia</h3>
                <p className="mt-1 text-gray-900">{user.emergencyPhone}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial médico</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Mantén actualizado tu historial médico para que tus médicos puedan brindarte una mejor atención.
          </p>
          
          {medicalLoading ? (
            <p className="text-center text-gray-600 py-4">Cargando historial médico...</p>
          ) : medicalError ? (
            <div className="text-center text-red-600 py-4">{medicalError}</div>
          ) : (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Alergias</h3>
                {medicalRecords?.allergies && medicalRecords.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalRecords.allergies.map((allergy, index) => (
                      <span key={index} className="bg-red-50 text-red-800 px-2 py-1 rounded-full text-sm">
                        {typeof allergy === 'string' ? allergy : allergy.name || 'Alergia'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No se han registrado alergias</p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Medicamentos actuales</h3>
                {medicalRecords?.medications && medicalRecords.medications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalRecords.medications.map((medication, index) => (
                      <span key={index} className="bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {typeof medication === 'string' ? medication : medication.name || 'Medicamento'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No se han registrado medicamentos</p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Condiciones médicas</h3>
                {medicalRecords?.conditions && medicalRecords.conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalRecords.conditions.map((condition, index) => (
                      <span key={index} className="bg-amber-50 text-amber-800 px-2 py-1 rounded-full text-sm">
                        {typeof condition === 'string' ? condition : condition.name || 'Condición'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No se han registrado condiciones médicas</p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Cirugías previas</h3>
                {medicalRecords?.surgeries && medicalRecords.surgeries.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalRecords.surgeries.map((surgery, index) => (
                      <span key={index} className="bg-purple-50 text-purple-800 px-2 py-1 rounded-full text-sm">
                        {typeof surgery === 'string' ? surgery : surgery.name || 'Cirugía'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No se han registrado cirugías</p>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <Link to="/dashboard/medical" className="btn-primary">
              Actualizar historial médico
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    reminders: true,
    marketing: false
  });
  
  const [privacy, setPrivacy] = useState({
    shareData: false,
    anonymousData: true
  });
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacy(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email"
                  name="email"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={notifications.email}
                  onChange={handleNotificationChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email" className="font-medium text-gray-700">Notificaciones por correo electrónico</label>
                <p className="text-gray-500">Recibe confirmaciones y recordatorios de citas por correo electrónico.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sms"
                  name="sms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={notifications.sms}
                  onChange={handleNotificationChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sms" className="font-medium text-gray-700">Notificaciones por SMS</label>
                <p className="text-gray-500">Recibe confirmaciones y recordatorios de citas por mensaje de texto.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="reminders"
                  name="reminders"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={notifications.reminders}
                  onChange={handleNotificationChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="reminders" className="font-medium text-gray-700">Recordatorios de citas</label>
                <p className="text-gray-500">Recibe recordatorios 24 horas antes de tus citas programadas.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="marketing"
                  name="marketing"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={notifications.marketing}
                  onChange={handleNotificationChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="marketing" className="font-medium text-gray-700">Comunicaciones de marketing</label>
                <p className="text-gray-500">Recibe información sobre promociones, nuevos servicios y consejos de salud.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Privacidad</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="shareData"
                  name="shareData"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={privacy.shareData}
                  onChange={handlePrivacyChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="shareData" className="font-medium text-gray-700">Compartir datos con médicos</label>
                <p className="text-gray-500">Permite que tus médicos accedan a tu historial médico en la plataforma.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="anonymousData"
                  name="anonymousData"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={privacy.anonymousData}
                  onChange={handlePrivacyChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="anonymousData" className="font-medium text-gray-700">Datos anónimos para mejora del servicio</label>
                <p className="text-gray-500">Permite el uso de datos anónimos para mejorar nuestros servicios.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="text-blue-600 font-medium hover:text-blue-800">
              Descargar mis datos
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Cambiar contraseña</h3>
            <p className="text-gray-600 mb-4">
              Actualiza tu contraseña regularmente para mantener tu cuenta segura.
            </p>
            <button className="btn-outline">
              Cambiar contraseña
            </button>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Eliminar cuenta</h3>
            <p className="text-gray-600 mb-4">
              Al eliminar tu cuenta, se borrarán permanentemente todos tus datos y no podrás recuperarlos.
            </p>
            <button className="text-red-600 hover:text-red-800 font-medium">
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;