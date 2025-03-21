import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Input, 
  Switch 
} from '../../components/ui';
import { 
  Link as LinkIcon, 
  Check, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  RefreshCw, 
  Settings,
  Calendar,
  MessageSquare,
  Star
} from 'lucide-react';

interface DoctoraliaSettings {
  isConnected: boolean;
  profileUrl: string;
  apiKey: string;
  lastSync: Date | null;
  syncOptions: {
    syncAppointments: boolean;
    syncReviews: boolean;
    syncMessages: boolean;
    autoPublishAppointments: boolean;
  };
  profileStats?: {
    averageRating: number;
    totalReviews: number;
    totalAppointments: number;
    profileViews: number;
  };
}

const DoctoraliaIntegrationPage: React.FC = () => {
  const { doctorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [synchronizing, setSynchronizing] = useState(false);
  const [settings, setSettings] = useState<DoctoraliaSettings | null>(null);
  
  // Fetch Doctoralia integration settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          const mockSettings: DoctoraliaSettings = {
            isConnected: true,
            profileUrl: 'https://www.doctoralia.com.mx/dr-carlos-mendez',
            apiKey: 'dct_api_12345abcdef',
            lastSync: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            syncOptions: {
              syncAppointments: true,
              syncReviews: true,
              syncMessages: false,
              autoPublishAppointments: true
            },
            profileStats: {
              averageRating: 4.8,
              totalReviews: 42,
              totalAppointments: 156,
              profileViews: 1250
            }
          };
          
          setSettings(mockSettings);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching Doctoralia settings:', error);
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [doctorId]);
  
  // Save settings
  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      
      // In a real implementation, save to Supabase
      // For now, just simulate an API call
      setTimeout(() => {
        setSaving(false);
        alert('Configuración guardada correctamente');
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
      alert('Error al guardar la configuración');
    }
  };
  
  // Sync with Doctoralia
  const syncWithDoctoralia = async () => {
    if (!settings) return;
    
    try {
      setSynchronizing(true);
      
      // In a real implementation, make API call to sync
      // For now, just simulate an API call
      setTimeout(() => {
        setSettings({
          ...settings,
          lastSync: new Date()
        });
        setSynchronizing(false);
        alert('Sincronización completada correctamente');
      }, 2000);
    } catch (error) {
      console.error('Error syncing with Doctoralia:', error);
      setSynchronizing(false);
      alert('Error durante la sincronización');
    }
  };
  
  // Toggle connection status
  const toggleConnection = () => {
    if (!settings) return;
    
    if (settings.isConnected) {
      // Confirm disconnection
      const confirm = window.confirm('¿Estás seguro de que deseas desconectar tu cuenta de Doctoralia? Esta acción detendrá todas las sincronizaciones hasta que vuelvas a conectarte.');
      
      if (confirm) {
        setSettings({
          ...settings,
          isConnected: false
        });
      }
    } else {
      // In a real implementation, would redirect to Doctoralia OAuth
      // For now, just simulate a connection
      setSettings({
        ...settings,
        isConnected: true
      });
    }
  };
  
  // Update sync option
  const updateSyncOption = (option: keyof DoctoraliaSettings['syncOptions'], value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      syncOptions: {
        ...settings.syncOptions,
        [option]: value
      }
    });
  };
  
  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <DashboardLayout title="Integración con Doctoralia" loading={loading}>
      {settings && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integración con Doctoralia</h1>
              <p className="text-gray-500">Conecta y sincroniza tu perfil de Doctor MX con Doctoralia</p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                icon={<RefreshCw size={16} className={synchronizing ? 'animate-spin' : ''} />}
                onClick={syncWithDoctoralia}
                disabled={synchronizing || !settings.isConnected}
              >
                {synchronizing ? 'Sincronizando...' : 'Sincronizar ahora'}
              </Button>
              
              <Button
                variant="primary"
                icon={saving ? undefined : <Check size={16} />}
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Estado de la conexión</h2>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <img 
                      src="/doctoralia-logo.png" 
                      alt="Doctoralia Logo" 
                      className="h-8 mr-3"
                      onError={(e) => {
                        // If image fails to load, show a placeholder
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="%23888">Doctoralia</text></svg>';
                      }}
                    />
                    <div>
                      <h3 className="font-medium">Doctoralia</h3>
                      <p className="text-sm text-gray-500">
                        {settings.isConnected 
                          ? 'Conectado y sincronizando' 
                          : 'No conectado'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <Switch
                    checked={settings.isConnected}
                    onChange={toggleConnection}
                  />
                </div>
                
                {settings.isConnected ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                    <Check size={20} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium">Cuenta conectada correctamente</p>
                      <p className="text-green-700 text-sm mt-1">
                        Tu cuenta de Doctoralia está vinculada y los datos se sincronizarán automáticamente según tu configuración.
                      </p>
                      <div className="mt-2">
                        <a 
                          href={settings.profileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-700 text-sm flex items-center hover:underline"
                        >
                          Ver perfil en Doctoralia
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                    <AlertTriangle size={20} className="text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-medium">Cuenta no conectada</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Conecta tu cuenta de Doctoralia para sincronizar citas, opiniones y mensajes automáticamente.
                      </p>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleConnection}
                        >
                          Conectar cuenta
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {settings.isConnected && (
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <RefreshCw size={14} className="mr-1" />
                    Última sincronización: {formatDate(settings.lastSync)}
                  </div>
                )}
              </Card>
              
              {settings.isConnected && (
                <>
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Opciones de sincronización</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Calendar size={20} className="text-blue-500 mr-3" />
                          <div>
                            <h3 className="font-medium">Sincronizar citas</h3>
                            <p className="text-sm text-gray-500">
                              Las citas de Doctoralia aparecerán en tu agenda de Doctor MX
                            </p>
                          </div>
                        </div>
                        
                        <Switch
                          checked={settings.syncOptions.syncAppointments}
                          onChange={(checked) => updateSyncOption('syncAppointments', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Star size={20} className="text-yellow-500 mr-3" />
                          <div>
                            <h3 className="font-medium">Sincronizar opiniones</h3>
                            <p className="text-sm text-gray-500">
                              Las opiniones de pacientes en Doctoralia se mostrarán en tu perfil
                            </p>
                          </div>
                        </div>
                        
                        <Switch
                          checked={settings.syncOptions.syncReviews}
                          onChange={(checked) => updateSyncOption('syncReviews', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <MessageSquare size={20} className="text-green-500 mr-3" />
                          <div>
                            <h3 className="font-medium">Sincronizar mensajes</h3>
                            <p className="text-sm text-gray-500">
                              Los mensajes de Doctoralia aparecerán en tu bandeja de Doctor MX
                            </p>
                          </div>
                        </div>
                        
                        <Switch
                          checked={settings.syncOptions.syncMessages}
                          onChange={(checked) => updateSyncOption('syncMessages', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Calendar size={20} className="text-purple-500 mr-3" />
                          <div>
                            <h3 className="font-medium">Publicar automáticamente disponibilidad</h3>
                            <p className="text-sm text-gray-500">
                              Tu disponibilidad de Doctor MX se publicará en Doctoralia
                            </p>
                          </div>
                        </div>
                        
                        <Switch
                          checked={settings.syncOptions.autoPublishAppointments}
                          onChange={(checked) => updateSyncOption('autoPublishAppointments', checked)}
                        />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Configuración avanzada</h2>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key de Doctoralia
                      </label>
                      <div className="flex">
                        <Input
                          value={settings.apiKey}
                          onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                          className="rounded-r-none font-mono"
                          type="password"
                        />
                        <Button className="rounded-l-none">
                          Mostrar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        No compartas tu API Key con nadie. Esta clave permite el acceso a tu cuenta de Doctoralia.
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Settings size={20} className="text-gray-500 mr-3" />
                        <div>
                          <h3 className="font-medium">Opciones avanzadas de Doctoralia</h3>
                          <p className="text-sm text-gray-500">
                            Configurar opciones adicionales en el portal de desarrolladores
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ExternalLink size={14} />}
                        onClick={() => window.open('https://developers.doctoralia.com', '_blank')}
                      >
                        Acceder
                      </Button>
                    </div>
                  </Card>
                </>
              )}
            </div>
            
            <div className="space-y-6">
              {settings.isConnected && settings.profileStats && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Estadísticas de Doctoralia</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700">{settings.profileStats.averageRating}</div>
                      <div className="text-sm text-blue-600">
                        Calificación media
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">{settings.profileStats.totalReviews}</div>
                      <div className="text-sm text-green-600">
                        Opiniones
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-700">{settings.profileStats.totalAppointments}</div>
                      <div className="text-sm text-purple-600">
                        Citas totales
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-700">{settings.profileStats.profileViews}</div>
                      <div className="text-sm text-yellow-600">
                        Visitas al perfil
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={<ExternalLink size={14} />}
                      onClick={() => window.open('https://www.doctoralia.com.mx/stats', '_blank')}
                    >
                      Ver estadísticas completas
                    </Button>
                  </div>
                </Card>
              )}
              
              <Card className="p-6 bg-blue-50">
                <div className="flex items-start">
                  <Info size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Beneficios de la integración</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Gestión de citas centralizada desde una sola plataforma</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Sincronización automática de disponibilidad y horarios</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Mayor visibilidad con tu perfil en Doctoralia</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Acceso a la comunidad de pacientes de Doctoralia</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recursos de ayuda</h2>
                
                <div className="space-y-3">
                  <a 
                    href="#" 
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <LinkIcon size={16} className="text-blue-500 mr-2" />
                    <span className="text-sm">Guía de integración con Doctoralia</span>
                  </a>
                  
                  <a 
                    href="#" 
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <LinkIcon size={16} className="text-blue-500 mr-2" />
                    <span className="text-sm">Preguntas frecuentes sobre sincronización</span>
                  </a>
                  
                  <a 
                    href="#" 
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <LinkIcon size={16} className="text-blue-500 mr-2" />
                    <span className="text-sm">Soporte técnico para la integración</span>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctoraliaIntegrationPage;