import React, { useState, useEffect } from 'react';
import { useHealth } from './HealthContext';
import { HealthConnectionStatus, HealthMetricType } from './types';
import HealthDataUpload from './HealthDataUpload';
import { initHealthDataStorage, hasPendingHealthSync } from './healthSync';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const HealthDashboard: React.FC = () => {
  const { 
    connectionStatus, 
    isLoading, 
    errorMessage,
    healthData,
    connectionSettings,
    userProfile,
    connectToAppleHealth,
    disconnectFromAppleHealth,
    syncHealthData,
  } = useHealth();
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isPendingSync, setIsPendingSync] = useState(false);
  
  // Initialize health data storage on component mount
  useEffect(() => {
    const initStorage = async () => {
      await initHealthDataStorage();
      const pending = await hasPendingHealthSync();
      setIsPendingSync(pending);
    };
    
    initStorage();
  }, []);
  
  // If not connected, show connection prompt
  if (connectionStatus === HealthConnectionStatus.NOT_CONNECTED) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <img 
            src="/images/apple-health-logo.svg" 
            alt="Apple Health" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conecta con Apple Health
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Sincroniza tus datos de salud de Apple Watch y iPhone para un mejor seguimiento y recomendaciones personalizadas.
          </p>
          <button
            onClick={() => connectToAppleHealth()}
            disabled={isLoading}
            className="btn-primary flex items-center justify-center mx-auto"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {isLoading ? 'Conectando...' : 'Conectar con Apple Health'}
          </button>
          
          {errorMessage && (
            <div className="mt-4 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="mt-8 bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-medium text-blue-800 mb-2">¿Qué datos sincronizamos?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ritmo cardíaco y variabilidad
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pasos y actividad física
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Patrones de sueño
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Oxígeno en sangre
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  // If connecting, show loading state
  if (connectionStatus === HealthConnectionStatus.CONNECTING) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conectando con Apple Health
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Estamos estableciendo la conexión con tu cuenta de Apple Health. Este proceso puede tardar unos momentos...
          </p>
        </div>
      </div>
    );
  }
  
  // Show dashboard with health data
  return (
    <div className="space-y-6">
      {/* Header with sync status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mi salud</h2>
            {connectionSettings?.lastSyncTime && (
              <p className="text-sm text-gray-500">
                Última sincronización: {format(new Date(connectionSettings.lastSyncTime), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                {isPendingSync && (
                  <span className="ml-2 text-amber-600">
                    (Sincronización pendiente)
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => syncHealthData()}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isLoading ? 'Sincronizando...' : 'Sincronizar ahora'}
            </button>
            <button
              onClick={() => disconnectFromAppleHealth()}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Desconectar
            </button>
          </div>
        </div>
      </div>
      
      {/* Time range selector */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setSelectedTimeRange('7d')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              selectedTimeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setSelectedTimeRange('30d')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              selectedTimeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => setSelectedTimeRange('90d')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              selectedTimeRange === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 días
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart rate card */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Ritmo cardíaco</div>
            <div className="text-2xl font-bold">
              {healthData.dailySummaries.length > 0 && healthData.dailySummaries[0].averageHeartRate 
                ? `${Math.round(healthData.dailySummaries[0].averageHeartRate)} BPM` 
                : '--'}
            </div>
            <div className="text-xs text-gray-500">Promedio reciente</div>
          </div>
        </div>
        
        {/* Steps card */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Pasos</div>
            <div className="text-2xl font-bold">
              {healthData.dailySummaries.length > 0 && healthData.dailySummaries[0].totalSteps 
                ? healthData.dailySummaries[0].totalSteps.toLocaleString() 
                : '--'}
            </div>
            <div className="text-xs text-gray-500">Hoy</div>
          </div>
        </div>
        
        {/* Sleep card */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Sueño</div>
            <div className="text-2xl font-bold">
              {healthData.dailySummaries.length > 0 && healthData.dailySummaries[0].sleepDuration 
                ? `${Math.floor(healthData.dailySummaries[0].sleepDuration / 60)}h ${healthData.dailySummaries[0].sleepDuration % 60}m`
                : '--'}
            </div>
            <div className="text-xs text-gray-500">Anoche</div>
          </div>
        </div>
        
        {/* Blood oxygen card */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Oxígeno en sangre</div>
            <div className="text-2xl font-bold">
              {healthData.dailySummaries.length > 0 && healthData.dailySummaries[0].averageBloodOxygen 
                ? `${healthData.dailySummaries[0].averageBloodOxygen}%`
                : '--'}
            </div>
            <div className="text-xs text-gray-500">Promedio reciente</div>
          </div>
        </div>
      </div>
      
      {/* Placeholder for charts - in a real implementation, you would use a charting library */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ritmo cardíaco</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span>Cargando datos...</span>
              </div>
            ) : healthData.recent.length === 0 ? (
              <div className="text-center">
                <p>Aún no hay suficientes datos para mostrar.</p>
                <p className="text-sm mt-1">Sincroniza tu Apple Watch regularmente para ver estadísticas.</p>
              </div>
            ) : (
              <div className="text-center">
                <p>Gráfica de ritmo cardíaco</p>
                <p className="text-sm">(Aquí se mostraría un gráfico de líneas con los datos de ritmo cardíaco)</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span>Cargando datos...</span>
              </div>
            ) : healthData.recent.length === 0 ? (
              <div className="text-center">
                <p>Aún no hay suficientes datos para mostrar.</p>
                <p className="text-sm mt-1">Sincroniza tu Apple Watch regularmente para ver estadísticas.</p>
              </div>
            ) : (
              <div className="text-center">
                <p>Gráfica de actividad diaria</p>
                <p className="text-sm">(Aquí se mostraría un gráfico de barras con los datos de pasos diarios)</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Connection settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de sincronización</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div>
              <div className="text-gray-700 font-medium">Dispositivo conectado</div>
              <div className="text-gray-500 text-sm">{connectionSettings?.connectedDevice || 'Desconocido'}</div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Conectado
            </div>
          </div>
          
          <div className="pb-3 border-b border-gray-200">
            <div className="text-gray-700 font-medium mb-2">Métricas sincronizadas</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {connectionSettings?.sharedMetrics.map((metric) => (
                <div key={metric} className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {metric === HealthMetricType.HEART_RATE && 'Ritmo cardíaco'}
                  {metric === HealthMetricType.STEPS && 'Pasos'}
                  {metric === HealthMetricType.SLEEP && 'Sueño'}
                  {metric === HealthMetricType.ACTIVE_ENERGY && 'Energía activa'}
                  {metric === HealthMetricType.BLOOD_OXYGEN && 'Oxígeno en sangre'}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-gray-700 font-medium mb-1">Frecuencia de sincronización</div>
            <div className="text-gray-600 text-sm">
              {connectionSettings?.syncFrequency === 'hourly' && 'Cada hora'}
              {connectionSettings?.syncFrequency === '4hours' && 'Cada 4 horas'}
              {connectionSettings?.syncFrequency === '12hours' && 'Cada 12 horas'}
              {connectionSettings?.syncFrequency === 'daily' && 'Diariamente'}
            </div>
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default HealthDashboard;
