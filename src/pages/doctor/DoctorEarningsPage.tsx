import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../contexts/DoctorAuthContext';
import { DoctorEarningsService, EarningsAnalytics, DoctorEarnings } from '../../services/telemedicine/DoctorEarningsService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar, 
  Users, 
  CreditCard,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Clock
} from 'lucide-react';

interface PendingPayouts {
  totalAmount: number;
  earningsCount: number;
  oldestPendingDate: string;
  canPayout: boolean;
}

const DoctorEarningsPage: React.FC = () => {
  const { doctorProfile, user } = useDoctorAuth();
  const [analytics, setAnalytics] = useState<EarningsAnalytics | null>(null);
  const [recentEarnings, setRecentEarnings] = useState<DoctorEarnings[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayouts | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  // Load earnings data
  const loadEarningsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load analytics
      const analyticsData = await DoctorEarningsService.getEarningsAnalytics(user.id);
      setAnalytics(analyticsData);

      // Load recent earnings (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const earningsData = await DoctorEarningsService.getDoctorEarnings(user.id, startDate, endDate);
      setRecentEarnings(earningsData);

      // Load pending payouts
      const payoutsData = await DoctorEarningsService.getPendingPayouts(user.id);
      setPendingPayouts(payoutsData);

    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarningsData();
  }, [user?.id]);

  // Request payout
  const requestPayout = async () => {
    if (!user?.id || !pendingPayouts?.canPayout) return;

    try {
      // In a real implementation, this would process the payout
      alert('Solicitud de pago enviada. Recibirás el pago el próximo viernes.');
      await loadEarningsData(); // Refresh data
    } catch (error) {
      console.error('Error requesting payout:', error);
    }
  };

  // Generate tax report
  const generateTaxReport = async () => {
    if (!user?.id) return;

    try {
      const currentYear = new Date().getFullYear();
      const report = await DoctorEarningsService.generateTaxReport(user.id, currentYear);
      
      // In a real implementation, this would generate and download a PDF
      console.log('Tax report:', report);
      alert(`Reporte fiscal ${currentYear} generado. Total: $${report.totalEarnings.toLocaleString()} MXN`);
    } catch (error) {
      console.error('Error generating tax report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de ganancias...</p>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso no autorizado</h2>
            <p className="text-gray-600">Debes ser un doctor verificado para ver las ganancias.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Ganancias y Pagos
            </h1>
            <p className="text-gray-600">
              Dr. {doctorProfile.nombre_completo}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={generateTaxReport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Reporte Fiscal</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Este mes</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${analytics.monthlyEarnings.toLocaleString()} MXN
                    </p>
                    <div className="flex items-center space-x-1 text-xs">
                      {analytics.growthRate >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={analytics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {Math.abs(analytics.growthRate).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consultas totales</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.totalConsultations}</p>
                    <p className="text-xs text-gray-500">
                      ${analytics.averagePerConsultation.toFixed(0)} promedio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pendiente de pago</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${analytics.pendingPayments.toLocaleString()} MXN
                    </p>
                    <p className="text-xs text-gray-500">
                      {pendingPayouts?.earningsCount || 0} consultas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Esta semana</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${analytics.weeklyEarnings.toLocaleString()} MXN
                    </p>
                    <p className="text-xs text-gray-500">
                      ${analytics.dailyEarnings.toLocaleString()} hoy
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payout Section */}
        {pendingPayouts && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Solicitar Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    ${pendingPayouts.totalAmount.toLocaleString()} MXN disponibles
                  </p>
                  <p className="text-sm text-gray-600">
                    {pendingPayouts.earningsCount} consultas • 
                    Desde {pendingPayouts.oldestPendingDate ? new Date(pendingPayouts.oldestPendingDate).toLocaleDateString() : 'hoy'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pagos se procesan los viernes • Mínimo $100 MXN
                  </p>
                </div>
                <Button
                  onClick={requestPayout}
                  disabled={!pendingPayouts.canPayout}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {pendingPayouts.canPayout ? 'Solicitar Pago' : 'Mínimo no alcanzado'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Chart */}
        {analytics && analytics.earningsByDay.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Ganancias Diarias (Últimos 30 días)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end space-x-1 overflow-x-auto">
                {analytics.earningsByDay.map((day, index) => {
                  const maxAmount = Math.max(...analytics.earningsByDay.map(d => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center min-w-8"
                      title={`${day.date}: $${day.amount} MXN (${day.consultations} consultas)`}
                    >
                      <div
                        className="w-6 bg-teal-500 rounded-t hover:bg-teal-600 transition-colors cursor-pointer"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1 transform rotate-45">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>Promedio diario: ${(analytics.monthlyEarnings / 30).toFixed(0)} MXN</span>
                <span>Mejor día: ${Math.max(...analytics.earningsByDay.map(d => d.amount)).toLocaleString()} MXN</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Ganancias Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEarnings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay ganancias recientes</p>
                ) : (
                  recentEarnings.slice(0, 10).map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        <div>
                          <p className="font-medium text-gray-800">
                            ${earning.amount.toFixed(2)} MXN
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(earning.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={earning.status === 'paid' ? 'default' : 'secondary'}
                        className={
                          earning.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {earning.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          {analytics && analytics.earningsByMonth.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Resumen Mensual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.earningsByMonth.slice(-6).reverse().map((month) => (
                    <div
                      key={month.month}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(month.month + '-01').toLocaleDateString('es-MX', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {month.consultations} consultas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ${month.amount.toLocaleString()} MXN
                        </p>
                        <p className="text-xs text-gray-500">
                          ${(month.amount / Math.max(month.consultations, 1)).toFixed(0)} promedio
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-600">
                  ${analytics?.totalEarnings.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600">Total acumulado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.totalConsultations || 0}
                </p>
                <p className="text-sm text-gray-600">Consultas realizadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  ${analytics?.paidThisMonth.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600">Pagado este mes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  ${(analytics?.averagePerConsultation || 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Promedio por consulta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorEarningsPage;