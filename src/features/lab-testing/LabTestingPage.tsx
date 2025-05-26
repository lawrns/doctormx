import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube, Calendar, Clock, MapPin, Phone, User, Mail,
  CheckCircle, Droplets, Heart, Activity, Brain, FileText,
  Shield, Star, Truck, Home, Search, Filter
} from 'lucide-react';

interface LabTest {
  id: string;
  name: string;
  category: 'routine' | 'cardiac' | 'diabetes' | 'hormonal' | 'liver' | 'kidney';
  description: string;
  price: number;
  duration: string;
  fastingRequired: boolean;
  sampleType: 'blood' | 'urine' | 'other';
  popularity: number;
  icon: React.ComponentType<any>;
}

const LabTestingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'schedule' | 'track'>('browse');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const labTests: LabTest[] = [
    {
      id: '1',
      name: 'Biometría Hemática Completa',
      category: 'routine',
      description: 'Análisis completo de células sanguíneas, detecta anemia, infecciones y otros trastornos',
      price: 320,
      duration: '24 horas',
      fastingRequired: false,
      sampleType: 'blood',
      popularity: 95,
      icon: Droplets
    },
    {
      id: '2',
      name: 'Perfil Lipídico',
      category: 'cardiac',
      description: 'Mide colesterol total, HDL, LDL y triglicéridos para evaluar riesgo cardiovascular',
      price: 280,
      duration: '24 horas',
      fastingRequired: true,
      sampleType: 'blood',
      popularity: 88,
      icon: Heart
    },
    {
      id: '3',
      name: 'Hemoglobina Glucosilada (HbA1c)',
      category: 'diabetes',
      description: 'Control de diabetes, mide el promedio de glucosa en sangre de los últimos 3 meses',
      price: 350,
      duration: '48 horas',
      fastingRequired: false,
      sampleType: 'blood',
      popularity: 82,
      icon: Activity
    },
    {
      id: '4',
      name: 'Función Tiroidea Completa',
      category: 'hormonal',
      description: 'TSH, T3, T4 libre - evalúa el funcionamiento de la glándula tiroides',
      price: 450,
      duration: '24 horas',
      fastingRequired: false,
      sampleType: 'blood',
      popularity: 79,
      icon: TestTube
    },
    {
      id: '5',
      name: 'Perfil Hepático',
      category: 'liver',
      description: 'ALT, AST, bilirrubinas - evalúa la función del hígado',
      price: 380,
      duration: '24 horas',
      fastingRequired: true,
      sampleType: 'blood',
      popularity: 73,
      icon: FileText
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos los análisis', count: labTests.length },
    { id: 'routine', name: 'Análisis de rutina', count: labTests.filter(t => t.category === 'routine').length },
    { id: 'cardiac', name: 'Perfil cardiovascular', count: labTests.filter(t => t.category === 'cardiac').length },
    { id: 'diabetes', name: 'Control de diabetes', count: labTests.filter(t => t.category === 'diabetes').length },
    { id: 'hormonal', name: 'Perfil hormonal', count: labTests.filter(t => t.category === 'hormonal').length },
    { id: 'liver', name: 'Función hepática', count: labTests.filter(t => t.category === 'liver').length }
  ];

  const filteredTests = labTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const getTotalPrice = () => {
    return selectedTests.reduce((total, testId) => {
      const test = labTests.find(t => t.id === testId);
      return total + (test?.price || 0);
    }, 0);
  };

  const TestCard: React.FC<{ test: LabTest; index: number }> = ({ test, index }) => {
    const isSelected = selectedTests.includes(test.id);
    const Icon = test.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'border-brand-jade-500 bg-brand-jade-50' 
            : 'border-gray-200 hover:border-brand-jade-300 hover:shadow-md'
        }`}
        onClick={() => toggleTestSelection(test.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isSelected ? 'bg-brand-jade-100' : 'bg-gray-100'}`}>
              <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-jade-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {categories.find(c => c.id === test.category)?.name || test.category}
                </span>
                <span>• {test.popularity}% solicitado</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-brand-jade-600">
              ${test.price}
            </div>
            <div className="text-sm text-gray-500">{test.duration}</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{test.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            {test.fastingRequired && (
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                <span>Ayuno requerido</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-blue-600">
              <Droplets className="w-4 h-4" />
              <span>Muestra de {test.sampleType === 'blood' ? 'sangre' : 'orina'}</span>
            </div>
          </div>
          
          {isSelected && (
            <CheckCircle className="w-5 h-5 text-brand-jade-500" />
          )}
        </div>
      </motion.div>
    );
  };

  const ScheduleAppointment = () => (
    <div className="space-y-6">
      {selectedTests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona tus análisis</h3>
          <p className="text-gray-600 mb-4">Primero selecciona los análisis que deseas realizar</p>
          <button
            onClick={() => setActiveTab('browse')}
            className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors"
          >
            Ver Análisis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="Juan Pérez González"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="55 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="juan@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección para muestras a domicilio</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección completa</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="Calle, número, colonia"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                      placeholder="Ciudad de México"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                      placeholder="03100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referencia</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                      placeholder="Entre qué calles"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fecha y Hora Preferida</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora preferida</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent">
                    <option>Seleccionar hora</option>
                    <option>7:00 AM - 9:00 AM</option>
                    <option>9:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 1:00 PM</option>
                    <option>1:00 PM - 3:00 PM</option>
                    <option>3:00 PM - 5:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Toma de muestra a domicilio</h4>
                    <p className="text-sm text-blue-700">
                      Un técnico especializado acudirá a tu domicilio para la toma de muestras. 
                      El servicio incluye material estéril y protocolo de bioseguridad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3 mb-4">
                {selectedTests.map(testId => {
                  const test = labTests.find(t => t.id === testId);
                  if (!test) return null;
                  
                  return (
                    <div key={testId} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{test.name}</p>
                        <p className="text-xs text-gray-500">{test.duration}</p>
                      </div>
                      <span className="text-sm font-medium">${test.price}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${getTotalPrice()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Toma a domicilio</span>
                  <span>$150</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-jade-600">${getTotalPrice() + 150}</span>
                </div>
              </div>
              
              <button className="w-full bg-brand-jade-600 text-white py-3 rounded-lg hover:bg-brand-jade-700 transition-colors font-medium">
                Confirmar Cita
              </button>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>• Resultados en línea</p>
                <p>• Soporte médico incluido</p>
                <p>• Cancelación gratuita 2hrs antes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Análisis Clínicos a Domicilio</h1>
            <p className="mt-2 text-lg text-gray-600">
              Análisis clínicos confiables desde la comodidad de tu hogar
            </p>
            
            {/* Trust indicators */}
            <div className="mt-6 flex justify-center space-x-8">
              <div className="flex items-center text-green-600">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Certificado</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Star className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">4.9/5 • 15,000+ pacientes</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Truck className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Toma a domicilio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', name: 'Explorar Análisis', icon: Search },
              { id: 'schedule', name: 'Agendar Cita', icon: Calendar },
              { id: 'track', name: 'Mis Resultados', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-brand-jade-500 text-brand-jade-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {tab.id === 'schedule' && selectedTests.length > 0 && (
                    <span className="bg-brand-jade-100 text-brand-jade-800 text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {selectedTests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar análisis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Tests Summary */}
            {selectedTests.length > 0 && (
              <div className="bg-brand-jade-50 border border-brand-jade-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-jade-600" />
                    <span className="font-medium text-brand-jade-900">
                      {selectedTests.length} análisis seleccionado{selectedTests.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-brand-jade-700">• Total: ${getTotalPrice()}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors"
                  >
                    Agendar Cita
                  </button>
                </div>
              </div>
            )}

            {/* Tests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTests.map((test, index) => (
                <TestCard key={test.id} test={test} index={index} />
              ))}
            </div>

            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron análisis</h3>
                <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && <ScheduleAppointment />}

        {activeTab === 'track' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mis Resultados</h3>
            <p className="text-gray-600 mb-6">
              Accede a tus resultados de análisis clínicos una vez que estén disponibles
            </p>
            <button className="bg-brand-jade-600 text-white px-6 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors">
              Iniciar Sesión para Ver Resultados
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTestingPage; 