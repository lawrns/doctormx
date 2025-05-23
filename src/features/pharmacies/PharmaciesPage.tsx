import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, Star, Phone, Navigation, Search, Filter,
  Building, Truck, ShoppingBag, CreditCard, ArrowRight,
  Package, Shield, CheckCircle, AlertTriangle, Zap,
  Heart, Info, Users, Award, Calendar, Bell
} from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  chain: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  rating: number;
  reviewCount: number;
  isOpen24h: boolean;
  openingHours: string;
  phone: string;
  services: Service[];
  deliveryAvailable: boolean;
  deliveryTime: string;
  deliveryFee: number;
  paymentMethods: string[];
  specialties: string[];
  currentWaitTime: number;
  image: string;
  verified: boolean;
  hasParking: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  duration?: string;
  available: boolean;
  icon: React.ElementType;
}

const PharmaciesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'deliveryTime'>('distance');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [userLocation, setUserLocation] = useState('Av. Reforma 123, CDMX');

  const services: Service[] = [
    { id: 'prescription', name: 'Entrega de Recetas', description: 'Medicamentos con receta médica', icon: Package, available: true },
    { id: 'otc', name: 'Medicamentos Sin Receta', description: 'Analgésicos, vitaminas, suplementos', icon: ShoppingBag, available: true },
    { id: 'vaccination', name: 'Vacunación', description: 'Vacunas COVID-19, Influenza, Hepatitis', price: 350, duration: '15 min', icon: Shield, available: true },
    { id: 'bloodPressure', name: 'Medición de Presión', description: 'Monitoreo de presión arterial', price: 50, duration: '5 min', icon: Heart, available: true },
    { id: 'glucose', name: 'Glucometría', description: 'Medición de glucosa en sangre', price: 80, duration: '5 min', icon: Zap, available: true },
    { id: 'consultation', name: 'Consulta Farmacéutica', description: 'Asesoría sobre medicamentos', price: 120, duration: '20 min', icon: Users, available: true }
  ];

  const [pharmacies] = useState<Pharmacy[]>([
    {
      id: 'P1',
      name: 'Farmacia del Ahorro Reforma',
      chain: 'Farmacia del Ahorro',
      address: 'Av. Paseo de la Reforma 123, Juárez, CDMX',
      coordinates: { lat: 19.4326, lng: -99.1332 },
      distance: 0.3,
      rating: 4.6,
      reviewCount: 1250,
      isOpen24h: true,
      openingHours: '24 horas',
      phone: '+52 55 1234 5678',
      deliveryAvailable: true,
      deliveryTime: '30-45 min',
      deliveryFee: 35,
      paymentMethods: ['Efectivo', 'Tarjetas', 'Transfer', 'Vales'],
      specialties: ['Medicamentos especializados', 'Diabetes', 'Cardiología'],
      currentWaitTime: 5,
      image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop',
      verified: true,
      hasParking: true,
      services: services.slice(0, 5)
    },
    {
      id: 'P2',
      name: 'Farmacias Similares Centro',
      chain: 'Farmacias Similares',
      address: 'Calle 5 de Mayo 456, Centro Histórico, CDMX',
      coordinates: { lat: 19.4285, lng: -99.1372 },
      distance: 0.8,
      rating: 4.3,
      reviewCount: 890,
      isOpen24h: false,
      openingHours: '7:00 - 22:00',
      phone: '+52 55 2345 6789',
      deliveryAvailable: true,
      deliveryTime: '45-60 min',
      deliveryFee: 25,
      paymentMethods: ['Efectivo', 'Tarjetas', 'Transfer'],
      specialties: ['Medicamentos genéricos', 'Dermatología'],
      currentWaitTime: 12,
      image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&h=300&fit=crop',
      verified: true,
      hasParking: false,
      services: services.slice(0, 4)
    },
    {
      id: 'P3',
      name: 'Pharmacy Express Roma Norte',
      chain: 'Pharmacy Express',
      address: 'Av. Álvaro Obregón 789, Roma Norte, CDMX',
      coordinates: { lat: 19.4150, lng: -99.1580 },
      distance: 1.2,
      rating: 4.8,
      reviewCount: 650,
      isOpen24h: false,
      openingHours: '8:00 - 20:00',
      phone: '+52 55 3456 7890',
      deliveryAvailable: true,
      deliveryTime: '20-35 min',
      deliveryFee: 45,
      paymentMethods: ['Efectivo', 'Tarjetas', 'Transfer', 'PayPal'],
      specialties: ['Medicina estética', 'Suplementos premium'],
      currentWaitTime: 3,
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop',
      verified: true,
      hasParking: true,
      services: services
    },
    {
      id: 'P4',
      name: 'San Pablo Farmacia Condesa',
      chain: 'Farmacias San Pablo',
      address: 'Av. Michoacán 321, Condesa, CDMX',
      coordinates: { lat: 19.4067, lng: -99.1704 },
      distance: 1.8,
      rating: 4.5,
      reviewCount: 420,
      isOpen24h: true,
      openingHours: '24 horas',
      phone: '+52 55 4567 8901',
      deliveryAvailable: true,
      deliveryTime: '40-55 min',
      deliveryFee: 30,
      paymentMethods: ['Efectivo', 'Tarjetas', 'Transfer', 'Vales', 'Monedero electrónico'],
      specialties: ['Pediatría', 'Ginecología', 'Medicina natural'],
      currentWaitTime: 8,
      image: 'https://images.unsplash.com/photo-1512046849959-9c0fe60e28fa?w=400&h=300&fit=crop',
      verified: true,
      hasParking: true,
      services: services.slice(0, 4)
    }
  ]);

  const filterOptions = [
    { id: '24h', label: 'Abierto 24hrs', count: pharmacies.filter(p => p.isOpen24h).length },
    { id: 'delivery', label: 'Entrega a domicilio', count: pharmacies.filter(p => p.deliveryAvailable).length },
    { id: 'parking', label: 'Estacionamiento', count: pharmacies.filter(p => p.hasParking).length },
    { id: 'vaccination', label: 'Vacunación', count: pharmacies.filter(p => p.services.some(s => s.id === 'vaccination')).length },
    { id: 'verified', label: 'Verificadas', count: pharmacies.filter(p => p.verified).length }
  ];

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.chain.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = selectedFilters.length === 0 || selectedFilters.every(filter => {
      switch (filter) {
        case '24h': return pharmacy.isOpen24h;
        case 'delivery': return pharmacy.deliveryAvailable;
        case 'parking': return pharmacy.hasParking;
        case 'vaccination': return pharmacy.services.some(s => s.id === 'vaccination');
        case 'verified': return pharmacy.verified;
        default: return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'distance': return a.distance - b.distance;
      case 'rating': return b.rating - a.rating;
      case 'deliveryTime': return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
      default: return 0;
    }
  });

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 5) return 'text-green-600 bg-green-50';
    if (waitTime <= 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const PharmacyCard: React.FC<{ pharmacy: Pharmacy; index: number }> = ({ pharmacy, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <img 
          src={pharmacy.image} 
          alt={pharmacy.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {pharmacy.verified && (
            <span className="bg-brand-jade-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verificada
            </span>
          )}
          {pharmacy.isOpen24h && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              24h
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWaitTimeColor(pharmacy.currentWaitTime)}`}>
            ~{pharmacy.currentWaitTime} min espera
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
            <p className="text-sm text-brand-jade-600 font-medium">{pharmacy.chain}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{pharmacy.rating}</span>
              <span className="text-sm text-gray-600">({pharmacy.reviewCount})</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{pharmacy.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Navigation className="w-4 h-4" />
            <span>{pharmacy.distance} km • {pharmacy.openingHours}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{pharmacy.phone}</span>
          </div>
        </div>

        {/* Services Preview */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Servicios destacados:</h4>
          <div className="flex flex-wrap gap-2">
            {pharmacy.services.slice(0, 3).map(service => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs">
                  <Icon className="w-3 h-3" />
                  <span>{service.name}</span>
                </div>
              );
            })}
            {pharmacy.services.length > 3 && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                +{pharmacy.services.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Delivery Info */}
        {pharmacy.deliveryAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Entrega disponible</span>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium text-blue-900">{pharmacy.deliveryTime}</div>
                <div className="text-blue-700">${pharmacy.deliveryFee} envío</div>
              </div>
            </div>
          </div>
        )}

        {/* Specialties */}
        {pharmacy.specialties.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Especialidades:</h4>
            <div className="flex flex-wrap gap-1">
              {pharmacy.specialties.map(specialty => (
                <span key={specialty} className="bg-brand-jade-50 text-brand-jade-700 px-2 py-1 rounded text-xs">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPharmacy(pharmacy)}
            className="flex-1 bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors text-sm"
          >
            Ver Detalles
          </button>
          {pharmacy.deliveryAvailable && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Truck className="w-4 h-4 mr-2 inline" />
              Pedir
            </button>
          )}
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Navigation className="w-4 h-4 mr-2 inline" />
            Ir
          </button>
        </div>
      </div>
    </motion.div>
  );

  const PharmacyDetail: React.FC<{ pharmacy: Pharmacy }> = ({ pharmacy }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
        <div className="relative">
          <img 
            src={pharmacy.image} 
            alt={pharmacy.name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={() => setSelectedPharmacy(null)}
            className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-45" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white bg-opacity-95 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900">{pharmacy.name}</h2>
              <p className="text-brand-jade-600 font-medium">{pharmacy.chain}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Información de Contacto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{pharmacy.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{pharmacy.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{pharmacy.openingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-gray-400" />
                  <span>{pharmacy.distance} km de tu ubicación</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Calificación:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{pharmacy.rating}</span>
                    <span className="text-gray-600">({pharmacy.reviewCount} reseñas)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tiempo de espera:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getWaitTimeColor(pharmacy.currentWaitTime)}`}>
                    ~{pharmacy.currentWaitTime} minutos
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estacionamiento:</span>
                  <span className={pharmacy.hasParking ? 'text-green-600' : 'text-gray-600'}>
                    {pharmacy.hasParking ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verificada:</span>
                  <div className="flex items-center gap-1">
                    {pharmacy.verified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Sí</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-600">Pendiente</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Servicios Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pharmacy.services.map(service => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-jade-50 rounded-lg">
                        <Icon className="w-5 h-5 text-brand-jade-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {service.price && (
                              <span className="font-medium text-brand-jade-600">${service.price}</span>
                            )}
                            {service.duration && (
                              <span className="text-gray-600 ml-2">• {service.duration}</span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            service.available 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {service.available ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Information */}
          {pharmacy.deliveryAvailable && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Información de Entrega</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-900">Tiempo de entrega</div>
                    <div className="text-blue-700">{pharmacy.deliveryTime}</div>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-900">Costo de envío</div>
                    <div className="text-blue-700">${pharmacy.deliveryFee}</div>
                  </div>
                  <div className="text-center">
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-900">Pedido mínimo</div>
                    <div className="text-blue-700">$200</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Métodos de Pago</h3>
            <div className="flex flex-wrap gap-2">
              {pharmacy.paymentMethods.map(method => (
                <span key={method} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Specialties */}
          {pharmacy.specialties.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {pharmacy.specialties.map(specialty => (
                  <span key={specialty} className="bg-brand-jade-50 text-brand-jade-700 px-3 py-1 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button className="flex-1 bg-brand-jade-600 text-white px-6 py-3 rounded-lg hover:bg-brand-jade-700 transition-colors">
              <Navigation className="w-5 h-5 mr-2 inline" />
              Cómo llegar
            </button>
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <Phone className="w-5 h-5 mr-2 inline" />
              Llamar
            </button>
            {pharmacy.deliveryAvailable && (
              <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                <ShoppingBag className="w-5 h-5 mr-2 inline" />
                Pedir a domicilio
              </button>
            )}
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
            <h1 className="text-2xl font-bold text-gray-900">Farmacias Cercanas</h1>
            <p className="text-gray-600 mt-1">Encuentra la farmacia más conveniente para ti</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="text-sm">Alertas de stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Location and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar farmacia, cadena o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tu ubicación"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(filter => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFilters.includes(filter.id)
                    ? 'bg-brand-jade-100 text-brand-jade-700 border border-brand-jade-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-jade-500 focus:border-transparent"
          >
            <option value="distance">Ordenar por distancia</option>
            <option value="rating">Ordenar por calificación</option>
            <option value="deliveryTime">Ordenar por tiempo de entrega</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <p className="text-sm text-gray-600">
          Se encontraron <span className="font-medium">{filteredPharmacies.length}</span> farmacias 
          {selectedFilters.length > 0 && (
            <span> con los filtros seleccionados</span>
          )}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {filteredPharmacies.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron farmacias</h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar tus filtros o ampliar el área de búsqueda
              </p>
              <button 
                onClick={() => setSelectedFilters([])}
                className="bg-brand-jade-600 text-white px-4 py-2 rounded-lg hover:bg-brand-jade-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPharmacies.map((pharmacy, index) => (
                <PharmacyCard 
                  key={pharmacy.id} 
                  pharmacy={pharmacy} 
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pharmacy Detail Modal */}
      {selectedPharmacy && (
        <PharmacyDetail pharmacy={selectedPharmacy} />
      )}
    </div>
  );
};

export default PharmaciesPage; 