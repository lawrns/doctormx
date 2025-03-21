import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Input, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Switch,
  Textarea
} from '../../components/ui';
import { AlertCircle, BarChart2, Calendar, CheckCircle, ChevronDown, ChevronRight, Copy, Download, Edit, Facebook, Globe, Info, Instagram, Link as LinkIcon, Linkedin, Mail, Megaphone, MessageCircle, PieChart, Plus, Send, Share2, Trash, TrendingUp, Twitter, Upload, Users } from 'lucide-react';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotion' | 'reminder' | 'follow_up';
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  audience: string;
  recipients: number;
  scheduledDate?: Date;
  sentDate?: Date;
  openRate?: number;
  clickRate?: number;
}

interface ReferralSource {
  id: string;
  name: string;
  patients: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribed: Date;
  status: 'active' | 'unsubscribed';
  openRate: number;
  lastOpened?: Date;
}

interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  preview?: string;
}

const MarketingToolsPage: React.FC = () => {
  const { doctorId } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletterTemplates, setNewsletterTemplates] = useState<NewsletterTemplate[]>([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<MarketingCampaign>>({
    name: '',
    type: 'newsletter',
    audience: 'all',
    status: 'draft'
  });
  const [emailContent, setEmailContent] = useState('');
  
  // Load marketing data
  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          // Mock campaigns
          const mockCampaigns: MarketingCampaign[] = [
            {
              id: '1',
              name: 'Boletín de Abril: Consejos de prevención COVID-19',
              type: 'newsletter',
              status: 'sent',
              audience: 'Todos los pacientes',
              recipients: 145,
              scheduledDate: new Date('2023-04-01T09:00:00'),
              sentDate: new Date('2023-04-01T09:05:00'),
              openRate: 68,
              clickRate: 24
            },
            {
              id: '2',
              name: 'Promoción consulta preventiva verano',
              type: 'promotion',
              status: 'active',
              audience: 'Pacientes sin consulta en últimos 6 meses',
              recipients: 87,
              scheduledDate: new Date('2023-05-15T10:00:00'),
              sentDate: new Date('2023-05-15T10:02:00'),
              openRate: 52,
              clickRate: 31
            },
            {
              id: '3',
              name: 'Recordatorio citas programadas semana 20',
              type: 'reminder',
              status: 'scheduled',
              audience: 'Pacientes con cita esta semana',
              recipients: 12,
              scheduledDate: new Date('2023-05-14T08:00:00')
            },
            {
              id: '4',
              name: 'Seguimiento post-consulta pacientes diabetes',
              type: 'follow_up',
              status: 'draft',
              audience: 'Pacientes con diabetes',
              recipients: 28
            }
          ];
          
          // Mock referral sources
          const mockReferralSources: ReferralSource[] = [
            {
              id: '1',
              name: 'Doctoralia',
              patients: 87,
              percentage: 45,
              trend: 'up',
              trendValue: 12
            },
            {
              id: '2',
              name: 'Referidos pacientes',
              patients: 42,
              percentage: 22,
              trend: 'up',
              trendValue: 8
            },
            {
              id: '3',
              name: 'Sitio web',
              patients: 35,
              percentage: 18,
              trend: 'stable',
              trendValue: 0
            },
            {
              id: '4',
              name: 'Redes sociales',
              patients: 22,
              percentage: 11,
              trend: 'up',
              trendValue: 5
            },
            {
              id: '5',
              name: 'Otros',
              patients: 8,
              percentage: 4,
              trend: 'down',
              trendValue: 2
            }
          ];
          
          // Mock subscribers
          const mockSubscribers: Subscriber[] = Array.from({ length: 20 }, (_, i) => ({
            id: `sub_${i+1}`,
            name: `Paciente ${i+1}`,
            email: `paciente${i+1}@example.com`,
            subscribed: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
            status: Math.random() > 0.1 ? 'active' : 'unsubscribed',
            openRate: Math.floor(Math.random() * 100),
            lastOpened: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : undefined
          }));
          
          // Mock newsletter templates
          const mockTemplates: NewsletterTemplate[] = [
            {
              id: '1',
              name: 'Boletín mensual',
              description: 'Plantilla para boletín mensual con novedades y consejos',
              subject: 'Novedades y consejos de salud - {{month_year}}'
            },
            {
              id: '2',
              name: 'Promoción especial',
              description: 'Plantilla para promociones y descuentos',
              subject: '¡Oferta especial! {{promotion_name}}'
            },
            {
              id: '3',
              name: 'Recordatorio de cita',
              description: 'Plantilla para recordatorios de citas programadas',
              subject: 'Recordatorio: Su cita está programada para {{appointment_date}}'
            },
            {
              id: '4',
              name: 'Seguimiento post-consulta',
              description: 'Plantilla para seguimiento después de la consulta',
              subject: 'Seguimiento de su visita del {{appointment_date}}'
            }
          ];
          
          setCampaigns(mockCampaigns);
          setReferralSources(mockReferralSources);
          setSubscribers(mockSubscribers);
          setNewsletterTemplates(mockTemplates);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching marketing data:', error);
        setLoading(false);
      }
    };
    
    fetchMarketingData();
  }, [doctorId]);
  
  // Create campaign
  const createCampaign = () => {
    if (!newCampaign.name) return;
    
    const campaign: MarketingCampaign = {
      id: `camp_${Date.now()}`,
      name: newCampaign.name || '',
      type: newCampaign.type || 'newsletter',
      status: 'draft',
      audience: newCampaign.audience || 'all',
      recipients: Math.floor(Math.random() * 100) + 20
    };
    
    setCampaigns([campaign, ...campaigns]);
    setShowNewCampaign(false);
    setNewCampaign({
      name: '',
      type: 'newsletter',
      audience: 'all',
      status: 'draft'
    });
  };
  
  // Delete campaign
  const deleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter(camp => camp.id !== campaignId));
  };
  
  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return 'No programado';
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format date with time
  const formatDateTime = (date?: Date) => {
    if (!date) return 'No programado';
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'scheduled':
        return 'Programado';
      case 'sent':
        return 'Enviado';
      case 'active':
        return 'Activo';
      default:
        return status;
    }
  };
  
  // Get campaign type text
  const getCampaignTypeText = (type: string) => {
    switch (type) {
      case 'newsletter':
        return 'Boletín';
      case 'promotion':
        return 'Promoción';
      case 'reminder':
        return 'Recordatorio';
      case 'follow_up':
        return 'Seguimiento';
      default:
        return type;
    }
  };
  
  // Get campaign type icon
  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'newsletter':
        return <Mail size={16} className="text-blue-500" />;
      case 'promotion':
        return <Megaphone size={16} className="text-purple-500" />;
      case 'reminder':
        return <Calendar size={16} className="text-amber-500" />;
      case 'follow_up':
        return <MessageCircle size={16} className="text-green-500" />;
      default:
        return <Mail size={16} className="text-gray-500" />;
    }
  };
  
  // Get trend icon
  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up') {
      return <span className="text-green-600 flex items-center"><TrendingUp size={16} className="mr-1" />+{value}%</span>;
    } else if (trend === 'down') {
      return <span className="text-red-600 flex items-center"><TrendingUp size={16} className="transform rotate-180 mr-1" />-{value}%</span>;
    } else {
      return <span className="text-gray-600 flex items-center"><TrendingUp size={16} className="transform rotate-90 mr-1" />0%</span>;
    }
  };
  
  return (
    <DashboardLayout title="Marketing y Crecimiento" loading={loading}>
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing y Crecimiento</h1>
            <p className="text-gray-500">
              Herramientas para promocionar tu práctica y hacer crecer tu base de pacientes
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="campaigns">
              <Mail size={16} className="mr-2" />
              Campañas
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users size={16} className="mr-2" />
              Referidos
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              <MessageCircle size={16} className="mr-2" />
              Suscriptores
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Mail size={16} className="mr-2" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 size={16} className="mr-2" />
              Redes Sociales
            </TabsTrigger>
          </TabsList>
          
          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Campañas de Marketing</h2>
              
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setShowNewCampaign(true)}
              >
                Nueva Campaña
              </Button>
            </div>
            
            {showNewCampaign && (
              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Nueva Campaña</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la campaña
                    </label>
                    <Input
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      placeholder="Ej: Boletín de Mayo 2023"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de campaña
                    </label>
                    <select
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="newsletter">Boletín informativo</option>
                      <option value="promotion">Promoción</option>
                      <option value="reminder">Recordatorio</option>
                      <option value="follow_up">Seguimiento</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Audiencia
                    </label>
                    <select
                      value={newCampaign.audience}
                      onChange={(e) => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all">Todos los pacientes</option>
                      <option value="active">Pacientes activos</option>
                      <option value="inactive">Pacientes inactivos</option>
                      <option value="new">Pacientes nuevos</option>
                      <option value="chronic">Pacientes con condiciones crónicas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plantilla
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar plantilla</option>
                      {newsletterTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewCampaign(false)}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={createCampaign}
                    disabled={!newCampaign.name}
                  >
                    Crear Campaña
                  </Button>
                </div>
              </Card>
            )}
            
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <Mail size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay campañas</h3>
                <p className="text-gray-500 mb-4">
                  Crea tu primera campaña para comenzar a conectar con tus pacientes.
                </p>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setShowNewCampaign(true)}
                >
                  Crear Primera Campaña
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaña
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Audiencia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estadísticas
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.recipients} destinatarios</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getCampaignTypeIcon(campaign.type)}
                            <span className="ml-2">{getCampaignTypeText(campaign.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.audience}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {campaign.status === 'sent' ? (
                              <>Enviado: {formatDateTime(campaign.sentDate)}</>
                            ) : campaign.status === 'scheduled' ? (
                              <>Programado: {formatDateTime(campaign.scheduledDate)}</>
                            ) : (
                              'No programado'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.status === 'sent' && (
                            <div className="flex space-x-4">
                              <div>
                                <div className="text-xs text-gray-500">Aperturas</div>
                                <div className="text-sm font-medium text-gray-900">{campaign.openRate}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Clics</div>
                                <div className="text-sm font-medium text-gray-900">{campaign.clickRate}%</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {campaign.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Edit size={16} />}
                                onClick={() => navigate(`/doctor-dashboard/marketing/campaigns/${campaign.id}/edit`)}
                              >
                                Editar
                              </Button>
                            )}
                            
                            {campaign.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Send size={16} />}
                                onClick={() => {
                                  // In a real implementation, send the campaign
                                }}
                              >
                                Enviar
                              </Button>
                            )}
                            
                            {campaign.status === 'sent' && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<BarChart2 size={16} />}
                                onClick={() => navigate(`/doctor-dashboard/marketing/campaigns/${campaign.id}/stats`)}
                              >
                                Estadísticas
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              icon={<Trash size={16} />}
                              onClick={() => deleteCampaign(campaign.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6 h-full">
                  <h2 className="text-lg font-semibold mb-6">Fuentes de Referidos</h2>
                  
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fuente
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pacientes
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Porcentaje
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tendencia
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {referralSources.map((source) => (
                          <tr key={source.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{source.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{source.patients}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{source.percentage}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${source.percentage}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getTrendIcon(source.trend, source.trendValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Programa de Referidos</h2>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">Estado del programa</p>
                      <p className="text-sm text-gray-500">Promoción para pacientes referidos</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-800 mb-2">Enlace de referido</h3>
                    <div className="flex items-center bg-white rounded border border-gray-200 p-2">
                      <input
                        type="text"
                        value="https://doctor.mx/dr-garcia/ref/12345"
                        readOnly
                        className="flex-1 text-sm border-none focus:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Copy size={16} />}
                        onClick={() => {
                          navigator.clipboard.writeText('https://doctor.mx/dr-garcia/ref/12345');
                          alert('Enlace copiado al portapapeles');
                        }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Comparte este enlace con tus pacientes para que puedan referir a sus amigos y familiares
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Descuento para referidos</p>
                      <p className="font-medium">15%</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Total de referidos</p>
                      <p className="font-medium">28</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Conversión a pacientes</p>
                      <p className="font-medium">82%</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/doctor-dashboard/marketing/referrals/settings')}
                  >
                    Configurar programa
                  </Button>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Crear Tarjetas de Referido</h2>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Genera tarjetas personalizadas para entregar a tus pacientes y fomentar las recomendaciones
                  </p>
                  
                  <div className="mb-4">
                    <img
                      src="https://via.placeholder.com/300x180/e2e8f0/475569?text=Vista+Previa+Tarjeta"
                      alt="Vista previa de tarjeta de referido"
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<Edit size={16} />}
                    >
                      Personalizar tarjeta
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<Download size={16} />}
                    >
                      Descargar PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<Printer size={16} />}
                    >
                      Imprimir tarjetas
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Lista de Suscriptores</h2>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        icon={<Upload size={16} />}
                      >
                        Importar
                      </Button>
                      
                      <Button
                        variant="outline"
                        icon={<Download size={16} />}
                      >
                        Exportar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Suscriptor
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha de suscripción
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Engagement
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{subscriber.name}</div>
                              <div className="text-sm text-gray-500">{subscriber.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(subscriber.subscribed)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                subscriber.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {subscriber.status === 'active' ? 'Activo' : 'Dado de baja'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                  <div 
                                    className={`h-full rounded-full ${
                                      subscriber.openRate > 75 ? 'bg-green-500' :
                                      subscriber.openRate > 50 ? 'bg-blue-500' :
                                      subscriber.openRate > 25 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${subscriber.openRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">{subscriber.openRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {}}
                                  title="Ver detalles"
                                >
                                  <ChevronRight size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Estadísticas de Suscriptores</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Total de suscriptores</span>
                        <span className="text-sm font-medium text-gray-900">{subscribers.length}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Activos</span>
                        <span className="text-sm font-medium text-gray-900">
                          {subscribers.filter(s => s.status === 'active').length} ({Math.round(subscribers.filter(s => s.status === 'active').length / subscribers.length * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ 
                          width: `${Math.round(subscribers.filter(s => s.status === 'active').length / subscribers.length * 100)}%` 
                        }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Tasa de apertura media</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(subscribers.reduce((sum, s) => sum + s.openRate, 0) / subscribers.length)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ 
                          width: `${Math.round(subscribers.reduce((sum, s) => sum + s.openRate, 0) / subscribers.length)}%` 
                        }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Agregar Suscriptor</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <Input placeholder="Nombre del paciente" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input placeholder="email@ejemplo.com" />
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <input type="checkbox" id="consent" className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2" />
                      <label htmlFor="consent" className="text-sm text-gray-700">
                        El paciente ha dado su consentimiento para recibir comunicaciones
                      </label>
                    </div>
                    
                    <Button variant="primary" className="w-full">
                      Agregar Suscriptor
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletterTemplates.map((template) => (
                <Card key={template.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={16} />}
                      title="Editar plantilla"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                  
                  <div className="border border-gray-200 rounded-md p-3 mb-3 bg-gray-50">
                    <p className="text-sm font-medium">Asunto:</p>
                    <p className="text-sm text-gray-700">{template.subject}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye size={16} />}
                    >
                      Vista previa
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Mail size={16} />}
                    >
                      Usar plantilla
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center h-full">
                <Plus size={24} className="text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-700 mb-1">Nueva Plantilla</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Crea una nueva plantilla para tus comunicaciones
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/doctor-dashboard/marketing/templates/new')}
                >
                  Crear Plantilla
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          {/* Social Media Tab */}
          <TabsContent value="social">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Integración con Redes Sociales</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Facebook size={24} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">Facebook</h3>
                          <p className="text-sm text-gray-500">Conecta tu página profesional</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                      >
                        Conectar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-pink-100 rounded-full p-2">
                          <Instagram size={24} className="text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">Instagram</h3>
                          <p className="text-sm text-gray-500">Conecta tu cuenta profesional</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                      >
                        Conectar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Twitter size={24} className="text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">Twitter</h3>
                          <p className="text-sm text-gray-500">Conecta tu cuenta profesional</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                      >
                        Conectar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Linkedin size={24} className="text-blue-700" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">LinkedIn</h3>
                          <p className="text-sm text-gray-500">Conecta tu perfil profesional</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">Conectado</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                        >
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <div className="flex items-start">
                      <Info size={18} className="text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-blue-700">
                          Conectar tus redes sociales te permite compartir automáticamente tus campañas, 
                          artículos y promociones directamente desde la plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 mt-6">
                  <h2 className="text-lg font-semibold mb-4">Publicaciones programadas</h2>
                  
                  <div className="bg-gray-50 p-6 text-center rounded-lg mb-4">
                    <Calendar size={36} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-700">No hay publicaciones programadas</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Programa contenido para compartir automáticamente en tus redes sociales
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    icon={<Plus size={16} />}
                  >
                    Programar nueva publicación
                  </Button>
                </Card>
              </div>
              
              <div>
                <Card className="p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Contenido Sugerido</h2>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">Consejos de salud digestiva</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        5 consejos para mantener una buena salud digestiva durante el verano.
                      </p>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Share2 size={14} />}
                        >
                          Compartir
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">Prevención de golpes de calor</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Cómo prevenir los golpes de calor durante esta temporada.
                      </p>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Share2 size={14} />}
                        >
                          Compartir
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">Beneficios del ejercicio moderado</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Por qué el ejercicio moderado regular es clave para tu salud.
                      </p>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Share2 size={14} />}
                        >
                          Compartir
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="link"
                    className="w-full mt-2 text-blue-600"
                  >
                    Ver más sugerencias
                  </Button>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Estadísticas de Redes Sociales</h2>
                  
                  <div className="bg-gray-50 p-6 text-center rounded-lg mb-4">
                    <LinkIcon size={36} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-700">Sin datos disponibles</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Conecta tus redes sociales para ver estadísticas
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </DashboardLayout>
  );
};

export default MarketingToolsPage;