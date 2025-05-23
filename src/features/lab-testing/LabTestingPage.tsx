import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, User, Phone, Heart, Activity,
  TestTube, Droplets, FileText, Truck, CheckCircle,
  AlertTriangle, Star, Filter, Search, Home, Shield
} from 'lucide-react';

interface LabTest {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  fastingRequired: boolean;
  sampleType: 'blood' | 'urine' | 'saliva' | 'stool';
  popularity: number;
  icon: React.ElementType;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price?: number;
}

interface TestRequest {
  id: string;
  tests: LabTest[];
  appointmentDate: string;
  timeSlot: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  address: string;
  totalPrice: number;
  resultDate?: string;
}

const LabTestingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'schedule' | 'requests'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    { id: 'all', name: 'Todos los Análisis', count: 45 },
    { id: 'routine', name: 'Análisis de Rutina', count: 12 },
    { id: 'cardiac', name: 'Salud Cardiovascular', count: 8 },
    { id: 'diabetes', name: 'Diabetes', count: 6 },
    { id: 'hormonal', name: 'Perfil Hormonal', count: 9 },
    { id: 'liver', name: 'Función Hepática', count: 5 },
    { id: 'kidney', name: 'Función Renal', count: 5 }
  ];

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

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '08:00 - 10:00', available: true },
    { id: '2', time: '10:00 - 12:00', available: true },
    { id: '3', time: '12:00 - 14:00', available: false },
    { id: '4', time: '14:00 - 16:00', available: true },
    { id: '5', time: '16:00 - 18:00', available: true, price: 50 },
    { id: '6', time: '18:00 - 20:00', available: true, price: 100 }
  ];

  const [testRequests] = useState<TestRequest[]>([
    {
      id: '1',
      tests: [labTests[0], labTests[1]],
      appointmentDate: '2024-05-25',
      timeSlot: '08:00 - 10:00',
      status: 'scheduled',
      address: 'Av. Reforma 123, Col. Centro, CDMX',
      totalPrice: 600,
    },
    {
      id: '2',
      tests: [labTests[2]],
      appointmentDate: '2024-05-20',
      timeSlot: '10:00 - 12:00',
      status: 'completed',
      address: 'Calle Insurgentes 456, Roma Norte, CDMX',
      totalPrice: 350,
      resultDate: '2024-05-22'
    }
  ]);

  const filteredTests = labTests.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addTest = (test: LabTest) => {
    if (!selectedTests.find(t => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeTest = (testId: string) => {
    setSelectedTests(selectedTests.filter(t => t.id !== testId));
  };

  const getTotalPrice = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado';
      case 'in-progress': return 'En proceso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const BrowseTests = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar análisis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tu ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Selected Tests Cart */}
      {selectedTests.length > 0 && (
        <div className="bg-brand-jade-50 border border-brand-jade-200 rounded-lg p-4">
          <h3 className="font-semibold text-brand-jade-800 mb-3">Análisis Seleccionados ({selectedTests.length})</h3>
          <div className="space-y-2 mb-3">
            {selectedTests.map(test => (
              <div key={test.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="text-sm font-medium">{test.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">${test.price}</span>
                  <button
                    onClick={() => removeTest(test.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-brand-jade-800">Total: ${getTotalPrice()}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => {
          const Icon = test.icon;
          const isSelected = selectedTests.find(t => t.id === test.id);
          
          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                isSelected ? 'border-brand-jade-500 bg-brand-jade-50' : 'border-gray-200'
              }`}
              onClick={() => isSelected ? removeTest(test.id) : addTest(test)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-jade-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-jade-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${isSelected ? 'text-brand-jade-600' : 'text-gray-900'}`}>
                    ${test.price}
                  </div>
                  <div className="text-sm text-gray-600">{test.duration}</div>
                </div>
              </div>
              
              <h3 className={`font-semibold mb-2 ${isSelected ? 'text-brand-jade-800' : 'text-gray-900'}`}>
                {test.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{test.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {test.fastingRequired && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                      Ayuno requerido
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {test.sampleType === 'blood' ? 'Sangre' :
                     test.sampleType === 'urine' ? 'Orina' :
                     test.sampleType === 'saliva' ? 'Saliva' : 'Heces'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{test.popularity}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

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
            {/* Patient Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent">
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección para la Visita</h3>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fecha y Hora</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de la cita</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario disponible</label>
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`w-full p-3 border rounded-lg text-left transition-colors ${
                          selectedTime === slot.time
                            ? 'border-brand-jade-500 bg-brand-jade-50 text-brand-jade-700'
                            : slot.available
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slot.time}</span>
                          {slot.price && (
                            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              +${slot.price}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Cita</h3>
              
              <div className="space-y-3 mb-4">
                {selectedTests.map(test => (
                  <div key={test.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm">{test.name}</span>
                    <span className="font-medium">${test.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${getTotalPrice()}</span>
                </div>
              </div>

              {selectedDate && selectedTime && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Fecha y hora:</div>
                  <div className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="font-medium">{selectedTime}</div>
                </div>
              )}

              <button
                disabled={!selectedDate || !selectedTime}
                className="w-full mt-6 bg-brand-jade-600 text-white py-3 rounded-lg hover:bg-brand-jade-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmar Cita
              </button>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Pago seguro al momento de la toma de muestra</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const RequestsHistory = () => (
    <div className="space-y-4">
      {testRequests.map((request) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cita #{request.id}
              </h3>
              <p className="text-gray-600">
                {new Date(request.appointmentDate).toLocaleDateString('es-ES')} • {request.timeSlot}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusLabel(request.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Análisis solicitados:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {request.tests.map(test => (
                  <li key={test.id} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {test.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dirección:</h4>
              <p className="text-sm text-gray-600">{request.address}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              Total: ${request.totalPrice}
            </div>
            <div className="flex gap-3">
              {request.status === 'completed' && request.resultDate && (
                <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm">
                  Ver Resultados
                </button>
              )}
              {request.status === 'scheduled' && (
                <>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Reagendar
                  </button>
                  <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análisis a Domicilio</h1>
            <p className="text-gray-600 mt-1">Toma de muestras profesional en la comodidad de tu hogar</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              <span>Servicio a domicilio</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Resultados en 24-48hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'browse', label: 'Explorar Análisis', icon: TestTube },
            { id: 'schedule', label: 'Agendar Cita', icon: Calendar, count: selectedTests.length },
            { id: 'requests', label: 'Mis Citas', icon: Clock, count: testRequests.length }
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand-jade-500 text-brand-jade-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === id
                    ? 'bg-brand-jade-100 text-brand-jade-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeTab === 'browse' && <BrowseTests />}
          {activeTab === 'schedule' && <ScheduleAppointment />}
          {activeTab === 'requests' && <RequestsHistory />}
        </div>
      </div>
    </div>
  );
};

export default LabTestingPage; 