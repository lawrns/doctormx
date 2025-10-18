import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';

export default function AffiliateDashboard() {
  const [affiliateData, setAffiliateData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('doctor_connect');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'referrals', label: 'Referidos', icon: '👥' },
    { id: 'commissions', label: 'Comisiones', icon: '💰' },
    { id: 'marketing', label: 'Marketing', icon: '📢' },
    { id: 'payouts', label: 'Pagos', icon: '💳' }
  ];

  const programs = [
    {
      id: 'doctor_connect',
      name: 'Doctor Connect Program',
      description: 'Para médicos y profesionales de la salud',
      commissionRate: 15,
      minPayout: 1000,
      icon: '👨‍⚕️',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'influencer_program',
      name: 'Influencer Health Program',
      description: 'Para influencers y creadores de contenido',
      commissionRate: 10,
      minPayout: 500,
      icon: '📱',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'corporate_partnership',
      name: 'Corporate Partnership',
      description: 'Para empresas y organizaciones',
      commissionRate: 20,
      minPayout: 5000,
      icon: '🏢',
      color: 'from-green-500 to-green-600'
    }
  ];

  useEffect(() => {
    loadAffiliateData();
  }, []);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setAffiliateData({
        affiliate: {
          id: 'aff123',
          userId: 'user123',
          affiliateCode: 'DOC456',
          status: 'approved',
          joinDate: '2024-01-15T10:30:00Z',
          totalEarnings: 2500,
          pendingEarnings: 450,
          paidEarnings: 2050,
          totalReferrals: 25,
          activeReferrals: 18,
          conversionRate: 72
        },
        stats: {
          totalReferrals: 25,
          convertedReferrals: 18,
          conversionRate: 72,
          totalEarnings: 2500,
          pendingEarnings: 450,
          paidEarnings: 2050
        },
        recentReferrals: [
          {
            id: 'ref1',
            referredUserId: 'user456',
            status: 'converted',
            joinDate: '2024-01-20T14:30:00Z',
            conversionDate: '2024-01-22T09:15:00Z',
            commission: 150,
            users: { name: 'Ana García', email: 'ana@example.com' }
          },
          {
            id: 'ref2',
            referredUserId: 'user789',
            status: 'active',
            joinDate: '2024-01-21T16:45:00Z',
            commission: 0,
            users: { name: 'Carlos López', email: 'carlos@example.com' }
          }
        ],
        recentCommissions: [
          {
            id: 'comm1',
            amount: 150,
            type: 'subscription',
            status: 'paid',
            createdAt: '2024-01-22T09:15:00Z',
            description: 'Commission for subscription'
          },
          {
            id: 'comm2',
            amount: 75,
            type: 'consultation',
            status: 'pending',
            createdAt: '2024-01-23T11:30:00Z',
            description: 'Commission for consultation'
          }
        ],
        monthlyEarnings: 850
      });

    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast.error('Error al cargar datos de afiliado');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Solicitud enviada. Te contactaremos pronto.');
      setShowJoinForm(false);
    } catch (error) {
      toast.error('Error al enviar solicitud');
    }
  };

  const copyAffiliateCode = () => {
    navigator.clipboard.writeText(affiliateData?.affiliate?.affiliateCode || '');
    toast.success('Código copiado al portapapeles');
  };

  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    const code = affiliateData?.affiliate?.affiliateCode || '';
    return `${baseUrl}/register?ref=${code}`;
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(generateReferralLink());
    toast.success('Enlace copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!affiliateData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Programa de Afiliados
            </h2>
            <p className="text-gray-600 mb-8">
              Únete a nuestro programa de afiliados y gana comisiones por cada usuario que refieras
            </p>

            {/* Program Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedProgram === program.id
                      ? 'border-medical-500 bg-medical-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProgram(program.id)}
                >
                  <div className={`bg-gradient-to-r ${program.color} rounded-lg p-3 text-white mb-3`}>
                    <div className="text-2xl mb-1">{program.icon}</div>
                    <h3 className="font-semibold">{program.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                  <div className="text-sm">
                    <div className="font-semibold text-medical-600">{program.commissionRate}% comisión</div>
                    <div className="text-gray-500">Mín. pago: ${program.minPayout} MXN</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowJoinForm(true)}
              className="px-8 py-3 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
            >
              Unirse al Programa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dashboard de Afiliados
              </h2>
              <p className="text-gray-600">
                Código de afiliado: <span className="font-mono font-semibold text-medical-600">
                  {affiliateData.affiliate.affiliateCode}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyAffiliateCode}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Copiar Código
              </button>
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-medical-500 text-white rounded-lg hover:bg-medical-600 transition-colors"
              >
                Copiar Enlace
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-medical-500 text-medical-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">👥</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{affiliateData.stats.totalReferrals}</div>
                      <div className="text-blue-100 text-sm">Total referidos</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">💰</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${affiliateData.stats.totalEarnings}</div>
                      <div className="text-green-100 text-sm">Ganancias totales</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">⏳</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${affiliateData.stats.pendingEarnings}</div>
                      <div className="text-yellow-100 text-sm">Pendiente</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">📈</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{affiliateData.stats.conversionRate}%</div>
                      <div className="text-purple-100 text-sm">Conversión</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Earnings */}
              <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-xl p-6 border border-medical-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ganancias del Mes</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-medical-600">${affiliateData.monthlyEarnings}</div>
                    <div className="text-gray-600">Enero 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">vs mes anterior</div>
                    <div className="text-green-600 font-semibold">+15%</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Enlace de Referencia</h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={generateReferralLink()}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="px-4 py-2 bg-medical-500 text-white rounded-lg hover:bg-medical-600 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Comparte este enlace para que otros se registren con tu código
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Código de Afiliado</h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={affiliateData.affiliate.affiliateCode}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={copyAffiliateCode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Usa este código cuando compartas Doctor.mx
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                {affiliateData.recentReferrals.map((referral) => (
                  <div key={referral.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
                          <span className="text-medical-600 font-semibold">
                            {referral.users.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{referral.users.name}</div>
                          <div className="text-sm text-gray-600">{referral.users.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'converted'
                            ? 'bg-green-100 text-green-800'
                            : referral.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {referral.status === 'converted' ? 'Convertido' : 
                           referral.status === 'active' ? 'Activo' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Fecha de registro</div>
                        <div className="font-medium">
                          {new Date(referral.joinDate).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Comisión</div>
                        <div className="font-medium text-medical-600">
                          ${referral.commission}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Estado</div>
                        <div className="font-medium">
                          {referral.status === 'converted' ? 'Pagado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Commissions Tab */}
          {activeTab === 'commissions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                {affiliateData.recentCommissions.map((commission) => (
                  <div key={commission.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{commission.description}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(commission.createdAt).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-medical-600">
                          ${commission.amount}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          commission.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {commission.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tipo: {commission.type === 'subscription' ? 'Suscripción' : 
                             commission.type === 'consultation' ? 'Consulta' : 
                             commission.type === 'signup' ? 'Registro' : 'Renovación'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Herramientas de Marketing</h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: banners, materiales promocionales y herramientas de tracking
                </p>
                <button
                  onClick={() => toast.info('Herramientas de marketing próximamente disponibles')}
                  className="px-6 py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                >
                  Ver próximamente
                </button>
              </div>
            </motion.div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de Pagos</h3>
                <p className="text-gray-600 mb-4">
                  Configura tu método de pago y solicita retiros
                </p>
                <button
                  onClick={() => toast.info('Configuración de pagos próximamente disponible')}
                  className="px-6 py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                >
                  Configurar Pagos
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
