import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

export default function DoctorVerification() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      
      // Use local API for development, Netlify functions for production
      const isLocal = window.location.hostname === 'localhost';
      const endpoint = isLocal ? '/api/admin/pending-verifications' : '/.netlify/functions/pending-verifications';
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Error al cargar verificaciones pendientes');
      }
      
      const data = await response.json();
      setPendingVerifications(data.data || []);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      toast.error('Error al cargar verificaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId, verified, notes = '') => {
    try {
      setProcessing(prev => ({ ...prev, [doctorId]: true }));
      
      // Use local API for development, Netlify functions for production
      const isLocal = window.location.hostname === 'localhost';
      const endpoint = isLocal ? `/api/doctors/${doctorId}/verify-cedula` : `/.netlify/functions/verify-cedula`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          verified,
          notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al verificar doctor');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(verified ? 'Doctor verificado exitosamente' : 'Verificación rechazada');
        await fetchPendingVerifications(); // Refresh list
        setSelectedDoctor(null);
        setVerificationNotes('');
      } else {
        throw new Error(result.error || 'Error en la verificación');
      }
    } catch (error) {
      console.error('Error verifying doctor:', error);
      toast.error(error.message || 'Error al verificar doctor');
    } finally {
      setProcessing(prev => ({ ...prev, [doctorId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Cargando verificaciones...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Verificación de Doctores</h1>
                <p className="text-gray-600 mt-2">
                  Administra las verificaciones de cédulas profesionales pendientes
                </p>
              </div>
              <Button
                onClick={fetchPendingVerifications}
                variant="secondary"
                disabled={loading}
              >
                <Icon name="arrow-path" size="sm" className="mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="clock" size="md" className="text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{pendingVerifications.length}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="user-group" size="md" className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-sm text-gray-600">Verificados hoy</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="chart-bar" size="md" className="text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-sm text-gray-600">Tasa de aprobación</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Verifications List */}
          {pendingVerifications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size="xl" className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay verificaciones pendientes
              </h3>
              <p className="text-gray-600">
                Todos los doctores han sido verificados o no hay registros pendientes.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingVerifications.map((doctor) => (
                <motion.div
                  key={doctor.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doctor.users?.name || 'Dr. Sin Nombre'}
                        </h3>
                        <Badge variant="warning">Pendiente</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">Información del Doctor</div>
                          <div className="space-y-1">
                            <div>Email: {doctor.users?.email || 'No disponible'}</div>
                            <div>Cédula: {doctor.cedula || 'No disponible'}</div>
                            <div>Especialidades: {doctor.specialties?.join(', ') || 'No especificadas'}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium text-gray-900 mb-1">Detalles de Registro</div>
                          <div className="space-y-1">
                            <div>Plan: {doctor.subscription_plan === 'yearly' ? 'Anual' : 'Mensual'}</div>
                            <div>Registrado: {formatDate(doctor.created_at)}</div>
                            <div>Estado: {doctor.verification_status}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <Button
                        onClick={() => handleVerifyDoctor(doctor.user_id, true)}
                        variant="success"
                        size="sm"
                        disabled={processing[doctor.user_id]}
                      >
                        {processing[doctor.user_id] ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Icon name="check" size="sm" className="mr-2" />
                        )}
                        Aprobar
                      </Button>
                      
                      <Button
                        onClick={() => handleVerifyDoctor(doctor.user_id, false)}
                        variant="danger"
                        size="sm"
                        disabled={processing[doctor.user_id]}
                      >
                        {processing[doctor.user_id] ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Icon name="x-mark" size="sm" className="mr-2" />
                        )}
                        Rechazar
                      </Button>
                      
                      <Button
                        onClick={() => setSelectedDoctor(doctor)}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="eye" size="sm" className="mr-2" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Doctor Details Modal */}
          {selectedDoctor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Detalles del Doctor
                  </h3>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="x-mark" size="md" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas de verificación (opcional)
                    </label>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Agrega notas sobre la verificación..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      onClick={() => setSelectedDoctor(null)}
                      variant="secondary"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleVerifyDoctor(selectedDoctor.user_id, true, verificationNotes)}
                      variant="success"
                      disabled={processing[selectedDoctor.user_id]}
                    >
                      {processing[selectedDoctor.user_id] ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Icon name="check" size="sm" className="mr-2" />
                      )}
                      Aprobar con notas
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
