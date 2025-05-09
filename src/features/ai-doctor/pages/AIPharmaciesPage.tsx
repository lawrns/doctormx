import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIService from '../../../services/ai/AIService';
import { MapPin, Phone, ChevronLeft, ShoppingCart, Plus } from 'lucide-react';

function AIPharmaciesPage() {
  const [pharmacies, setPharmacies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { medications } = useParams<{ medications: string }>();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list');
  const [selectedPharmacy, setSelectedPharmacy] = React.useState<any>(null);
  const [cart, setCart] = React.useState<any[]>([]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    hover: { 
      scale: 1.02,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.2 }
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  
  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };
  
  const cartTotal = React.useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);
  
  const viewPharmacyDetails = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    setViewMode('detail');
  };
  
  React.useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        
        let userLocation = null;
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        }
        
        const medicationList = medications 
          ? medications.split(',') 
          : ['paracetamol', 'ibuprofeno'];
        
        const pharmacyList = await AIService.getPharmacyRecommendations(
          medicationList, 
          userLocation as { latitude: number; longitude: number } | undefined
        );
        
        setPharmacies(pharmacyList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        setError('No se pudieron cargar las farmacias. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };
    
    fetchPharmacies();
  }, [medications]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && viewMode === 'detail') {
      setViewMode('list');
    } else if (direction === 'left' && viewMode === 'list' && pharmacies.length > 0) {
      viewPharmacyDetails(pharmacies[0]);
    }
  };
  
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleSwipe('left');
      } else {
        handleSwipe('right');
      }
    }
    
    setTouchStart(null);
  };

  return (
    <div 
      className="max-w-4xl mx-auto px-4 py-6 md:py-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="sticky top-0 z-10 bg-white pb-2 mb-4">
        <button 
          onClick={() => viewMode === 'detail' ? setViewMode('list') : navigate(-1)} 
          className="flex items-center text-blue-600 mb-3 py-2"
          aria-label={viewMode === 'detail' ? 'Volver a la lista' : 'Volver'}
        >
          <ChevronLeft size={20} />
          <span>{viewMode === 'detail' ? 'Volver a la lista' : 'Volver'}</span>
        </button>
        
        <h1 className="text-xl md:text-2xl font-bold">
          {viewMode === 'detail' ? selectedPharmacy?.name : 'Farmacias Cercanas'}
        </h1>
      </div>
      
      {/* Cart summary if items exist */}
      {cart.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 z-10 bg-white shadow-md rounded-lg p-4 mb-6 border border-blue-100"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart size={20} className="text-blue-600 mr-2" />
              <span className="font-medium">
                {cart.reduce((total, item) => total + item.quantity, 0)} productos
              </span>
            </div>
            <div>
              <span className="font-bold text-lg">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                  <span className="text-xs mr-1">{item.name}</span>
                  <div className="flex items-center">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      aria-label="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <span className="text-xs mx-1">{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCart([])} 
                className="text-sm text-red-600 hover:text-red-800"
              >
                Vaciar
              </button>
              <button 
                className="ml-auto bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700"
              >
                Finalizar compra
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div 
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {pharmacies.length > 0 ? (
              pharmacies.map((pharmacy, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer"
                  onClick={() => viewPharmacyDetails(pharmacy)}
                >
                  <div className="flex items-start">
                    <div 
                      className="w-16 h-16 rounded-full mr-4 flex-shrink-0 flex items-center justify-center"
                      style={{ 
                        backgroundColor: pharmacy.primaryColor ? `${pharmacy.primaryColor}15` : '#e6f7ef',
                        color: pharmacy.primaryColor || '#10b981'
                      }}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{pharmacy.name || `Farmacia ${index + 1}`}</h2>
                        {pharmacy.isSponsored && (
                          <span 
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: pharmacy.secondaryColor ? `${pharmacy.secondaryColor}15` : '#fef3c7',
                              color: pharmacy.secondaryColor ? pharmacy.secondaryColor : '#d97706'
                            }}
                          >
                            Patrocinado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{pharmacy.address || 'Dirección no disponible'}</p>
                      <p className="text-gray-600 mb-3">
                        {pharmacy.distance ? `${(pharmacy.distance / 1000).toFixed(1)} km de distancia` : 'Distancia no disponible'}
                      </p>
                      
                      {pharmacy.available_medications && pharmacy.available_medications.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Medicamentos disponibles:</h3>
                          <div className="flex flex-wrap gap-2">
                            {pharmacy.available_medications.slice(0, 3).map((med: string, idx: number) => (
                              <motion.span 
                                key={idx} 
                                whileHover={{ scale: 1.05 }}
                                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                              >
                                {med}
                              </motion.span>
                            ))}
                            {pharmacy.available_medications.length > 3 && (
                              <span className="text-xs text-blue-600">
                                +{pharmacy.available_medications.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a 
                          href={`https://maps.google.com/?q=${pharmacy.address}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 rounded-md transition-colors"
                          style={{ 
                            backgroundColor: pharmacy.primaryColor || '#10b981',
                            color: '#ffffff'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin size={16} className="mr-2" />
                          Cómo llegar
                        </a>
                        
                        {pharmacy.phone && (
                          <a 
                            href={`tel:${pharmacy.phone}`}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={16} className="mr-2" />
                            Llamar
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gray-50 rounded-lg"
              >
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay farmacias disponibles</h3>
                <p className="text-gray-600">
                  No se encontraron farmacias cercanas con los medicamentos solicitados.
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {selectedPharmacy && (
              <>
                <div 
                  className="h-32 w-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: selectedPharmacy.primaryColor || '#10b981',
                    color: '#ffffff'
                  }}
                >
                  <h2 className="text-2xl font-bold">{selectedPharmacy.name}</h2>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin size={18} className="text-gray-500 mr-2" />
                    <p className="text-gray-700">{selectedPharmacy.address}</p>
                  </div>
                  
                  {selectedPharmacy.phone && (
                    <div className="flex items-center mb-4">
                      <Phone size={18} className="text-gray-500 mr-2" />
                      <p className="text-gray-700">{selectedPharmacy.phone}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center mb-6">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-700">Abierto ahora</p>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">Medicamentos disponibles</h3>
                  
                  <div className="space-y-4 mb-6">
                    {selectedPharmacy.products && selectedPharmacy.products.map((product: any, idx: number) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: idx * 0.1 }
                        }}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.brand} • {product.dosage}</p>
                          <p className="text-sm text-gray-600">{product.quantity} unidades</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
                          <button 
                            onClick={() => addToCart(product)}
                            className="mt-2 flex items-center px-3 py-1 rounded text-sm"
                            style={{ 
                              backgroundColor: selectedPharmacy.primaryColor || '#10b981',
                              color: '#ffffff'
                            }}
                          >
                            <Plus size={14} className="mr-1" />
                            Agregar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <a 
                      href={`https://maps.google.com/?q=${selectedPharmacy.address}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex justify-center items-center px-4 py-3 rounded-md"
                      style={{ 
                        backgroundColor: selectedPharmacy.primaryColor || '#10b981',
                        color: '#ffffff'
                      }}
                    >
                      <MapPin size={18} className="mr-2" />
                      Cómo llegar
                    </a>
                    
                    {selectedPharmacy.phone && (
                      <a 
                        href={`tel:${selectedPharmacy.phone}`}
                        className="flex-1 flex justify-center items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-md"
                      >
                        <Phone size={18} className="mr-2" />
                        Llamar
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIPharmaciesPage;
