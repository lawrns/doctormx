import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Icon from '../components/ui/Icon';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [funnelMetrics, setFunnelMetrics] = useState([]);
  const [acquisitionStats, setAcquisitionStats] = useState([]);
  const [dropoffPoints, setDropoffPoints] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, funnelRes, acquisitionRes, dropoffRes] = await Promise.all([
        fetch('/api/analytics/real-time-metrics'),
        fetch(`/api/analytics/funnel-metrics?start_date=${dateRange.start}&end_date=${dateRange.end}`),
        fetch(`/api/analytics/acquisition-stats?start_date=${dateRange.start}&end_date=${dateRange.end}`),
        fetch(`/api/analytics/dropoff-points?start_date=${dateRange.start}&end_date=${dateRange.end}`)
      ]);

      const [metricsData, funnelData, acquisitionData, dropoffData] = await Promise.all([
        metricsRes.json(),
        funnelRes.json(),
        acquisitionRes.json(),
        dropoffRes.json()
      ]);

      setMetrics(metricsData);
      setFunnelMetrics(funnelData.metrics || []);
      setAcquisitionStats(acquisitionData.stats || []);
      setDropoffPoints(dropoffData.dropoffPoints || []);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout variant="app">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Cargando analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="app">
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics de Onboarding
            </h1>
            <p className="text-gray-600">
              Métricas y análisis del proceso de incorporación de doctores
            </p>
          </div>

          {/* Date Range Selector */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Rango de fechas:
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                onClick={fetchAnalyticsData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Actualizar
              </button>
            </div>
          </Card>

          {/* Real-time Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.activeSessions)}</p>
                  </div>
                  <Icon name="users" size="lg" color="primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Registros Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.todaySignups)}</p>
                  </div>
                  <Icon name="user-plus" size="lg" color="success" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversiones Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.todayConversions)}</p>
                  </div>
                  <Icon name="check-circle" size="lg" color="success" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.averageSessionTime} min</p>
                  </div>
                  <Icon name="clock" size="lg" color="warning" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.conversionRate)}</p>
                  </div>
                  <Icon name="chart-bar" size="lg" color="primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mayor Abandono</p>
                    <p className="text-lg font-bold text-gray-900">{metrics.topDropoffStage}</p>
                  </div>
                  <Icon name="exclamation-triangle" size="lg" color="warning" />
                </div>
              </Card>
            </div>
          )}

          {/* Funnel Metrics */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="chart-bar" size="md" color="primary" />
              Métricas del Embudo
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eventos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctores Únicos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de Conversión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de Abandono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {funnelMetrics.map((stage, index) => (
                    <tr key={stage.stage_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stage.stage_name.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stage.total_events)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stage.unique_doctors)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stage.conversion_rate >= 80 ? 'bg-green-100 text-green-800' :
                          stage.conversion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(stage.conversion_rate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stage.dropoff_rate <= 20 ? 'bg-green-100 text-green-800' :
                          stage.dropoff_rate <= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(stage.dropoff_rate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stage.avg_time_minutes ? `${stage.avg_time_minutes.toFixed(1)} min` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Dropoff Points */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="exclamation-triangle" size="md" color="warning" />
              Puntos de Abandono
            </h2>
            
            <div className="space-y-4">
              {dropoffPoints.map((point, index) => (
                <div key={point.stage_name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {point.stage_name.replace('_', ' ').toUpperCase()}
                    </h3>
                    <span className="text-sm font-medium text-red-600">
                      {formatPercentage(point.dropoff_rate)} abandono
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {formatNumber(point.dropoff_count)} doctores abandonaron en esta etapa
                  </div>
                  <div className="text-xs text-gray-500">
                    Razones comunes: {point.common_reasons.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Acquisition Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="trending-up" size="md" color="success" />
              Estadísticas de Adquisición
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nuevos Registros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Onboarding Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suscripciones Activas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primera Consulta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de Conversión
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acquisitionStats.slice(0, 10).map((stat, index) => (
                    <tr key={stat.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(stat.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stat.new_signups)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stat.completed_onboarding)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stat.active_subscriptions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stat.first_consultations)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stat.conversion_rate >= 60 ? 'bg-green-100 text-green-800' :
                          stat.conversion_rate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(stat.conversion_rate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
