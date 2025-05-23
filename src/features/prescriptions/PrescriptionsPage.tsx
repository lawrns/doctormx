import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, RefreshCw, Calendar, Clock, 
  User, AlertTriangle, CheckCircle, Search, Filter,
  Pill, MapPin, ShoppingBag, Plus, Eye, X, Star,
  Building, Truck, CreditCard, Bell
} from 'lucide-react';

interface Prescription {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Date;
  status: 'active' | 'expired' | 'completed' | 'pending';
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  validUntil: Date;
  canRenew: boolean;
  digitalCode: string;
  totalCost: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  duration: string;
  quantity: number;
  price: number;
  generic?: string;
  sideEffects?: string[];
  category: 'analgesic' | 'antibiotic' | 'cardiovascular' | 'dermatologic' | 'other';
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  hasStock: boolean;
  price: number;
  estimatedTime: string;
  rating: number;
  isOpen24h: boolean;
  deliveryAvailable: boolean;
}

const PrescriptionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'renewals'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPharmacies, setShowPharmacies] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'completed'>('all');

  const [prescriptions] = useState<Prescription[]>([
    {
      id: 'RX001',
      doctorName: 'Dra. María González',
      doctorSpecialty: 'Cardiología',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'active',
      diagnosis: 'Hipertensión arterial leve',
      validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      canRenew: true,
      digitalCode: 'DX-2024-001-MG',
      totalCost: 420,
      medications: [
        {
          id: 'M1',
          name: 'Losartán',
          dosage: '50mg',
          instructions: 'Tomar 1 tableta cada 24 horas con alimentos',
          duration: '30 días',
          quantity: 30,
          price: 240,
          generic: 'Losartán potásico',
          category: 'cardiovascular',
          sideEffects: ['Mareo leve', 'Tos seca ocasional']
        },
        {
          id: 'M2',
          name: 'Hidroclorotiazida',
          dosage: '25mg',
          instructions: 'Tomar 1 tableta cada 24 horas en la mañana',
          duration: '30 días',
          quantity: 30,
          price: 180,
          category: 'cardiovascular'
        }
      ]
    },
    {
      id: 'RX002',
      doctorName: 'Dr. Carlos Mendoza',
      doctorSpecialty: 'Dermatología',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: 'completed',
      diagnosis: 'Dermatitis atópica',
      validUntil: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      canRenew: false,
      digitalCode: 'DX-2024-002-CM',
      totalCost: 150,
      medications: [
        {
          id: 'M3',
          name: 'Crema de hidrocortisona',
          dosage: '1%',
          instructions: 'Aplicar 2 veces al día en área afectada',
          duration: '7 días',
          quantity: 1,
          price: 150,
          category: 'dermatologic'
        }
      ]
    },
    {
      id: 'RX003',
      doctorName: 'Dra. Ana Rodríguez',
      doctorSpecialty: 'Medicina General',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      status: 'expired',
      diagnosis: 'Infección de vías respiratorias altas',
      validUntil: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      canRenew: true,
      digitalCode: 'DX-2024-003-AR',
      totalCost: 320,
      medications: [
        {
          id: 'M4',
          name: 'Amoxicilina',
          dosage: '500mg',
          instructions: 'Tomar 1 cápsula cada 8 horas con alimentos',
          duration: '7 días',
          quantity: 21,
          price: 180,
          category: 'antibiotic'
        },
        {
          id: 'M5',
          name: 'Ibuprofeno',
          dosage: '400mg',
          instructions: 'Tomar 1 tableta cada 8 horas si hay dolor',
          duration: '5 días',
          quantity: 15,
          price: 140,
          category: 'analgesic'
        }
      ]
    }
  ]);

  const [nearbyPharmacies] = useState<Pharmacy[]>([
    {
      id: 'P1',
      name: 'Farmacia del Ahorro',
      address: 'Av. Insurgentes 123, Roma Norte',
      distance: 0.8,
      hasStock: true,
      price: 420,
      estimatedTime: '15-30 min',
      rating: 4.5,
      isOpen24h: true,
      deliveryAvailable: true
    },
    {
      id: 'P2',
      name: 'Farmacias Similares',
      address: 'Calle Reforma 456, Centro',
      distance: 1.2,
      hasStock: true,
      price: 380,
      estimatedTime: '20-40 min',
      rating: 4.2,
      isOpen24h: false,
      deliveryAvailable: true
    },
    {
      id: 'P3',
      name: 'Pharmacy Express',
      address: 'Centro Comercial Plaza, Condesa',
      distance: 1.5,
      hasStock: false,
      price: 0,
      estimatedTime: 'No disponible',
      rating: 4.0,
      isOpen24h: false,
      deliveryAvailable: false
    },
    {
      id: 'P4',
      name: 'Farmacia San Pablo',
      address: 'Av. Reforma 789, Juárez',
      distance: 2.1,
      hasStock: true,
      price: 400,
      estimatedTime: '25-45 min',
      rating: 4.7,
      isOpen24h: true,
      deliveryAvailable: true
    }
  ]);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = 
      (activeTab === 'active' && prescription.status === 'active') ||
      (activeTab === 'history' && (prescription.status === 'completed' || prescription.status === 'expired')) ||
      (activeTab === 'renewals' && prescription.canRenew);
    
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    
    return matchesSearch && matchesTab && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Vencida';
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardiovascular': return '❤️';
      case 'antibiotic': return '🦠';
      case 'analgesic': return '💊';
      case 'dermatologic': return '🧴';
      default: return '💊';
    }
  };

  const PrescriptionCard: React.FC<{ prescription: Prescription; index: number }> = ({ prescription, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{prescription.doctorName}</h3>
          <p className="text-brand-jade-600 font-medium">{prescription.doctorSpecialty}</p>
          <p className="text-sm text-gray-600 mt-1">{prescription.diagnosis}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
            {getStatusLabel(prescription.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Emitida: {prescription.date.toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span>Válida hasta: {prescription.validUntil.toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>Código: {prescription.digitalCode}</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Medicamentos: </span>
            {prescription.medications.length}
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">
            Total: ${prescription.totalCost}
          </div>
          {prescription.canRenew && (
            <div className="flex items-center gap-1 text-sm text-brand-jade-600">
              <RefreshCw className="w-4 h-4" />
              <span>Renovable</span>
            </div>
          )}
        </div>
      </div>

      {/* Medications Preview */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Medicamentos:</h4>
        <div className="space-y-2">
          {prescription.medications.slice(0, 2).map(medication => (
            <div key={medication.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <span className="text-lg">{getCategoryIcon(medication.category)}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{medication.name} {medication.dosage}</div>
                <div className="text-xs text-gray-600">{medication.instructions}</div>
              </div>
              <div className="text-sm font-medium">${medication.price}</div>
            </div>
          ))}
          {prescription.medications.length > 2 && (
            <div className="text-sm text-gray-600 text-center py-2">
              +{prescription.medications.length - 2} medicamentos más
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedPrescription(prescription)}
          className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm"
        >
          <Eye className="w-4 h-4 mr-2 inline" />
          Ver Detalles
        </button>
        
        {prescription.status === 'active' && (
          <>
            <button
              onClick={() => setShowPharmacies(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 mr-2 inline" />
              Comprar
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Download className="w-4 h-4 mr-2 inline" />
              Descargar PDF
            </button>
          </>
        )}
        
        {prescription.canRenew && (
          <button className="border border-brand-jade-300 text-brand-jade-700 px-4 py-2 rounded-lg hover:bg-brand-jade-50 transition-colors text-sm">
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Renovar
          </button>
        )}
      </div>
    </motion.div>
  );

  const PrescriptionDetail: React.FC<{ prescription: Prescription }> = ({ prescription }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Detalles de la Receta</h2>
          <button
            onClick={() => setSelectedPrescription(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información del Doctor</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nombre:</span> {prescription.doctorName}</p>
                <p><span className="font-medium">Especialidad:</span> {prescription.doctorSpecialty}</p>
                <p><span className="font-medium">Diagnóstico:</span> {prescription.diagnosis}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información de la Receta</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Fecha:</span> {prescription.date.toLocaleDateString('es-ES')}</p>
                <p><span className="font-medium">Válida hasta:</span> {prescription.validUntil.toLocaleDateString('es-ES')}</p>
                <p><span className="font-medium">Código:</span> {prescription.digitalCode}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                  {getStatusLabel(prescription.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Medicamentos Recetados</h3>
            <div className="space-y-4">
              {prescription.medications.map(medication => (
                <div key={medication.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(medication.category)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{medication.name}</h4>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                        {medication.generic && (
                          <p className="text-xs text-gray-500">Genérico: {medication.generic}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${medication.price}</div>
                      <div className="text-sm text-gray-600">Cantidad: {medication.quantity}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Instrucciones:</span> {medication.instructions}</p>
                      <p><span className="font-medium">Duración:</span> {medication.duration}</p>
                    </div>
                    
                    {medication.sideEffects && (
                      <div>
                        <p className="font-medium mb-1">Efectos secundarios posibles:</p>
                        <ul className="text-gray-600 text-xs space-y-1">
                          {medication.sideEffects.map((effect, index) => (
                            <li key={index}>• {effect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {prescription.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Notas del Doctor</h3>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{prescription.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total estimado:</span>
              <span className="text-2xl font-bold text-brand-jade-600">${prescription.totalCost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PharmacyModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Farmacias Cercanas</h2>
          <button
            onClick={() => setShowPharmacies(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar farmacia o dirección..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {nearbyPharmacies.map(pharmacy => (
              <div key={pharmacy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Building className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {pharmacy.address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">{pharmacy.distance} km</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{pharmacy.rating}</span>
                        </div>
                        {pharmacy.isOpen24h && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">24h</span>
                        )}
                        {pharmacy.deliveryAvailable && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            <Truck className="w-3 h-3 inline mr-1" />
                            Entrega
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {pharmacy.hasStock ? (
                      <>
                        <div className="text-lg font-bold text-green-600">${pharmacy.price}</div>
                        <div className="text-sm text-gray-600">{pharmacy.estimatedTime}</div>
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto mt-1" />
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-red-600">Sin stock</div>
                        <AlertTriangle className="w-5 h-5 text-red-500 ml-auto mt-1" />
                      </>
                    )}
                  </div>
                </div>
                
                {pharmacy.hasStock && (
                  <div className="flex gap-3">
                    <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm">
                      <ShoppingBag className="w-4 h-4 mr-2 inline" />
                      Reservar
                    </button>
                    {pharmacy.deliveryAvailable && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <Truck className="w-4 h-4 mr-2 inline" />
                        Solicitar entrega
                      </button>
                    )}
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <MapPin className="w-4 h-4 mr-2 inline" />
                      Ver en mapa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Recetas Médicas</h1>
            <p className="text-gray-600 mt-1">Gestiona tus recetas digitales y encuentra farmacias cercanas</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="text-sm">Recordatorios</span>
            </button>
            <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nueva Receta
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por doctor, diagnóstico o medicamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="expired">Vencidas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'active', label: 'Activas', icon: Pill, count: prescriptions.filter(p => p.status === 'active').length },
            { id: 'history', label: 'Historial', icon: Clock, count: prescriptions.filter(p => p.status === 'completed' || p.status === 'expired').length },
            { id: 'renewals', label: 'Renovables', icon: RefreshCw, count: prescriptions.filter(p => p.canRenew).length }
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
              {count > 0 && (
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
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'active' ? 'No hay recetas activas' : 
                 activeTab === 'history' ? 'No hay historial de recetas' : 'No hay recetas renovables'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'active' ? 'Tus recetas activas aparecerán aquí' : 
                 activeTab === 'history' ? 'Tu historial de recetas aparecerá aquí' : 'Las recetas que puedes renovar aparecerán aquí'}
              </p>
              {activeTab === 'active' && (
                <button className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors">
                  Buscar Doctor
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription, index) => (
                <PrescriptionCard 
                  key={prescription.id} 
                  prescription={prescription} 
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedPrescription && (
        <PrescriptionDetail prescription={selectedPrescription} />
      )}
      
      {showPharmacies && <PharmacyModal />}
    </div>
  );
};

export default PrescriptionsPage; 