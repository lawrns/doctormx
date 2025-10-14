import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import PrescriptionView from '../components/PrescriptionView';

export default function PharmacyPortal() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scan');
  const [qrToken, setQrToken] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  const [fills, setFills] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_fills: 0,
    pending_fills: 0,
    delivered_fills: 0,
    total_gmv: 0,
    leaderboard_position: 0
  });

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load pharmacy profile
      const { data: pharmacy, error: pharmacyError } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', user.id)
        .single();

      if (pharmacyError) throw pharmacyError;
      setPharmacyData(pharmacy);

      // Load fills
      const { data: fillsData, error: fillsError } = await supabase
        .from('pharmacy_fills')
        .select(`
          *,
          erx:erx_id (
            *,
            users:patient_id (name),
            doctors:doctor_id (users:user_id(name))
          )
        `)
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!fillsError) {
        setFills(fillsData || []);
      }

      // Calculate analytics
      const totalFills = fillsData?.length || 0;
      const pendingFills = fillsData?.filter(f => f.status === 'received').length || 0;
      const deliveredFills = fillsData?.filter(f => f.status === 'delivered').length || 0;

      setAnalytics({
        total_fills: totalFills,
        pending_fills: pendingFills,
        delivered_fills: deliveredFills,
        total_gmv: 0,
        leaderboard_position: 0
      });

    } catch (error) {
      console.error('Error loading pharmacy data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async () => {
    if (!qrToken.trim()) {
      toast.error('Ingresa un token de QR válido');
      return;
    }

    setLoading(true);
    try {
      // Look up prescription by QR token
      const { data: erxData, error: erxError } = await supabase
        .from('erx')
        .select(`
          *,
          users:patient_id (name, phone),
          doctors:doctor_id (users:user_id(name, cedula))
        `)
        .eq('qr_token', qrToken.trim())
        .single();

      if (erxError || !erxData) {
        toast.error('Receta no encontrada. Verifica el código QR');
        return;
      }

      if (erxData.status === 'cancelled') {
        toast.error('Esta receta ha sido cancelada');
        return;
      }

      if (erxData.status === 'filled') {
        toast.warning('Esta receta ya fue surtida');
      }

      setPrescription(erxData);
      toast.success('Receta encontrada');

    } catch (error) {
      console.error('Error scanning QR:', error);
      toast.error('Error al escanear código');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrescription = async () => {
    if (!prescription || !pharmacyData) return;

    try {
      // Create pharmacy fill record
      const { error: fillError } = await supabase
        .from('pharmacy_fills')
        .insert({
          erx_id: prescription.id,
          pharmacy_id: pharmacyData.id,
          status: 'received',
          events: [
            {
              type: 'claimed',
              timestamp: new Date().toISOString(),
              store_id: pharmacyData.store_id
            }
          ]
        });

      if (fillError) throw fillError;

      // Update prescription status
      await supabase
        .from('erx')
        .update({ status: 'routed' })
        .eq('id', prescription.id);

      // Log audit
      await supabase.from('audit_trail').insert({
        entity: 'erx',
        entity_id: prescription.id,
        action: 'pharmacy_claimed',
        diff: { pharmacy_id: pharmacyData.id, store_id: pharmacyData.store_id }
      });

      toast.success('Receta reclamada exitosamente');
      loadPharmacyData();
      setPrescription(null);
      setQrToken('');
      setActiveTab('fills');

    } catch (error) {
      console.error('Error claiming prescription:', error);
      toast.error('Error al reclamar receta');
    }
  };

  const handleUpdateFillStatus = async (fillId, newStatus) => {
    try {
      const { error } = await supabase
        .from('pharmacy_fills')
        .update({
          status: newStatus,
          events: supabase.raw(`events || '[{"type": "${newStatus}", "timestamp": "${new Date().toISOString()}"}]'::jsonb`)
        })
        .eq('id', fillId);

      if (error) throw error;

      // If delivered, update prescription status
      if (newStatus === 'delivered') {
        const fill = fills.find(f => f.id === fillId);
        if (fill) {
          await supabase
            .from('erx')
            .update({ status: 'filled' })
            .eq('id', fill.erx_id);
        }
      }

      toast.success('Estado actualizado');
      loadPharmacyData();

    } catch (error) {
      console.error('Error updating fill status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  if (loading && !pharmacyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-medical-600">Doctor.mx</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">Portal de Farmacia</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{pharmacyData?.name}</div>
              <div className="text-sm text-gray-500">ID: {pharmacyData?.store_id}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">Total surtidas</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.total_fills}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">Pendientes</div>
            <div className="text-3xl font-bold text-yellow-600">{analytics.pending_fills}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">Entregadas</div>
            <div className="text-3xl font-bold text-green-600">{analytics.delivered_fills}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl p-6 shadow-sm"
          >
            <div className="text-sm text-white/80 mb-1">Posición</div>
            <div className="text-3xl font-bold text-white">
              #{analytics.leaderboard_position || 'N/A'}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['scan', 'fills', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-medical-500 text-medical-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'scan' && 'Escanear QR'}
                  {tab === 'fills' && 'Recetas'}
                  {tab === 'analytics' && 'Analítica'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Scan Tab */}
            {activeTab === 'scan' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-medical-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Escanear código QR
                  </h2>
                  <p className="text-gray-600">
                    Ingresa el token de la receta o escanea el código QR del paciente
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Token de receta
                    </label>
                    <input
                      type="text"
                      value={qrToken}
                      onChange={(e) => setQrToken(e.target.value)}
                      placeholder="ERX-xxxxxxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent font-mono"
                      onKeyPress={(e) => e.key === 'Enter' && handleScanQR()}
                    />
                  </div>

                  <button
                    onClick={handleScanQR}
                    disabled={loading || !qrToken.trim()}
                    className="w-full py-4 bg-gradient-to-r from-medical-500 to-medical-600 text-white font-bold rounded-lg hover:from-medical-600 hover:to-medical-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Buscando...' : '🔍 Buscar receta'}
                  </button>
                </div>

                {/* Prescription Display */}
                {prescription && (
                  <div className="mt-8">
                    <PrescriptionView
                      prescription={prescription}
                      patient={prescription.users}
                      doctor={prescription.doctors?.users}
                    />

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleClaimPrescription}
                        className="flex-1 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Reclamar y surtir
                      </button>
                      <button
                        onClick={() => {
                          setPrescription(null);
                          setQrToken('');
                        }}
                        className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fills Tab */}
            {activeTab === 'fills' && (
              <div>
                {fills.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No hay recetas surtidas
                    </h3>
                    <p className="text-gray-600">
                      Las recetas que surtas aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fills.map((fill) => (
                      <div
                        key={fill.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-medical-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {fill.erx?.users?.name || 'Paciente'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {fill.erx?.payload?.medications?.length || 0} medicamentos
                            </div>
                          </div>
                          <select
                            value={fill.status}
                            onChange={(e) => handleUpdateFillStatus(fill.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                              fill.status === 'delivered'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : fill.status === 'ready'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}
                          >
                            <option value="received">Recibida</option>
                            <option value="ready">Lista</option>
                            <option value="delivered">Entregada</option>
                          </select>
                        </div>

                        <div className="text-xs text-gray-500">
                          Reclamada: {new Date(fill.created_at).toLocaleString('es-MX')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-brand-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analítica y reportes
                </h3>
                <p className="text-gray-600">
                  Próximamente: gráficos de desempeño, tendencias y leaderboard
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
