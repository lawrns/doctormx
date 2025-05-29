import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  FileText, 
  Download, 
  Search,
  Filter,
  Heart,
  Droplets,
  Brain,
  Bone,
  Stethoscope,
  CheckCircle,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  preparation: string[];
  description: string;
  icon: React.ComponentType<any>;
}

interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
  results?: {
    parameter: string;
    value: string;
    reference: string;
    status: 'normal' | 'high' | 'low';
  }[];
}

const LAB_TESTS: LabTest[] = [
  {
    id: '1',
    name: 'Biometría Hemática Completa',
    category: 'Hematología',
    price: 180,
    duration: '2-4 horas',
    preparation: ['Ayuno de 8 horas', 'No medicamentos anticoagulantes'],
    description: 'Análisis completo de células sanguíneas, detecta anemia, infecciones y trastornos de coagulación.',
    icon: Droplets
  },
  {
    id: '2',
    name: 'Perfil Lipídico',
    category: 'Cardiología',
    price: 220,
    duration: '4-6 horas',
    preparation: ['Ayuno de 12 horas', 'No alcohol 24 horas antes'],
    description: 'Evaluación de colesterol total, HDL, LDL y triglicéridos para riesgo cardiovascular.',
    icon: Heart
  },
  {
    id: '3',
    name: 'Glucosa en Ayunas',
    category: 'Endocrinología',
    price: 80,
    duration: '2 horas',
    preparation: ['Ayuno de 8-12 horas'],
    description: 'Detección de diabetes y prediabetes mediante medición de glucosa sanguínea.',
    icon: Droplets
  },
  {
    id: '4',
    name: 'Función Tiroidea (TSH, T3, T4)',
    category: 'Endocrinología',
    price: 350,
    duration: '24-48 horas',
    preparation: ['No requiere ayuno'],
    description: 'Evaluación completa de la función tiroidea para detectar hipo o hipertiroidismo.',
    icon: Brain
  },
  {
    id: '5',
    name: 'Densitometría Ósea',
    category: 'Reumatología',
    price: 450,
    duration: '30 minutos',
    preparation: ['No suplementos de calcio 24 horas antes'],
    description: 'Medición de densidad ósea para detectar osteoporosis y riesgo de fracturas.',
    icon: Bone
  },
  {
    id: '6',
    name: 'Examen General de Orina',
    category: 'Urología',
    price: 120,
    duration: '2-4 horas',
    preparation: ['Primera orina de la mañana', 'Higiene genital previa'],
    description: 'Análisis completo de orina para detectar infecciones, diabetes y problemas renales.',
    icon: Droplets
  }
];

const MOCK_RESULTS: LabResult[] = [
  {
    id: '1',
    testName: 'Biometría Hemática Completa',
    date: '2024-01-15',
    status: 'completed',
    results: [
      { parameter: 'Hemoglobina', value: '14.2', reference: '12.0-15.5 g/dL', status: 'normal' },
      { parameter: 'Hematocrito', value: '42.1', reference: '36.0-46.0 %', status: 'normal' },
      { parameter: 'Leucocitos', value: '7.8', reference: '4.5-11.0 x10³/μL', status: 'normal' },
      { parameter: 'Plaquetas', value: '285', reference: '150-450 x10³/μL', status: 'normal' }
    ]
  },
  {
    id: '2',
    testName: 'Perfil Lipídico',
    date: '2024-01-10',
    status: 'completed',
    results: [
      { parameter: 'Colesterol Total', value: '195', reference: '<200 mg/dL', status: 'normal' },
      { parameter: 'HDL', value: '45', reference: '>40 mg/dL', status: 'normal' },
      { parameter: 'LDL', value: '125', reference: '<130 mg/dL', status: 'normal' },
      { parameter: 'Triglicéridos', value: '150', reference: '<150 mg/dL', status: 'normal' }
    ]
  },
  {
    id: '3',
    testName: 'Función Tiroidea',
    date: '2024-01-20',
    status: 'pending'
  }
];

const LabTestingPageSimple = () => {
  const [activeTab, setActiveTab] = useState<'tests' | 'results' | 'schedule'>('tests');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  const categories = ['all', 'Hematología', 'Cardiología', 'Endocrinología', 'Reumatología', 'Urología'];

  const filteredTests = LAB_TESTS.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En Proceso';
      default: return 'Desconocido';
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'high': return 'text-red-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Laboratorio Clínico Digital
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Agenda estudios de laboratorio, consulta resultados y mantén un historial completo 
            de tus análisis clínicos. Integrado con IMSS, ISSSTE y laboratorios privados.
          </p>
        </div>

        {/* Integration Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Integración con Sistema de Salud Mexicano</h3>
              <p className="text-blue-700 text-sm">
                Conectado con IMSS, ISSSTE y más de 500 laboratorios certificados en todo México.
                Tus resultados se sincronizan automáticamente con tu expediente médico digital.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8 max-w-md">
          {[
            { id: 'tests', label: 'Estudios', icon: Stethoscope },
            { id: 'results', label: 'Resultados', icon: FileText },
            { id: 'schedule', label: 'Agendar', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar estudios de laboratorio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Todas las categorías' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tests Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => {
                  const IconComponent = test.icon;
                  return (
                    <div
                      key={test.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTest(test)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-teal-600" />
                        </div>
                        <span className="text-sm text-gray-500">{test.category}</span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{test.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-teal-600">
                          ${test.price} MXN
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {test.duration}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Resultados</h2>
              
              <div className="space-y-4">
                {MOCK_RESULTS.map(result => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                        <p className="text-gray-500 text-sm">Fecha: {result.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                        {result.status === 'completed' && (
                          <button className="text-teal-600 hover:text-teal-700">
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {result.results && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Resultados:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {result.results.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-gray-700">{item.parameter}:</span>
                              <div className="text-right">
                                <span className={`font-medium ${getResultStatusColor(item.status)}`}>
                                  {item.value}
                                </span>
                                <div className="text-xs text-gray-500">{item.reference}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Agendar Cita de Laboratorio</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Seleccionar Laboratorio</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Laboratorio IMSS Zona Norte', address: 'Av. Revolución 1234, Col. Centro', distance: '2.3 km' },
                      { name: 'Chopo Laboratorios', address: 'Blvd. Manuel Ávila Camacho 567', distance: '3.1 km' },
                      { name: 'Laboratorio Polanco', address: 'Av. Presidente Masaryk 890', distance: '4.2 km' }
                    ].map((lab, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{lab.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{lab.address}</p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {lab.distance}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Horarios Disponibles</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                      <button
                        key={time}
                        className="py-2 px-3 border border-gray-300 rounded-lg text-sm hover:border-teal-300 hover:bg-teal-50"
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors">
                      Confirmar Cita
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Detail Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                      <selectedTest.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{selectedTest.name}</h2>
                      <p className="text-gray-600">{selectedTest.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-700">{selectedTest.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Preparación Requerida</h3>
                    <ul className="space-y-1">
                      {selectedTest.preparation.map((prep, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{prep}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-teal-600">${selectedTest.price} MXN</div>
                      <div className="text-sm text-gray-500">Tiempo de entrega: {selectedTest.duration}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTest(null);
                        setActiveTab('schedule');
                      }}
                      className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Agendar Estudio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTestingPageSimple;