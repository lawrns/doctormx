import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Phone, Star, Pill, ShoppingCart, Tag, Check, Navigation, Car, Building, ChevronRight } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  phone: string;
  hasDelivery: boolean;
  deliveryTime: string;
  discounts: string[];
  specialties: string[];
  image: string;
  medications: MedicationStock[];
  acceptsInsurance: boolean;
  insuranceProviders: string[];
}

interface MedicationStock {
  id: string;
  name: string;
  genericName: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  quantity?: number;
  requiresPrescription: boolean;
  discount?: number;
}

interface PharmacyReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedMedications?: string[];
  userLocation?: { latitude: number; longitude: number };
}

// Mock data generator
const generateMockPharmacies = (medications: string[]): Pharmacy[] => {
  const pharmacyNames = [
    'Farmacias del Ahorro',
    'Farmacias Guadalajara',
    'Farmacias Benavides',
    'Farmacias San Pablo',
    'Farmacia Similares',
    'ISSEG Farmacia',
    'Farmacia Roma Norte',
    'Farmacia Especializada MX'
  ];

  const addresses = [
    'Av. Insurgentes Sur 1234, Roma Norte',
    'Calle Madero 567, Centro Histórico',
    'Av. Revolución 890, San Ángel',
    'Paseo de la Reforma 234, Polanco',
    'Av. Universidad 456, Del Valle',
    'Calle Regina 789, Centro',
    'Av. Álvaro Obregón 321, Roma Norte',
    'Calle Orizaba 654, Roma Norte'
  ];

  return pharmacyNames.map((name, index) => {
    const basePrice = Math.floor(Math.random() * 200) + 50;
    const hasDiscount = Math.random() > 0.5;
    
    const medicationStock: MedicationStock[] = medications.map((med, idx) => ({
      id: `med-${index}-${idx}`,
      name: med,
      genericName: `Genérico de ${med}`,
      price: basePrice + (idx * 25),
      originalPrice: hasDiscount ? basePrice + (idx * 25) + 50 : undefined,
      inStock: Math.random() > 0.2,
      quantity: Math.floor(Math.random() * 20) + 5,
      requiresPrescription: Math.random() > 0.5,
      discount: hasDiscount ? Math.floor(Math.random() * 30) + 10 : undefined
    }));

    return {
      id: `pharmacy-${index}`,
      name,
      address: addresses[index],
      distance: Number((Math.random() * 5 + 0.5).toFixed(1)),
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      isOpen: Math.random() > 0.3,
      openTime: '08:00',
      closeTime: index < 4 ? '24:00' : '22:00',
      phone: `55 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
      hasDelivery: Math.random() > 0.4,
      deliveryTime: '30-45 min',
      discounts: hasDiscount ? ['15% en genéricos', '2x1 en vitaminas'] : [],
      specialties: ['Genéricos', 'Medicamentos controlados', 'Dermocosméticos'],
      image: `/images/pharmacy-${(index % 4) + 1}.jpg`,
      medications: medicationStock,
      acceptsInsurance: Math.random() > 0.5,
      insuranceProviders: ['IMSS', 'ISSSTE', 'Seguro Popular', 'GNP', 'AXA']
    };
  });
};

function PharmacyReferralModal({ isOpen, onClose, suggestedMedications = [], userLocation }: PharmacyReferralModalProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [cart, setCart] = useState<{ medication: MedicationStock; quantity: number }[]>([]);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<'pickup' | 'delivery'>('pickup');

  const pharmacies = useMemo(() => 
    generateMockPharmacies(suggestedMedications).sort((a, b) => a.distance - b.distance),
    [suggestedMedications]
  );

  const addToCart = (medication: MedicationStock) => {
    setCart(prev => {
      const existing = prev.find(item => item.medication.id === medication.id);
      if (existing) {
        return prev.map(item => 
          item.medication.id === medication.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medication, quantity: 1 }];
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.medication.price * item.quantity), 0);
  };

  const handleReserve = () => {
    setShowDeliveryOptions(true);
  };

  const completeOrder = () => {
    // In a real app, this would send the order to the backend
    alert(`¡Orden confirmada! ${selectedDelivery === 'delivery' ? 'Tu pedido llegará en 30-45 minutos' : 'Puedes recoger tu pedido en 15 minutos'}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <Pill className="mr-2" />
                    Farmacias Cercanas
                  </h2>
                  <p className="text-green-100 mt-1">
                    {pharmacies.length} farmacias encontradas cerca de ti
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Pharmacy List */}
              <div className={`${selectedPharmacy ? 'w-1/3' : 'w-full'} overflow-y-auto border-r border-gray-200 transition-all duration-300`}>
                {pharmacies.map((pharmacy) => (
                  <motion.div
                    key={pharmacy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedPharmacy?.id === pharmacy.id ? 'bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{pharmacy.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-1 text-green-600" />
                            {pharmacy.distance} km
                          </span>
                          <span className="flex items-center text-gray-600">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {pharmacy.rating}
                          </span>
                          <span className={`flex items-center ${pharmacy.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            {pharmacy.isOpen ? 'Abierto' : 'Cerrado'}
                          </span>
                        </div>

                        {pharmacy.hasDelivery && (
                          <div className="mt-2">
                            <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <Car className="w-3 h-3 mr-1" />
                              Entrega a domicilio
                            </span>
                          </div>
                        )}

                        {pharmacy.discounts.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pharmacy.discounts.map((discount, idx) => (
                              <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                {discount}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selected Pharmacy Details */}
              {selectedPharmacy && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Pharmacy Header */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800">{selectedPharmacy.name}</h3>
                      <p className="text-gray-600">{selectedPharmacy.address}</p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <button className="flex items-center text-blue-600 hover:text-blue-700">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedPharmacy.phone}
                        </button>
                        <button className="flex items-center text-blue-600 hover:text-blue-700">
                          <Navigation className="w-4 h-4 mr-1" />
                          Cómo llegar
                        </button>
                      </div>
                    </div>

                    {/* Insurance */}
                    {selectedPharmacy.acceptsInsurance && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          <Building className="w-4 h-4 inline mr-1" />
                          Acepta seguros médicos
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPharmacy.insuranceProviders.map((provider, idx) => (
                            <span key={idx} className="text-xs bg-white text-blue-700 px-2 py-1 rounded">
                              {provider}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Medicamentos Disponibles</h4>
                      <div className="space-y-3">
                        {selectedPharmacy.medications.map((med) => (
                          <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800">{med.name}</h5>
                                <p className="text-sm text-gray-600">{med.genericName}</p>
                                
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className={`text-sm ${med.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                    {med.inStock ? `${med.quantity} disponibles` : 'Agotado'}
                                  </span>
                                  {med.requiresPrescription && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                      Requiere receta
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                {med.discount && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ${med.originalPrice}
                                  </div>
                                )}
                                <div className="text-xl font-bold text-green-600">
                                  ${med.price}
                                </div>
                                {med.discount && (
                                  <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded mt-1">
                                    -{med.discount}%
                                  </div>
                                )}
                                
                                {med.inStock && (
                                  <button
                                    onClick={() => addToCart(med)}
                                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                  >
                                    Agregar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cart Summary */}
                    {cart.length > 0 && (
                      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {cart.length} medicamento{cart.length > 1 ? 's' : ''} en tu pedido
                            </p>
                            <p className="text-xl font-bold text-gray-800">
                              Total: ${getTotalPrice()}
                            </p>
                          </div>
                          
                          <button
                            onClick={handleReserve}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Reservar Medicamentos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Delivery Options Modal */}
            <AnimatePresence>
              {showDeliveryOptions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-xl p-6 max-w-md w-full"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">¿Cómo deseas recibir tu pedido?</h3>
                    
                    <div className="space-y-3">
                      <label className="block">
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup"
                          checked={selectedDelivery === 'pickup'}
                          onChange={() => setSelectedDelivery('pickup')}
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 rounded-lg cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-50">
                          <div className="flex items-center">
                            <Building className="w-5 h-5 text-green-600 mr-3" />
                            <div>
                              <p className="font-medium">Recoger en farmacia</p>
                              <p className="text-sm text-gray-600">Listo en 15 minutos</p>
                            </div>
                          </div>
                        </div>
                      </label>
                      
                      <label className="block">
                        <input
                          type="radio"
                          name="delivery"
                          value="delivery"
                          checked={selectedDelivery === 'delivery'}
                          onChange={() => setSelectedDelivery('delivery')}
                          className="sr-only peer"
                        />
                        <div className="p-4 border-2 rounded-lg cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-50">
                          <div className="flex items-center">
                            <Car className="w-5 h-5 text-green-600 mr-3" />
                            <div>
                              <p className="font-medium">Entrega a domicilio</p>
                              <p className="text-sm text-gray-600">30-45 minutos</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => setShowDeliveryOptions(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={completeOrder}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Confirmar Pedido
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PharmacyReferralModal;