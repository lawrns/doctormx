import React, { useState, useEffect, useCallback } from 'react';
import { useDoctorAuth } from '../../contexts/DoctorAuthContext';
import { DoctorAvailabilityService, DoctorAvailability } from '../../services/telemedicine/DoctorAvailabilityService';
import { TelemedicineSessionService, TelemedicineSession } from '../../services/telemedicine/TelemedicineSessionService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Switch from '../../components/ui/Switch';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Star, 
  Phone, 
  Video,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DoctorStats {
  totalConsultations: number;
  averageRating: number;
  onlineHours: number;
  earnings: number;
}

const DoctorTelemedicineDashboard: React.FC = () => {
  const { doctorProfile, user, loading: authLoading } = useDoctorAuth();
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [activeSessions, setActiveSessions] = useState<TelemedicineSession[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load doctor data
  const loadDoctorData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Load availability
      const availabilityData = await DoctorAvailabilityService.getDoctorAvailability(user.id);
      setAvailability(availabilityData);

      // Load active sessions
      const sessions = await TelemedicineSessionService.getDoctorActiveSessions(user.id);
      setActiveSessions(sessions);

      // Load stats
      const statsData = await DoctorAvailabilityService.getDoctorStats(user.id);
      setStats(statsData);

    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Toggle availability
  const toggleAvailability = async () => {
    if (!user?.id || !availability) return;

    setIsToggling(true);
    try {
      const newStatus = !availability.is_available;
      const success = await DoctorAvailabilityService.toggleAvailability(user.id, newStatus);
      
      if (success) {
        setAvailability({
          ...availability,
          is_available: newStatus,
          last_online: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setIsToggling(false);
    }
  };

  // Start consultation session
  const startSession = async (sessionCode: string) => {
    if (!user?.id) return;

    try {
      const success = await TelemedicineSessionService.startSession(sessionCode, user.id);
      if (success) {
        // Refresh sessions
        const sessions = await TelemedicineSessionService.getDoctorActiveSessions(user.id);
        setActiveSessions(sessions);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  // Complete consultation session
  const completeSession = async (sessionCode: string) => {
    if (!user?.id) return;

    try {
      const success = await TelemedicineSessionService.completeSession(
        sessionCode,
        user.id,
        'Consulta completada satisfactoriamente'
      );
      
      if (success) {
        // Refresh sessions and stats
        await loadDoctorData();
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const subscription = TelemedicineSessionService.subscribeToDoctorSessions(
      user.id,
      (payload) => {
        console.log('Session update:', payload);
        // Refresh active sessions
        loadDoctorData();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, loadDoctorData]);

  // Initial load
  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel médico...</p>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso no autorizado</h2>
            <p className="text-gray-600">Debes ser un doctor verificado para acceder a este panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel de Telemedicina
          </h1>
          <p className="text-gray-600">
            Bienvenido, Dr. {doctorProfile.nombre_completo}
          </p>
        </div>

        {/* Availability Toggle */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${
                  availability?.is_available ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <h3 className="text-lg font-semibold">Estado de Disponibilidad</h3>
                  <p className="text-gray-600">
                    {availability?.is_available 
                      ? 'Disponible para consultas' 
                      : 'No disponible'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={availability?.is_available || false}
                onCheckedChange={toggleAvailability}
                disabled={isToggling}
                className="data-[state=checked]:bg-teal-600"
              />
            </div>
            
            {availability?.is_available && (
              <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Capacidad: {availability.current_capacity}/{availability.max_concurrent_consults}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>Tiempo respuesta: {availability.average_response_time}s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-teal-600" />
                    <span>${availability.consultation_price} MXN por consulta</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consultas (30 días)</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalConsultations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Calificación promedio</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Horas en línea</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.onlineHours}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganancias (MXN)</p>
                    <p className="text-2xl font-bold text-gray-800">${stats.earnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Sessions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Consultas Activas</span>
              <Badge variant="outline" className="ml-2">
                {activeSessions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay consultas activas</p>
                <p className="text-sm text-gray-500 mt-2">
                  Las nuevas consultas aparecerán aquí cuando esté disponible
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-teal-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Consulta #{session.session_code}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Estado: <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                              {session.status === 'waiting' ? 'En espera' : 'Activa'}
                            </Badge>
                          </p>
                          {session.start_time && (
                            <p className="text-xs text-gray-500">
                              Iniciada: {new Date(session.start_time).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {session.status === 'waiting' ? (
                          <Button
                            onClick={() => startSession(session.session_code)}
                            className="bg-teal-600 hover:bg-teal-700"
                            size="sm"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(session.meeting_link, '_blank')}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Unirse
                            </Button>
                            <Button
                              onClick={() => completeSession(session.session_code)}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              Completar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => window.location.href = '/doctor/schedule'}
              >
                <Calendar className="w-6 h-6" />
                <span>Configurar Horarios</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => window.location.href = '/doctor/earnings'}
              >
                <DollarSign className="w-6 h-6" />
                <span>Ver Ganancias</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => window.location.href = '/doctor/profile'}
              >
                <Users className="w-6 h-6" />
                <span>Editar Perfil</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorTelemedicineDashboard;