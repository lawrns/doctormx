import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [newLink, setNewLink] = useState({
    base_url: 'https://doctor.mx/register',
    utm_source: '',
    utm_medium: 'affiliate',
    utm_campaign: ''
  });

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'commissions', label: 'Comisiones', icon: '💰' },
    { id: 'materials', label: 'Materiales', icon: '📋' },
    { id: 'links', label: 'Enlaces', icon: '🔗' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ];

  useEffect(() => {
    if (user?.id) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsResponse = await fetch(`/api/affiliate/${user.id}/analytics`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Load performance data
      const performanceResponse = await fetch(`/api/affiliate/${user.id}/performance`);
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformance(performanceData);
      }

      // Load commissions
      const commissionsResponse = await fetch(`/api/affiliate/${user.id}/commissions`);
      if (commissionsResponse.ok) {
        const commissionsData = await commissionsResponse.json();
        setCommissions(commissionsData);
      }

      // Load marketing materials
      const materialsResponse = await fetch(`/api/affiliate/${user.id}/materials`);
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData);
      }
      
      // Set affiliate data
      setAffiliateData({
        id: user.id,
        name: user.user_metadata?.full_name || 'Usuario',
        email: user.email || '',
        status: 'active',
        commission_rate: 0.15,
        join_date: '2024-01-15'
      });

    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast.error('Error al cargar datos del afiliado');
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateLink = async () => {
    try {
      const response = await fetch(`/api/affiliate/${user.id}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Enlace generado exitosamente');
        
        // Copy to clipboard
        navigator.clipboard.writeText(data.link);
        toast.info('Enlace copiado al portapapeles');
        
        setShowLinkGenerator(false);
      } else {
        throw new Error('Error al generar enlace');
      }
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      toast.error('Error al generar enlace');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de afiliados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Afiliados
          </h1>
          <p className="text-gray-600">
            Gana comisiones recomendando Doctor.mx
          </p>
        </div>

        {/* Stats Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clics Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_clicks}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_signups}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.conversion_rate.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Comisiones</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.total_commissions)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Afiliado</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{affiliateData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{affiliateData?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                          {affiliateData?.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tasa de Comisión:</span>
                        <span className="font-medium">{(affiliateData?.commission_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Ingreso:</span>
                        <span className="font-medium">{formatDate(affiliateData?.join_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clics Totales:</span>
                        <span className="font-medium">{analytics?.total_clicks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registros:</span>
                        <span className="font-medium">{analytics?.total_signups || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consultas:</span>
                        <span className="font-medium">{analytics?.total_consultations || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pagos:</span>
                        <span className="font-medium">{analytics?.total_payments || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos Generados:</span>
                        <span className="font-medium">{formatCurrency(analytics?.total_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisiones Totales:</span>
                        <span className="font-medium text-green-600">{formatCurrency(analytics?.total_commissions || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {analytics?.top_utm_sources && analytics.top_utm_sources.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes de Tráfico</h3>
                    <div className="space-y-2">
                      {analytics.top_utm_sources.map((source, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{source.source}</span>
                          <span className="font-medium">{source.count} clics</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Análisis Detallado</h3>
                
                {performance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clics
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registros
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Consultas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ingresos
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comisiones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {performance.map((day) => (
                          <tr key={day.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(day.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.clicks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.signups}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.consultations}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(day.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {formatCurrency(day.commissions)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay datos de rendimiento disponibles</p>
                  </div>
                )}
              </div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Comisiones</h3>
                
                {commissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Método de Pago
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {commissions.map((commission) => (
                          <tr key={commission.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(commission.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {commission.commission_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(commission.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded ${
                                commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {commission.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {commission.payment_method || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay comisiones disponibles</p>
                  </div>
                )}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Materiales de Marketing</h3>
                </div>
                
                {materials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((material) => (
                      <div key={material.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{material.title}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {material.material_type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                        {material.image_url && (
                          <div className="mb-4">
                            <img 
                              src={material.image_url} 
                              alt={material.title}
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}
                        {material.link_url && (
                          <button
                            onClick={() => copyToClipboard(material.link_url)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                          >
                            Copiar Enlace
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay materiales de marketing disponibles</p>
                  </div>
                )}
              </div>
            )}

            {/* Links Tab */}
            {activeTab === 'links' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Generador de Enlaces</h3>
                  <button
                    onClick={() => setShowLinkGenerator(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generar Nuevo Enlace
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Enlace Base</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`https://doctor.mx/register?affiliate=${user.id}`}
                      readOnly
                      className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => copyToClipboard(`https://doctor.mx/register?affiliate=${user.id}`)}
                      className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Información de Pago</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de Pago Preferido
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Transferencia Bancaria</option>
                        <option>PayPal</option>
                        <option>OXXO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuenta Bancaria
                      </label>
                      <input
                        type="text"
                        placeholder="CLABE o número de cuenta"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Notificaciones</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Nuevas comisiones</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Pagos procesados</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Reportes semanales</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link Generator Modal */}
        {showLinkGenerator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Enlace de Afiliado</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Base
                  </label>
                  <input
                    type="text"
                    value={newLink.base_url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, base_url: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente UTM
                  </label>
                  <input
                    type="text"
                    value={newLink.utm_source}
                    onChange={(e) => setNewLink(prev => ({ ...prev, utm_source: e.target.value }))}
                    placeholder="facebook, instagram, email"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medio UTM
                  </label>
                  <input
                    type="text"
                    value={newLink.utm_medium}
                    onChange={(e) => setNewLink(prev => ({ ...prev, utm_medium: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaña UTM
                  </label>
                  <input
                    type="text"
                    value={newLink.utm_campaign}
                    onChange={(e) => setNewLink(prev => ({ ...prev, utm_campaign: e.target.value }))}
                    placeholder="promo_octubre"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowLinkGenerator(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={generateAffiliateLink}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generar Enlace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}