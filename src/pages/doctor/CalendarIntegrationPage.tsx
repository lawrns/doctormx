import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import {
  Card,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch
} from '../../components/ui';
import {
  Calendar,
  Check,
  X,
  RefreshCw,
  Settings,
  ExternalLink,
  AlertTriangle,
  Info,
  Clock,
  Trash,
  Plus,
  Google,
  Mail,
  FileText
} from 'lucide-react';

interface CalendarAccount {
  id: string;
  type: 'google' | 'outlook' | 'apple' | 'manual';
  name: string;
  email?: string;
  connected: boolean;
  lastSync?: Date;
  status: 'active' | 'error' | 'expired';
  primaryCalendar?: boolean;
  color: string;
}

const CalendarIntegrationPage: React.FC = () => {
  const { doctorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts');
  const [calendarAccounts, setCalendarAccounts] = useState<CalendarAccount[]>([]);
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState<'5min' | '15min' | '30min' | '1hour' | 'manual'>('15min');
  const [showConflicts, setShowConflicts] = useState(true);
  const [blockConflictingAppointments, setBlockConflictingAppointments] = useState(true);
  
  // Fetch calendar integrations
  useEffect(() => {
    const fetchCalendarIntegrations = async () => {
      try {
        if (!doctorId) return;
        
        // Mock data for calendar accounts
        const mockCalendarAccounts: CalendarAccount[] = [
          {
            id: '1',
            type: 'google',
            name: 'Google Calendar Principal',
            email: 'dranagarcía@gmail.com',
            connected: true,
            lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            status: 'active',
            primaryCalendar: true,
            color: '#4285F4'
          },
          {
            id: '2',
            type: 'outlook',
            name: 'Outlook Trabajo',
            email: 'ana.garcía@hospital.mx',
            connected: true,
            lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'active',
            primaryCalendar: false,
            color: '#0078D4'
          },
          {
            id: '3',
            type: 'manual',
            name: 'Calendario Personal',
            connected: true,
            status: 'active',
            primaryCalendar: false,
            color: '#FF5733'
          }
        ];
        
        setCalendarAccounts(mockCalendarAccounts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calendar integrations:', error);
        setLoading(false);
      }
    };
    
    fetchCalendarIntegrations();
  }, [doctorId]);
  
  // Sync calendars
  const syncCalendars = async () => {
    try {
      setSyncing(true);
      
      // In a real implementation, this would call APIs to sync calendars
      setTimeout(() => {
        setCalendarAccounts(prev => 
          prev.map(account => ({
            ...account,
            lastSync: new Date(),
            status: 'active'
          }))
        );
        setSyncing(false);
      }, 2000);
    } catch (error) {
      console.error('Error syncing calendars:', error);
      setSyncing(false);
    }
  };
  
  // Connect new calendar
  const connectCalendar = (type: 'google' | 'outlook' | 'apple') => {
    // In a real implementation, this would redirect to OAuth flow
    alert(`Conectando calendario ${type}...`);
  };
  
  // Disconnect calendar
  const disconnectCalendar = (accountId: string) => {
    if (confirm('¿Estás seguro de que quieres desconectar este calendario?')) {
      setCalendarAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, connected: false, status: 'expired' } 
            : account
        )
      );
    }
  };
  
  // Set primary calendar
  const setPrimaryCalendar = (accountId: string) => {
    setCalendarAccounts(prev => 
      prev.map(account => ({
        ...account,
        primaryCalendar: account.id === accountId
      }))
    );
  };
  
  // Delete calendar
  const deleteCalendar = (accountId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este calendario?')) {
      setCalendarAccounts(prev => prev.filter(account => account.id !== accountId));
    }
  };
  
  // Format last sync time
  const formatLastSync = (date?: Date) => {
    if (!date) return 'Nunca';
    
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    
    if (minutes < 1) return 'Hace menos de un minuto';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  };
  
  // Render calendar icon based on type
  const renderCalendarIcon = (type: string) => {
    switch (type) {
      case 'google':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Google size={20} className="text-red-600" />
          </div>
        );
      case 'outlook':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail size={20} className="text-blue-600" />
          </div>
        );
      case 'apple':
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl text-gray-800">
              <AppleIcon />
            </span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Calendar size={20} className="text-orange-600" />
          </div>
        );
    }
  };
  
  return (
    <DashboardLayout title="Integración de Calendarios" loading={loading}>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integración de Calendarios</h1>
            <p className="text-gray-500 mt-1">
              Sincroniza tus calendarios externos con Doctor.mx para gestionar todas tus citas
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={syncCalendars}
              disabled={syncing}
              icon={syncing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </Button>
            
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setActiveTab('connect')}
            >
              Conectar Calendario
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="accounts">
              Calendarios Conectados
            </TabsTrigger>
            <TabsTrigger value="connect">
              Conectar Nuevo
            </TabsTrigger>
            <TabsTrigger value="settings">
              Configuración
            </TabsTrigger>
            <TabsTrigger value="conflicts">
              Conflictos
            </TabsTrigger>
          </TabsList>
          
          {/* Connected Calendars Tab */}
          <TabsContent value="accounts">
            <div className="space-y-6">
              {calendarAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                  <h2 className="text-lg font-medium text-gray-900 mb-1">No hay calendarios conectados</h2>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Conecta tus calendarios para sincronizar tus citas y evitar conflictos de agenda.
                  </p>
                  <Button
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => setActiveTab('connect')}
                  >
                    Conectar Calendario
                  </Button>
                </div>
              ) : (
                <>
                  {calendarAccounts.map((account) => (
                    <div 
                      key={account.id} 
                      className={`p-4 rounded-lg border ${
                        account.primaryCalendar ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {renderCalendarIcon(account.type)}
                          
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900">{account.name}</h3>
                              {account.primaryCalendar && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                            
                            {account.email && (
                              <p className="text-sm text-gray-500">{account.email}</p>
                            )}
                            
                            <div className="flex items-center mt-1">
                              <div className={`h-2 w-2 rounded-full ${
                                account.status === 'active' ? 'bg-green-500' : 
                                account.status === 'error' ? 'bg-red-500' : 
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-xs text-gray-500 ml-1">
                                {account.status === 'active' ? 'Conectado' : 
                                 account.status === 'error' ? 'Error' : 
                                 'Desconectado'}
                                {account.lastSync && ` · ${formatLastSync(account.lastSync)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {account.connected && !account.primaryCalendar && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPrimaryCalendar(account.id)}
                            >
                              Establecer como principal
                            </Button>
                          )}
                          
                          {account.connected ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => disconnectCalendar(account.id)}
                            >
                              Desconectar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => deleteCalendar(account.id)}
                              icon={<Trash size={16} />}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {account.status === 'error' && (
                        <div className="mt-3 bg-red-50 p-3 rounded-md flex items-start">
                          <AlertTriangle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-red-700 font-medium">Error de sincronización</p>
                            <p className="text-xs text-red-600 mt-1">
                              No se pudo conectar con el servicio de calendario. Por favor, reconecta tu cuenta.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => connectCalendar(account.type as any)}
                            >
                              Reconectar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      icon={<Plus size={16} />}
                      onClick={() => setActiveTab('connect')}
                    >
                      Conectar otro calendario
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Connect New Calendar Tab */}
          <TabsContent value="connect">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => connectCalendar('google')}>
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <Google size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Google Calendar</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Sincroniza tus eventos y citas con Google Calendar
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Conectar cuenta
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => connectCalendar('outlook')}>
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Mail size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Microsoft Outlook</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Sincroniza tus eventos y citas con Outlook Calendar
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Conectar cuenta
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => connectCalendar('apple')}>
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <span className="text-3xl text-gray-800">
                      <AppleIcon />
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Apple Calendar</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Sincroniza tus eventos y citas con Apple Calendar
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Conectar cuenta
                  </Button>
                </div>
              </Card>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Calendario Manual</h3>
              <p className="text-gray-500 mb-4">
                Si no deseas conectar un calendario externo, puedes crear un calendario manual para gestionar tus citas.
              </p>
              
              <Card className="p-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del calendario
                    </label>
                    <Input
                      placeholder="Ej: Calendario Personal"
                      className="max-w-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color del calendario
                    </label>
                    <div className="flex space-x-2">
                      {['#4285F4', '#0F9D58', '#F4B400', '#DB4437', '#673AB7', '#FF5722', '#795548', '#607D8B'].map((color) => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-400"
                          style={{ backgroundColor: color }}
                          onClick={() => {}}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                    >
                      Crear calendario manual
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Configuración de Sincronización</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700">Sincronización automática</label>
                    <p className="text-sm text-gray-500">
                      Sincronizar automáticamente tus calendarios con Doctor.mx
                    </p>
                  </div>
                  <Switch
                    checked={autoSync}
                    onChange={setAutoSync}
                  />
                </div>
                
                {autoSync && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia de sincronización
                    </label>
                    <select
                      value={syncFrequency}
                      onChange={(e) => setSyncFrequency(e.target.value as any)}
                      className="w-full max-w-xs rounded-md border border-gray-300 shadow-sm py-2 px-3"
                    >
                      <option value="5min">Cada 5 minutos</option>
                      <option value="15min">Cada 15 minutos</option>
                      <option value="30min">Cada 30 minutos</option>
                      <option value="1hour">Cada hora</option>
                      <option value="manual">Manual solamente</option>
                    </select>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700">Alertas de conflictos</label>
                    <p className="text-sm text-gray-500">
                      Mostrar alertas cuando existan conflictos entre calendarios
                    </p>
                  </div>
                  <Switch
                    checked={showConflicts}
                    onChange={setShowConflicts}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700">Bloquear citas conflictivas</label>
                    <p className="text-sm text-gray-500">
                      Impedir la creación de citas que generen conflictos con otros calendarios
                    </p>
                  </div>
                  <Switch
                    checked={blockConflictingAppointments}
                    onChange={setBlockConflictingAppointments}
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Opciones de Visualización</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calendario predeterminado para nuevas citas
                  </label>
                  <select
                    className="w-full max-w-xs rounded-md border border-gray-300 shadow-sm py-2 px-3"
                  >
                    <option value="auto">Utilizar calendario principal</option>
                    {calendarAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mostrar calendarios en vista de agenda
                  </label>
                  <div className="space-y-2 mt-2">
                    {calendarAccounts.map((account) => (
                      <div key={account.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`show-calendar-${account.id}`}
                          className="mr-2"
                          checked={true}
                          onChange={() => {}}
                        />
                        <label htmlFor={`show-calendar-${account.id}`} className="text-sm flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: account.color }}
                          ></div>
                          {account.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privacidad del calendario
                  </label>
                  <select
                    className="w-full max-w-xs rounded-md border border-gray-300 shadow-sm py-2 px-3"
                  >
                    <option value="full">Mostrar detalles completos</option>
                    <option value="partial">Mostrar solo disponibilidad</option>
                    <option value="private">Mantener privado (solo para mí)</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Conflicts Tab */}
          <TabsContent value="conflicts">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Conflictos Detectados</h2>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Se han detectado 2 conflictos en tu agenda</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Hay citas programadas al mismo tiempo en diferentes calendarios. Revisa los detalles a continuación.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-red-800">Conflicto el 22 de marzo, 10:00 - 11:00</h3>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-start">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2"></div>
                          <div>
                            <p className="text-sm font-medium">Consulta con María López</p>
                            <p className="text-xs text-gray-500">Google Calendar Principal</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-red-200 pt-2 flex items-start">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-2"></div>
                          <div>
                            <p className="text-sm font-medium">Reunión de equipo médico</p>
                            <p className="text-xs text-gray-500">Outlook Trabajo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-100"
                      >
                        Reprogramar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Ignorar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-red-800">Conflicto el 24 de marzo, 15:30 - 16:00</h3>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-start">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2"></div>
                          <div>
                            <p className="text-sm font-medium">Seguimiento con Pedro Sánchez</p>
                            <p className="text-xs text-gray-500">Google Calendar Principal</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-red-200 pt-2 flex items-start">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 mr-2"></div>
                          <div>
                            <p className="text-sm font-medium">Cita personal</p>
                            <p className="text-xs text-gray-500">Calendario Personal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-100"
                      >
                        Reprogramar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Ignorar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Historial de Conflictos Resueltos</h2>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conflicto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resolución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de resolución
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      15/03/2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Cita con Ana Martínez vs. Conferencia médica
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Reprogramada cita
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      15/03/2023
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      10/03/2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Reunión de equipo vs. Consulta con Carlos González
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Ignorado
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      10/03/2023
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-start">
          <Info size={24} className="text-blue-500 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold mb-2">Beneficios de la sincronización de calendarios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Clock size={18} className="mr-2" />
                  Ahorra tiempo
                </h3>
                <p className="text-sm text-blue-600">
                  Gestiona todas tus citas desde un solo lugar, sin necesidad de actualizar múltiples calendarios.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2 flex items-center">
                  <X size={18} className="mr-2" />
                  Evita conflictos
                </h3>
                <p className="text-sm text-green-600">
                  Detecta y resuelve conflictos de agenda automáticamente, evitando dobles reservas.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Calendar size={18} className="mr-2" />
                  Visión completa
                </h3>
                <p className="text-sm text-purple-600">
                  Obtén una visión completa de tu disponibilidad combinando calendarios personales y profesionales.
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>
                La sincronización bidireccional garantiza que los cambios realizados en cualquier calendario se reflejen en todos los demás.
                Esto te permite mantener tu agenda organizada y evitar problemas de coordinación.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

// Simple Apple icon component
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.74 3.51 7.1 8.42 6.91c1.53.02 2.43.83 3.28.83.85 0 2.31-1.03 4.14-.83.7.03 2.65.28 3.91 2.1-10.3 4.27-8.69 15.29.3 11.27zm-5.05-17C11.85.71 13.73.24 15 1c.14 2.92-2.54 5.01-4.5 4.7-.21-2.18.82-3.77 1.5-4.42z" />
  </svg>
);

export default CalendarIntegrationPage;