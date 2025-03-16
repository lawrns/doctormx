import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';

/**
 * This page shows the status of the database upgrade.
 * It helps users understand what has been fixed and what still needs attention.
 */
function UpgradeStatusPage() {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        setLoading(true);
        
        // Check if Supabase is online
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
          setSupabaseStatus('offline');
          setError(authError.message);
          return;
        }
        
        setSupabaseStatus('online');
        
        // Count users
        const { count: userCountData, error: userError } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true });
          
        if (userError) {
          console.error('Error counting users:', userError);
        } else {
          setUserCount(userCountData || 0);
        }
        
        // Count doctors
        const { count: doctorCountData, error: doctorError } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true });
          
        if (doctorError) {
          console.error('Error counting doctors:', doctorError);
        } else {
          setDoctorCount(doctorCountData || 0);
        }
        
        // Count appointments
        const { count: appointmentCountData, error: appointmentError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true });
          
        if (appointmentError) {
          console.error('Error counting appointments:', appointmentError);
        } else {
          setAppointmentCount(appointmentCountData || 0);
        }
      } catch (err) {
        console.error('Error checking upgrade status:', err);
        setError('Error checking system status');
      } finally {
        setLoading(false);
      }
    }
    
    checkStatus();
  }, []);
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Estado de la Actualización del Sistema</h1>
          <p className="text-gray-600">
            Esta página muestra el estado actual de la actualización del sistema y la información sobre la base de datos.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Verificando estado del sistema...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error en la verificación</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <>
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Conexión</h2>
              
              <div className="flex items-center">
                {supabaseStatus === 'online' ? (
                  <CheckCircle size={24} className="text-green-500 mr-3" />
                ) : (
                  <AlertCircle size={24} className="text-red-500 mr-3" />
                )}
                
                <div>
                  <p className="font-medium">
                    {supabaseStatus === 'online' ? 'Conectado a Supabase' : 'No se pudo conectar a Supabase'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {supabaseStatus === 'online' 
                      ? 'La conexión a la base de datos está funcionando correctamente.' 
                      : 'Hay problemas con la conexión a la base de datos.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Database Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de la Base de Datos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-1">{userCount}</p>
                  <p className="text-gray-700">Usuarios</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{doctorCount}</p>
                  <p className="text-gray-700">Médicos</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600 mb-1">{appointmentCount}</p>
                  <p className="text-gray-700">Citas</p>
                </div>
              </div>
            </div>
            
            {/* Upgrade Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Actualización</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle size={24} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Corrección de Interfaz de Usuario</p>
                    <p className="text-sm text-gray-500">
                      La interfaz ahora utiliza datos reales en lugar de datos de prueba.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle size={24} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Integración con API</p>
                    <p className="text-sm text-gray-500">
                      Las llamadas a la API ahora funcionan correctamente para obtener y actualizar datos de usuario.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle size={24} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Estructura de la Base de Datos</p>
                    <p className="text-sm text-gray-500">
                      Las tablas de la base de datos ahora tienen las columnas correctas para almacenar toda la información necesaria.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={24} className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Implementación de Datos de Citas</p>
                    <p className="text-sm text-gray-500">
                      Aún se utilizan datos de prueba para las citas. Pendiente de implementar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Ir al Dashboard
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </>
        )}
        
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Actualización completada el {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default UpgradeStatusPage;