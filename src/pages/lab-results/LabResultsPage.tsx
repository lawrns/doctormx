import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, FileText, Download, Upload, Search, Filter,
  Calendar, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Eye, Minus, Share2, Bell, User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import SimpleTabs from '../../components/ui/SimpleTabs';

interface LabResult {
  id: string;
  testName: string;
  category: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'other';
  orderDate: Date;
  resultDate: Date;
  status: 'pending' | 'ready' | 'critical' | 'reviewed';
  doctor: {
    name: string;
    specialty: string;
  };
  laboratory: {
    name: string;
    address: string;
    phone: string;
  };
  patientName: string;
  results: {
    parameter: string;
    value: string | number;
    unit?: string;
    normalRange: string;
    status: 'normal' | 'abnormal' | 'critical';
    trend?: 'up' | 'down' | 'stable';
  }[];
  summary?: string;
  recommendations?: string[];
  followUpRequired: boolean;
  attachments?: {
    name: string;
    url: string;
    type: 'pdf' | 'image';
  }[];
  cost: number;
  insuranceCovered?: boolean;
}

export default function LabResultsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Mock lab results data
  const [labResults] = useState<LabResult[]>([
    {
      id: '1',
      testName: 'Hemograma Completo',
      category: 'blood',
      orderDate: new Date('2024-02-10'),
      resultDate: new Date('2024-02-12'),
      status: 'ready',
      doctor: {
        name: 'Dra. María González',
        specialty: 'Medicina Interna'
      },
      laboratory: {
        name: 'Laboratorio Clínico San Ángel',
        address: 'Av. Revolución 1234, San Ángel, CDMX',
        phone: '55-1234-5678'
      },
      patientName: 'Tu',
      results: [
        {
          parameter: 'Hemoglobina',
          value: 14.2,
          unit: 'g/dL',
          normalRange: '12.0-15.5',
          status: 'normal'
        },
        {
          parameter: 'Hematocrito',
          value: 42.1,
          unit: '%',
          normalRange: '36.0-46.0',
          status: 'normal'
        },
        {
          parameter: 'Leucocitos',
          value: 8200,
          unit: '/μL',
          normalRange: '4000-10000',
          status: 'normal'
        },
        {
          parameter: 'Plaquetas',
          value: 280000,
          unit: '/μL',
          normalRange: '150000-450000',
          status: 'normal'
        }
      ],
      summary: 'Hemograma dentro de parámetros normales. No se observan alteraciones significativas.',
      followUpRequired: false,
      cost: 450,
      insuranceCovered: true
    },
    {
      id: '2',
      testName: 'Perfil Lipídico',
      category: 'blood',
      orderDate: new Date('2024-02-15'),
      resultDate: new Date('2024-02-16'),
      status: 'critical',
      doctor: {
        name: 'Dr. Carlos Mendoza',
        specialty: 'Cardiología'
      },
      laboratory: {
        name: 'Laboratorio Chopo',
        address: 'Insurgentes Sur 456, Roma Norte, CDMX',
        phone: '55-9876-5432'
      },
      patientName: 'Tu',
      results: [
        {
          parameter: 'Colesterol Total',
          value: 240,
          unit: 'mg/dL',
          normalRange: '<200',
          status: 'abnormal',
          trend: 'up'
        },
        {
          parameter: 'LDL',
          value: 160,
          unit: 'mg/dL',
          normalRange: '<100',
          status: 'critical',
          trend: 'up'
        },
        {
          parameter: 'HDL',
          value: 35,
          unit: 'mg/dL',
          normalRange: '>40',
          status: 'abnormal',
          trend: 'down'
        },
        {
          parameter: 'Triglicéridos',
          value: 220,
          unit: 'mg/dL',
          normalRange: '<150',
          status: 'abnormal',
          trend: 'up'
        }
      ],
      summary: 'Perfil lipídico alterado con colesterol LDL elevado y HDL bajo. Se recomienda seguimiento médico.',
      recommendations: [
        'Dieta baja en grasas saturadas',
        'Ejercicio cardiovascular regular',
        'Control médico en 3 meses',
        'Considerar tratamiento farmacológico'
      ],
      followUpRequired: true,
      cost: 320,
      insuranceCovered: true
    },
    {
      id: '3',
      testName: 'Radiografía de Tórax',
      category: 'imaging',
      orderDate: new Date('2024-02-18'),
      resultDate: new Date('2024-02-18'),
      status: 'ready',
      doctor: {
        name: 'Dr. Roberto Sánchez',
        specialty: 'Neumología'
      },
      laboratory: {
        name: 'Centro de Imagenología Médica',
        address: 'Polanco 789, Polanco, CDMX',
        phone: '55-5555-1234'
      },
      patientName: 'Carlos García Jr.',
      results: [
        {
          parameter: 'Campos pulmonares',
          value: 'Sin alteraciones',
          normalRange: 'Normal',
          status: 'normal'
        },
        {
          parameter: 'Corazón',
          value: 'Tamaño normal',
          normalRange: 'Normal',
          status: 'normal'
        },
        {
          parameter: 'Mediastino',
          value: 'Sin ensanchamiento',
          normalRange: 'Normal',
          status: 'normal'
        }
      ],
      summary: 'Radiografía de tórax normal. No se observan alteraciones pulmonares ni cardíacas.',
      followUpRequired: false,
      attachments: [
        {
          name: 'Radiografía_Tórax_PA.pdf',
          url: '/downloads/rx-torax-123.pdf',
          type: 'pdf'
        }
      ],
      cost: 180,
      insuranceCovered: true
    },
    {
      id: '4',
      testName: 'Glucosa en Ayunas',
      category: 'blood',
      orderDate: new Date('2024-02-20'),
      resultDate: new Date('2024-02-21'),
      status: 'pending',
      doctor: {
        name: 'Dra. Ana Morales',
        specialty: 'Endocrinología'
      },
      laboratory: {
        name: 'Laboratorio Polanco',
        address: 'Masaryk 123, Polanco, CDMX',
        phone: '55-2222-3333'
      },
      patientName: 'Tu',
      results: [],
      followUpRequired: false,
      cost: 85,
      insuranceCovered: true
    }
  ]);

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'ready', label: 'Listos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'critical', label: 'Críticos' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return CheckCircle;
      case 'pending': return Clock;
      case 'critical': return AlertCircle;
      case 'reviewed': return Eye;
      default: return FileText;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blood': return '🩸';
      case 'urine': return '💧';
      case 'imaging': return '📷';
      case 'biopsy': return '🔬';
      default: return '📋';
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'abnormal': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.laboratory.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || result.category === filterCategory;
    const matchesTab = activeTab === 'all' || result.status === activeTab;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleDownloadResult = (resultId: string) => {
    showToast('Descargando resultado...', 'info');
    // Implementation for downloading result
  };

  const handleShareResult = (resultId: string) => {
    showToast('Resultado compartido con tu médico', 'success');
    // Implementation for sharing result
  };

  const handleViewDetail = (result: LabResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const criticalResults = labResults.filter(result => result.status === 'critical').length;
  const pendingResults = labResults.filter(result => result.status === 'pending').length;
  const readyResults = labResults.filter(result => result.status === 'ready').length;

  return (
    <>
      <SEO 
        title="Resultados de Laboratorio - DoctorMX"
        description="Gestiona y consulta todos tus resultados de laboratorio, estudios e imágenes médicas"
        keywords={['resultados laboratorio', 'estudios médicos', 'análisis clínicos']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <Link
                  to="/profile"
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Resultados de Laboratorio</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Resultado
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/lab-testing')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Solicitar Estudio
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por estudio, doctor o laboratorio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="blood">Análisis de Sangre</option>
              <option value="urine">Análisis de Orina</option>
              <option value="imaging">Estudios de Imagen</option>
              <option value="biopsy">Biopsias</option>
              <option value="other">Otros</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <FileText className="w-8 h-8 text-brand-jade-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-brand-jade-600">{labResults.length}</div>
              <div className="text-sm text-gray-600">Total Resultados</div>
            </Card>
            
            <Card className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{readyResults}</div>
              <div className="text-sm text-gray-600">Listos</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{pendingResults}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </Card>
            
            <Card className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{criticalResults}</div>
              <div className="text-sm text-gray-600">Críticos</div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SimpleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Results List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => {
                const StatusIcon = getStatusIcon(result.status);
                
                return (
                  <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{getCategoryIcon(result.category)}</div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{result.testName}</h3>
                            <Badge className={getStatusColor(result.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {result.status === 'ready' ? 'Listo' :
                               result.status === 'pending' ? 'Pendiente' :
                               result.status === 'critical' ? 'Crítico' : 'Revisado'}
                            </Badge>
                            {result.followUpRequired && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <Bell className="w-3 h-3 mr-1" />
                                Seguimiento
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              <span>Dr. {result.doctor.name} - {result.doctor.specialty}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Solicitado: {result.orderDate.toLocaleDateString('es-MX')}</span>
                              {result.resultDate && (
                                <span className="ml-4">
                                  Resultado: {result.resultDate.toLocaleDateString('es-MX')}
                                </span>
                              )}
                            </div>
                            <div>
                              <span>Laboratorio: {result.laboratory.name}</span>
                            </div>
                            {result.patientName !== 'Tu' && (
                              <div>
                                <span>Paciente: {result.patientName}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Results Preview */}
                          {result.results.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Resultados Principales:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {result.results.slice(0, 4).map((item, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-600">{item.parameter}:</span>
                                    <div className="flex items-center gap-1">
                                      <span className={`font-medium ${getResultStatusColor(item.status)}`}>
                                        {item.value} {item.unit}
                                      </span>
                                      {getTrendIcon(item.trend)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {result.results.length > 4 && (
                                <p className="text-xs text-gray-500 mt-2">
                                  +{result.results.length - 4} parámetros más
                                </p>
                              )}
                            </div>
                          )}

                          {result.summary && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{result.summary}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${result.cost} MXN
                        </p>
                        {result.insuranceCovered && (
                          <p className="text-xs text-green-600">Cubierto por seguro</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                      {result.status !== 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleViewDetail(result)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadResult(result.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareResult(result.id)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartir
                          </Button>
                        </>
                      )}
                      
                      {result.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Esperando resultados
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No se encontraron resultados</p>
                <Button onClick={() => navigate('/lab-testing')}>
                  Solicitar primer estudio
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Los resultados críticos o anormales requieren 
                  seguimiento médico inmediato. Contacta a tu doctor para interpretación 
                  y tratamiento adecuado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}