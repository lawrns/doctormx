import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, AlertCircle, RefreshCw, Link as LinkIcon, Shield } from 'lucide-react';
import DoctoraliaIntegrationService from '../../services/calendar/DoctoraliaIntegrationService';

interface DoctoraliaIntegrationProps {
  doctorId: string;
}

/**
 * Component for integrating a doctor's Doctoralia calendar
 */
const DoctoraliaIntegration: React.FC<DoctoraliaIntegrationProps> = ({ doctorId }) => {
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // Fetch integration status on load
  useEffect(() => {
    fetchIntegrationStatus();
  }, [doctorId]);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      const status = await DoctoraliaIntegrationService.getIntegrationStatus(doctorId);
      setIntegrationStatus(status);
      setError(null);
    } catch (err) {
      setError('Failed to load integration status. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate credentials
      if (!credentials.username) {
        setError('El nombre de usuario de Doctoralia es requerido');
        return;
      }
      
      if (!credentials.password) {
        setError('La contraseña de Doctoralia es requerida');
        return;
      }
      
      // Connect to Doctoralia
      await DoctoraliaIntegrationService.connectDoctoralia(doctorId, credentials);
      
      // Refresh status
      await fetchIntegrationStatus();
      
      // Reset form
      setCredentials({
        username: '',
        password: ''
      });
      setShowConnectForm(false);
    } catch (err) {
      setError(err.message || 'Failed to connect to Doctoralia. Please try again.');
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Estás seguro que deseas desconectar tu cuenta de Doctoralia?')) {
      return;
    }
    
    try {
      await DoctoraliaIntegrationService.disconnectDoctoralia(doctorId);
      
      // Refresh status
      await fetchIntegrationStatus();
    } catch (err) {
      setError(err.message || 'Failed to disconnect from Doctoralia. Please try again.');
      console.error(err);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      setError(null);
      
      // Sync appointments
      const result = await DoctoraliaIntegrationService.syncAppointments(doctorId);
      
      if (result.success) {
        setSyncResult(result);
        
        // Refresh status
        await fetchIntegrationStatus();
      } else {
        setError(result.error || 'Sync failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to sync appointments. Please try again.');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Render connected state
  const renderConnected = () => {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Conectado a Doctoralia
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Tu agenda de Doctoralia está conectada con Doctor.mx.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de la conexión</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Nombre de usuario</dt>
                <dd className="mt-1 text-sm text-gray-900">{integrationStatus.username}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    integrationStatus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {integrationStatus.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Última sincronización</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {integrationStatus.lastSynced ? new Date(integrationStatus.lastSynced).toLocaleString() : 'Nunca'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Acciones</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncing}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        syncing ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {syncing ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} className="mr-2" />
                          Sincronizar ahora
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Desconectar
                    </button>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {syncResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Sincronización completada
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Sincronización exitosa. Resultados:
                  </p>
                </div>
                <div className="mt-2">
                  <div className="flex space-x-6 text-sm text-blue-700">
                    <div>
                      <span className="text-blue-900 font-medium">{syncResult.added}</span> citas añadidas
                    </div>
                    <div>
                      <span className="text-blue-900 font-medium">{syncResult.updated}</span> citas actualizadas
                    </div>
                    <div>
                      <span className="text-blue-900 font-medium">{syncResult.deleted}</span> citas eliminadas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render not connected state
  const renderNotConnected = () => {
    return (
      <div className="space-y-6">
        {!showConnectForm ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6 text-center">
              <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Conectar con Doctoralia</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sincroniza tu agenda de Doctoralia con Doctor.mx para gestionar todas tus citas en un solo lugar.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowConnectForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Conectar con Doctoralia
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Conectar con Doctoralia</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Introduce tus credenciales de Doctoralia para conectar tu agenda.
                </p>
              </div>
              <form className="mt-5 sm:flex sm:flex-col sm:max-w-lg" onSubmit={handleConnect}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nombre de usuario
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="usuario@doctoralia.com"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Conectar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowConnectForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información de seguridad
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Doctor.mx sólo utiliza tus credenciales para conectarse a tu agenda de Doctoralia. 
                  No almacenamos ni compartimos tu contraseña.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Integración con Doctoralia</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Sincroniza tu agenda de citas con Doctoralia
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {integrationStatus?.connected ? renderConnected() : renderNotConnected()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctoraliaIntegration;