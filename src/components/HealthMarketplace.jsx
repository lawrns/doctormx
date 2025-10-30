import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import Layout from './Layout';

export default function HealthMarketplace() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showCart, setShowCart] = useState(false);

  const tabs = [
    { id: 'products', label: 'Productos', icon: '🛍️' },
    { id: 'categories', label: 'Categorías', icon: '📂' },
    { id: 'deals', label: 'Ofertas', icon: '🔥' },
    { id: 'reviews', label: 'Reseñas', icon: '⭐' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Más populares' },
    { value: 'rating', label: 'Mejor calificados' },
    { value: 'price', label: 'Precio: menor a mayor' },
    { value: 'newest', label: 'Más recientes' }
  ];

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock categories
      setCategories([
        {
          id: 'supplements',
          name: 'Suplementos',
          description: 'Vitaminas, minerales y suplementos nutricionales',
          icon: '💊',
          subcategories: [
            { id: 'vitamins', name: 'Vitaminas', description: 'Vitaminas esenciales' },
            { id: 'minerals', name: 'Minerales', description: 'Minerales y oligoelementos' },
            { id: 'protein', name: 'Proteínas', description: 'Suplementos de proteína' }
          ],
          productCount: 150,
          isActive: true
        },
        {
          id: 'medical_devices',
          name: 'Dispositivos Médicos',
          description: 'Equipos y dispositivos para monitoreo de salud',
          icon: '🩺',
          subcategories: [
            { id: 'blood_pressure', name: 'Tensiómetros', description: 'Medidores de presión arterial' },
            { id: 'glucose_meters', name: 'Glucómetros', description: 'Medidores de glucosa' },
            { id: 'thermometers', name: 'Termómetros', description: 'Medidores de temperatura' }
          ],
          productCount: 85,
          isActive: true
        },
        {
          id: 'health_monitoring',
          name: 'Monitoreo de Salud',
          description: 'Dispositivos wearables y apps de salud',
          icon: '⌚',
          subcategories: [
            { id: 'fitness_trackers', name: 'Rastreadores', description: 'Rastreadores de actividad' },
            { id: 'smartwatches', name: 'Smartwatches', description: 'Relojes inteligentes' }
          ],
          productCount: 120,
          isActive: true
        },
        {
          id: 'fitness_equipment',
          name: 'Equipos de Fitness',
          description: 'Equipos para ejercicio y entrenamiento',
          icon: '🏋️‍♂️',
          subcategories: [
            { id: 'home_gym', name: 'Gimnasio en Casa', description: 'Equipos para casa' },
            { id: 'cardio', name: 'Cardio', description: 'Equipos cardiovasculares' }
          ],
          productCount: 95,
          isActive: true
        }
      ]);

      // Mock products
      setProducts([
        {
          id: 'prod1',
          name: 'Multivitamínico Completo',
          description: 'Suplemento con 25 vitaminas y minerales esenciales para el bienestar general',
          category: 'supplements',
          subcategory: 'vitamins',
          price: 299,
          currency: 'MXN',
          originalPrice: 399,
          discount: 25,
          images: ['/images/vitaminas.jpg'],
          brand: 'HealthPlus',
          rating: 4.5,
          reviewCount: 128,
          stock: 50,
          isAvailable: true,
          isFeatured: true,
          tags: ['vitaminas', 'minerales', 'multivitamínico'],
          specifications: {
            'Formato': 'Cápsulas',
            'Cantidad': '60 cápsulas',
            'Dosis': '1 cápsula al día'
          },
          benefits: [
            'Apoya el sistema inmunológico',
            'Mejora la energía y vitalidad',
            'Contribuye al bienestar general'
          ],
          seller: {
            id: 'seller1',
            name: 'Farmacia Salud',
            verified: true,
            rating: 4.8
          },
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'prod2',
          name: 'Tensiómetro Digital',
          description: 'Medidor de presión arterial digital con pantalla LCD y memoria para 99 mediciones',
          category: 'medical_devices',
          subcategory: 'blood_pressure',
          price: 899,
          currency: 'MXN',
          images: ['/images/tensiometro.jpg'],
          brand: 'MedTech',
          rating: 4.7,
          reviewCount: 89,
          stock: 25,
          isAvailable: true,
          isFeatured: true,
          tags: ['tensiómetro', 'presión arterial', 'digital'],
          specifications: {
            'Tipo': 'Digital',
            'Pantalla': 'LCD',
            'Memoria': '99 mediciones',
            'Precisión': '±3 mmHg'
          },
          benefits: [
            'Monitoreo preciso de la presión arterial',
            'Fácil de usar en casa',
            'Memoria para seguimiento'
          ],
          seller: {
            id: 'seller2',
            name: 'Equipos Médicos MX',
            verified: true,
            rating: 4.9
          },
          createdAt: '2024-01-10T14:20:00Z'
        },
        {
          id: 'prod3',
          name: 'Smartwatch Salud',
          description: 'Reloj inteligente con monitoreo de frecuencia cardíaca, sueño y actividad física',
          category: 'health_monitoring',
          subcategory: 'smartwatches',
          price: 2499,
          currency: 'MXN',
          originalPrice: 2999,
          discount: 17,
          images: ['/images/smartwatch.jpg'],
          brand: 'FitTech',
          rating: 4.6,
          reviewCount: 156,
          stock: 15,
          isAvailable: true,
          isFeatured: true,
          tags: ['smartwatch', 'salud', 'fitness', 'monitoreo'],
          specifications: {
            'Pantalla': 'AMOLED 1.4"',
            'Batería': '7 días',
            'Resistencia': 'IP68',
            'Sensores': 'Frecuencia cardíaca, GPS, Acelerómetro'
          },
          benefits: [
            'Monitoreo continuo de salud',
            'Seguimiento de actividad física',
            'Análisis del sueño',
            'Notificaciones inteligentes'
          ],
          seller: {
            id: 'seller3',
            name: 'TechHealth Store',
            verified: true,
            rating: 4.7
          },
          createdAt: '2024-01-08T09:15:00Z'
        }
      ]);

    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast.error('Error al cargar datos del marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
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
    
    toast.success('Producto agregado al carrito');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Producto eliminado del carrito');
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    
    </Layout>
  );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Marketplace de Salud
              </h2>
              <p className="text-gray-600">
                Encuentra productos de salud y bienestar de calidad
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative px-4 py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
            >
              🛒 Carrito
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-medical-500 text-medical-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image */}
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-6xl text-gray-400">{product.category === 'supplements' ? '💊' : product.category === 'medical_devices' ? '🩺' : '⌚'}</div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                        {product.discount && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-xs text-gray-600">({product.reviewCount})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-medical-600">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>

                      {/* Seller */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-600">por {product.seller.name}</span>
                        {product.seller.verified && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                      >
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-xl p-6 hover:border-medical-300 transition-colors">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      <div className="text-sm text-medical-600 font-medium mb-4">
                        {category.productCount} productos
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setActiveTab('products');
                        }}
                        className="w-full py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                      >
                        Ver Productos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ofertas Especiales</h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: ofertas exclusivas y descuentos especiales
                </p>
                <button
                  onClick={() => toast.info('Ofertas especiales próximamente disponibles')}
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Ver Ofertas
                </button>
              </div>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reseñas de Productos</h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: sistema de reseñas y calificaciones
                </p>
                <button
                  onClick={() => toast.info('Sistema de reseñas próximamente disponible')}
                  className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Ver Reseñas
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Carrito de Compras</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-gray-600">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💊</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price} MXN</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-medical-600">${getCartTotal()} MXN</span>
                  </div>
                  <button className="w-full py-3 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors">
                    Proceder al Pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
