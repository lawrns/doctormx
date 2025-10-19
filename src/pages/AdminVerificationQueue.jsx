import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function AdminVerificationQueue() {
  const [loading, setLoading] = useState(true);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, rejected, verified
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingVerifications();
  }, [filter, searchTerm]);

  const loadPendingVerifications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('doctors')
        .select(`
          *,
          users!inner(
            id,
            name,
            email,
            phone,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'pending') {
        query = query.eq('license_status', 'pending');
      } else if (filter === 'verified') {
        query = query.eq('license_status', 'verified');
      } else if (filter === 'rejected') {
        query = query.eq('license_status', 'rejected');
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`cedula.ilike.%${searchTerm}%,users.name.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPendingVerifications(data || []);
    } catch (error) {
      console.error('Error loading pending verifications:', error);
      toast.error('Error al cargar verificaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId, notes = '') => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          license_status: 'verified',
          kpis: {
            ...pendingVerifications.find(d => d.user_id === doctorId)?.kpis,
            verified_at: new Date().toISOString(),
            verification_method: 'manual_admin',
            admin_notes: notes
          }
        })
        .eq('user_id', doctorId);

      if (error) throw error;

      // Log audit trail
      await supabase.from('audit_trail').insert({
        actor_user_id: 'admin', // In production, use actual admin user ID
        entity: 'doctors',
        entity_id: doctorId,
        action: 'verification_approved',
        diff: { status: 'verified', notes }
      });

      toast.success('Verificación aprobada exitosamente');
      loadPendingVerifications();
      setSelectedVerification(null);
    } catch (error) {
      console.error('Error approving verification:', error);
      toast.error('Error al aprobar verificación');
    }
  };

  const handleReject = async (doctorId, reason, notes = '') => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          license_status: 'rejected',
          kpis: {
            ...pendingVerifications.find(d => d.user_id === doctorId)?.kpis,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason,
            admin_notes: notes
          }
        })
        .eq('user_id', doctorId);

      if (error) throw error;

      // Log audit trail
      await supabase.from('audit_trail').insert({
        actor_user_id: 'admin', // In production, use actual admin user ID
        entity: 'doctors',
        entity_id: doctorId,
        action: 'verification_rejected',
        diff: { status: 'rejected', reason, notes }
      });

      toast.success('Verificación rechazada');
      loadPendingVerifications();
      setSelectedVerification(null);
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Error al rechazar verificación');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando verificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Admin - Cola de Verificación</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadPendingVerifications}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por cédula, nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'verified', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' && 'Todas'}
                  {status === 'pending' && 'Pendientes'}
                  {status === 'verified' && 'Verificadas'}
                  {status === 'rejected' && 'Rechazadas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Verificaciones ({pendingVerifications.length})
            </h2>
            
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay verificaciones
                </h3>
                <p className="text-gray-600">
                  No se encontraron verificaciones con los filtros actuales
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map((verification) => (
                  <motion.div
                    key={verification.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedVerification(verification)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {verification.users?.name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cédula: {verification.cedula} • {verification.users?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          Especialidades: {verification.specialties?.join(', ') || 'Sin especificar'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(verification.license_status)}`}>
                          {getStatusText(verification.license_status)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(verification.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(verification.kpis?.submitted_at || verification.created_at)}
                      </span>
                      {verification.kpis?.verification_method && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {verification.kpis.verification_method === 'automated_sep' ? 'Automática' : 'Manual'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedVerification.users?.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Cédula: {selectedVerification.cedula} • {selectedVerification.users?.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Información del Doctor</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {selectedVerification.users?.name}</div>
                    <div><strong>Email:</strong> {selectedVerification.users?.email}</div>
                    <div><strong>Teléfono:</strong> {selectedVerification.users?.phone}</div>
                    <div><strong>Cédula:</strong> {selectedVerification.cedula}</div>
                    <div><strong>Especialidades:</strong> {selectedVerification.specialties?.join(', ')}</div>
                    <div><strong>Estado:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedVerification.license_status)}`}>
                        {getStatusText(selectedVerification.license_status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Documentos Subidos</h3>
                  <div className="space-y-2 text-sm">
                    {selectedVerification.kpis?.documents ? (
                      Object.entries(selectedVerification.kpis.documents).map(([key, url]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Ver documento
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No hay documentos subidos</div>
                    )}
                  </div>
                </div>
              </div>

              {/* SEP Verification Details */}
              {selectedVerification.kpis?.sep_details && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Detalles de Verificación SEP</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div><strong>Nombre registrado:</strong> {selectedVerification.kpis.sep_details.name}</div>
                    <div><strong>Especialidad:</strong> {selectedVerification.kpis.sep_details.specialty}</div>
                    <div><strong>Institución:</strong> {selectedVerification.kpis.sep_details.institution}</div>
                    <div><strong>Fecha de emisión:</strong> {selectedVerification.kpis.sep_details.issueDate}</div>
                    <div><strong>Estado:</strong> {selectedVerification.kpis.sep_details.status}</div>
                    <div><strong>Método:</strong> {selectedVerification.kpis.verification_method}</div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedVerification.kpis?.admin_notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Notas del Administrador</h3>
                  <p className="text-sm text-yellow-800">{selectedVerification.kpis.admin_notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedVerification.license_status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedVerification.user_id)}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Aprobar Verificación
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Motivo del rechazo:');
                      if (reason) {
                        handleReject(selectedVerification.user_id, reason);
                      }
                    }}
                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Rechazar Verificación
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

