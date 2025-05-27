import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Calendar, FileText, Pill, Heart, Activity,
  AlertCircle, Download, Upload, Search, Filter, ChevronRight,
  Stethoscope, Thermometer, Droplet, Brain
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';

interface MedicalRecord {
  id: string;
  date: Date;
  type: 'consultation' | 'prescription' | 'lab' | 'vitals' | 'symptom';
  title: string;
  description: string;
  doctor?: string;
  medications?: string[];
  results?: any;
  attachments?: string[];
  severity?: 'low' | 'medium' | 'high';
}

interface VitalSign {
  id: string;
  date: Date;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  bloodGlucose?: number;
  oxygenSaturation?: number;
}

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Mock data - in production this would come from the database
  const [medicalRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      date: new Date('2024-01-15'),
      type: 'consultation',
      title: 'Consulta General - Dolor de cabeza',
      description: 'Paciente presenta dolor de cabeza recurrente. Se recomienda análisis adicionales.',
      doctor: 'Dr. García López',
      severity: 'medium'
    },
    {
      id: '2',
      date: new Date('2024-01-20'),
      type: 'prescription',
      title: 'Receta Médica',
      description: 'Medicamentos para migraña',
      medications: ['Paracetamol 500mg', 'Sumatriptán 50mg'],
      doctor: 'Dr. García López'
    },
    {
      id: '3',
      date: new Date('2024-02-01'),
      type: 'lab',
      title: 'Análisis de Sangre Completo',
      description: 'Hemograma completo y química sanguínea',
      results: {
        glucose: 95,
        cholesterol: 180,
        hemoglobin: 14.5
      }
    }
  ]);

  const [vitalSigns] = useState<VitalSign[]>([
    {
      id: '1',
      date: new Date('2024-02-15'),
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      temperature: 36.5,
      weight: 70,
      bloodGlucose: 95
    }
  ]);

  const [allergies, setAllergies] = useState<string[]>(['Penicilina', 'Polen']);
  const [chronicConditions, setChronicConditions] = useState<string[]>(['Hipertensión']);
  const [currentMedications, setCurrentMedications] = useState<string[]>(['Losartán 50mg']);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return Stethoscope;
      case 'prescription': return Pill;
      case 'lab': return FileText;
      case 'vitals': return Heart;
      case 'symptom': return Thermometer;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'text-blue-600 bg-blue-50';
      case 'prescription': return 'text-purple-600 bg-purple-50';
      case 'lab': return 'text-green-600 bg-green-50';
      case 'vitals': return 'text-red-600 bg-red-50';
      case 'symptom': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'timeline', label: 'Línea de Tiempo' },
    { id: 'vitals', label: 'Signos Vitales' },
    { id: 'conditions', label: 'Condiciones' },
    { id: 'medications', label: 'Medicamentos' }
  ];

  return (
    <>
      <SEO 
        title="Historial Médico - DoctorMX"
        description="Gestiona tu historial médico completo, incluyendo consultas, recetas, exámenes y signos vitales"
        keywords={['historial médico', 'expediente clínico', 'historia clínica']}
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
                <h1 className="text-2xl font-bold text-gray-900">Historial Médico</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Registro
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
                placeholder="Buscar en tu historial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
            >
              <option value="all">Todos los registros</option>
              <option value="consultation">Consultas</option>
              <option value="prescription">Recetas</option>
              <option value="lab">Exámenes</option>
              <option value="vitals">Signos Vitales</option>
              <option value="symptom">Síntomas</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const Icon = getTypeIcon(record.type);
                  const colorClass = getTypeColor(record.type);
                  
                  return (
                    <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{record.title}</h3>
                              <p className="text-gray-600 mt-1">{record.description}</p>
                              
                              {record.doctor && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Atendido por: {record.doctor}
                                </p>
                              )}
                              
                              {record.medications && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Medicamentos:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {record.medications.map((med, index) => (
                                      <Badge key={index} variant="secondary">
                                        <Pill className="w-3 h-3 mr-1" />
                                        {med}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {record.results && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Resultados:</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(record.results).map(([key, value]) => (
                                      <div key={key}>
                                        <span className="text-gray-600">{key}:</span>
                                        <span className="ml-2 font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {record.date.toLocaleDateString('es-MX')}
                              </p>
                              {record.severity && (
                                <Badge 
                                  className={`mt-2 ${
                                    record.severity === 'high' ? 'bg-red-100 text-red-700' :
                                    record.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {record.severity === 'high' ? 'Alta' :
                                   record.severity === 'medium' ? 'Media' : 'Baja'} prioridad
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron registros médicos</p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    Agregar primer registro
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Vitals */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Últimos Signos Vitales</h3>
                {vitalSigns.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 text-red-500 mr-3" />
                        <span>Presión Arterial</span>
                      </div>
                      <span className="font-medium">
                        {vitalSigns[0].bloodPressureSystolic}/{vitalSigns[0].bloodPressureDiastolic} mmHg
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-blue-500 mr-3" />
                        <span>Frecuencia Cardíaca</span>
                      </div>
                      <span className="font-medium">{vitalSigns[0].heartRate} bpm</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Thermometer className="w-5 h-5 text-orange-500 mr-3" />
                        <span>Temperatura</span>
                      </div>
                      <span className="font-medium">{vitalSigns[0].temperature}°C</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Droplet className="w-5 h-5 text-purple-500 mr-3" />
                        <span>Glucosa</span>
                      </div>
                      <span className="font-medium">{vitalSigns[0].bloodGlucose} mg/dL</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay signos vitales registrados</p>
                )}
                
                <Button className="w-full mt-4" variant="outline">
                  Registrar Signos Vitales
                </Button>
              </Card>

              {/* Vitals Chart Placeholder */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tendencias</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfica de tendencias</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allergies */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Alergias</h3>
                {allergies.length > 0 ? (
                  <div className="space-y-2">
                    {allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                          <span>{allergy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay alergias registradas</p>
                )}
                
                <Button className="w-full mt-4" variant="outline">
                  Agregar Alergia
                </Button>
              </Card>

              {/* Chronic Conditions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Condiciones Crónicas</h3>
                {chronicConditions.length > 0 ? (
                  <div className="space-y-2">
                    {chronicConditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <Heart className="w-5 h-5 text-blue-600 mr-3" />
                          <span>{condition}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay condiciones crónicas registradas</p>
                )}
                
                <Button className="w-full mt-4" variant="outline">
                  Agregar Condición
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="space-y-6">
              {/* Current Medications */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Medicamentos Actuales</h3>
                {currentMedications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMedications.map((medication, index) => (
                      <div key={index} className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <Pill className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">{medication}</p>
                              <p className="text-sm text-gray-600 mt-1">Tomar diariamente</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay medicamentos actuales registrados</p>
                )}
                
                <Button className="w-full mt-4" variant="outline">
                  Agregar Medicamento
                </Button>
              </Card>

              {/* Medication History */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Historial de Medicamentos</h3>
                <p className="text-gray-500">Próximamente: historial completo de medicamentos</p>
              </Card>
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Este historial médico es para tu referencia personal. 
                  Siempre consulta con un profesional de la salud para decisiones médicas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}