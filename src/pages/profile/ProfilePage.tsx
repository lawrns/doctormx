import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, CreditCard, Bell, Shield, 
  ChevronRight, Edit2, Camera, Heart, FileText, Users, Settings,
  Activity, Pill, Clock, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface ProfileStats {
  consultations: number;
  prescriptions: number;
  labResults: number;
  appointments: number;
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.fullName || '',
    phone: user?.user_metadata?.phone || '',
    birthDate: user?.user_metadata?.birthDate || '',
    bloodType: user?.user_metadata?.bloodType || '',
    allergies: user?.user_metadata?.allergies || [],
    chronicConditions: user?.user_metadata?.chronicConditions || [],
    emergencyContact: user?.user_metadata?.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [stats] = useState<ProfileStats>({
    consultations: 12,
    prescriptions: 5,
    labResults: 3,
    appointments: 2
  });

  const quickActions = [
    {
      icon: Heart,
      label: 'Historial Médico',
      path: '/profile/medical-history',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Users,
      label: 'Mi Familia',
      path: '/profile/family',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: FileText,
      label: 'Recetas',
      path: '/profile/prescriptions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Activity,
      label: 'Exámenes',
      path: '/profile/lab-results',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sesión cerrada exitosamente', 'success');
      navigate('/');
    } catch (error) {
      showToast('Error al cerrar sesión', 'error');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      showToast('Perfil actualizado exitosamente', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Error al actualizar perfil', 'error');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <SEO 
        title="Mi Perfil - DoctorMX"
        description="Gestiona tu perfil médico, historial de salud y configuración de cuenta en DoctorMX"
        keywords={['perfil médico', 'historial salud', 'cuenta doctormx']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-jade-600 to-brand-jade-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Mi Perfil</h1>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-brand-jade-600"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-brand-jade-600" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-2xl font-semibold mb-2">
                  {profileData.fullName || 'Usuario'}
                </h2>
                <p className="text-brand-jade-100 mb-1">{user.email}</p>
                <p className="text-brand-jade-100">
                  Miembro desde {new Date(user.created_at || '').toLocaleDateString('es-MX', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                
                {/* Health Status Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-green-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                  {profileData.bloodType && (
                    <Badge className="bg-red-500 text-white">
                      Tipo {profileData.bloodType}
                    </Badge>
                  )}
                  {profileData.allergies.length > 0 && (
                    <Badge className="bg-yellow-500 text-white">
                      {profileData.allergies.length} Alergias
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-brand-jade-600">{stats.consultations}</div>
              <div className="text-sm text-gray-600">Consultas</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.prescriptions}</div>
              <div className="text-sm text-gray-600">Recetas</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.labResults}</div>
              <div className="text-sm text-gray-600">Exámenes</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.appointments}</div>
              <div className="text-sm text-gray-600">Citas</div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Acceso Rápido</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={index}
                        to={action.path}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className={`${action.bgColor} p-2 rounded-lg mr-3`}>
                            <Icon className={`w-5 h-5 ${action.color}`} />
                          </div>
                          <span className="font-medium">{action.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              </Card>

              {/* Emergency Contact */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Contacto de Emergencia</h3>
                {profileData.emergencyContact.name ? (
                  <div className="space-y-2">
                    <p className="font-medium">{profileData.emergencyContact.name}</p>
                    <p className="text-gray-600">{profileData.emergencyContact.phone}</p>
                    <p className="text-sm text-gray-500">{profileData.emergencyContact.relationship}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No has configurado un contacto de emergencia
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Información Personal</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nombre completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.fullName || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Correo electrónico
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha de nacimiento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profileData.birthDate ? 
                          new Date(profileData.birthDate).toLocaleDateString('es-MX') : 
                          'No especificado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Heart className="w-4 h-4 inline mr-2" />
                      Tipo de sangre
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.bloodType}
                        onChange={(e) => setProfileData({...profileData, bloodType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profileData.bloodType || 'No especificado'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </Card>

              {/* Health Information */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Información de Salud</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Alergias</h4>
                    {profileData.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.allergies.map((allergy, index) => (
                          <Badge key={index} variant="secondary">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No has registrado alergias</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Condiciones Crónicas</h4>
                    {profileData.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.chronicConditions.map((condition, index) => (
                          <Badge key={index} variant="secondary">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No has registrado condiciones crónicas</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => navigate('/profile/medical-history')}
                >
                  Gestionar Historial Médico
                </Button>
              </Card>

              {/* Account Settings */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Configuración de Cuenta</h3>
                
                <div className="space-y-3">
                  <Link
                    to="/profile/settings"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 text-gray-600 mr-3" />
                      <span>Preferencias</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>

                  <Link
                    to="/profile/notifications"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 text-gray-600 mr-3" />
                      <span>Notificaciones</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>

                  <Link
                    to="/profile/subscription"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                      <span>Suscripción</span>
                    </div>
                    <Badge className="bg-brand-jade-100 text-brand-jade-700">
                      Plan Básico
                    </Badge>
                  </Link>

                  <Link
                    to="/profile/security"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-600 mr-3" />
                      <span>Seguridad</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}