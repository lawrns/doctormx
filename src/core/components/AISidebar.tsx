import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, Activity, Users, Calendar, Pill, MapPin, 
  FileText, Settings, User, Brain, Stethoscope, TrendingUp, 
  ShoppingCart, Clock, Star, Heart, Plus, Zap, X, ChevronDown, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(['Servicios Médicos']));

  const navigationItems = [
    {
      category: 'Principal',
      collapsible: false,
      items: [
        { path: '/', label: 'Inicio', icon: Home },
        { path: '/doctor', label: 'Consulta Virtual', icon: MessageSquare },
        { path: '/image-analysis', label: 'Análisis de Imágenes', icon: Brain },
        { path: '/lab-testing', label: 'Exámenes a Domicilio', icon: FileText },
      ]
    },
    {
      category: 'Servicios Médicos',
      collapsible: true,
      items: [
        { path: '/medical/analysis', label: 'Análisis Médico', icon: Activity },
        { path: '/medical/doctors', label: 'Buscar Doctores', icon: Users },
        { path: '/medical/appointments', label: 'Mis Citas', icon: Calendar },
        { path: '/medical/prescriptions', label: 'Mis Recetas', icon: Pill },
        { path: '/medical/pharmacies', label: 'Farmacias Cercanas', icon: MapPin },
      ]
    },
    {
      category: 'Mi Cuenta',
      collapsible: true,
      items: [
        { path: '/profile', label: 'Mi Perfil', icon: User },
        { path: '/medical-history', label: 'Historial Médico', icon: TrendingUp },
        { path: '/settings', label: 'Configuración', icon: Settings },
      ]
    }
  ];

  const quickOrderMedications = [
    { name: 'Paracetamol 500mg', price: '$45', inStock: true },
    { name: 'Ibuprofeno 400mg', price: '$38', inStock: true },
    { name: 'Vitamina C', price: '$120', inStock: false },
    { name: 'Omeprazol 20mg', price: '$85', inStock: true }
  ];

  // Simulated geolocation-based preferences
  const userLocation = "Ciudad de México"; // This would come from actual geolocation
  const preferredDoctor = {
    name: 'Dr. María García',
    specialty: 'Medicina General',
    rating: 4.9,
    distance: '0.8 km'
  };
  
  const preferredPharmacy = {
    name: 'Farmacia del Ahorro',
    distance: '0.3 km',
    hasDelivery: true
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - positioned within content area, not full height */}
      <div className="w-full h-full bg-white border-r border-gray-200 overflow-y-auto">
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 lg:hidden">
          <h2 className="font-medium text-gray-900">Menú</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Pharmacy Banner */}
        <div className="p-2 bg-gradient-to-r from-brand-jade-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-gray-500" />
              <span className="text-gray-600">{userLocation}</span>
            </div>
            <div className="flex items-center gap-1">
              <Plus size={10} className="text-green-600" />
              <span className="text-gray-700 font-medium">{preferredPharmacy.name}</span>
              <span className="text-gray-500">• {preferredPharmacy.distance}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-2">
          {navigationItems.map((category) => {
            const isCollapsed = collapsedCategories.has(category.category);
            const shouldShowItems = !category.collapsible || !isCollapsed;
            
            return (
              <div key={category.category}>
                <div 
                  className={`flex items-center justify-between py-1 px-1 ${
                    category.collapsible ? 'cursor-pointer' : ''
                  }`}
                  onClick={category.collapsible ? () => toggleCategory(category.category) : undefined}
                >
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {category.category}
                  </h3>
                  {category.collapsible && (
                    <button className="p-0.5 hover:bg-gray-100 rounded">
                      {isCollapsed ? (
                        <ChevronRight size={12} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={12} className="text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
                
                {shouldShowItems && (
                  <ul className="space-y-0.5 mt-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.path);
                      
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={onClose}
                            className={`
                              flex items-center gap-2 px-2 py-1.5 rounded text-sm
                              transition-all duration-200 hover:bg-gray-50
                              ${isActive 
                                ? 'bg-brand-jade-50 text-brand-jade-700 border-r-2 border-brand-jade-500' 
                                : 'text-gray-700 hover:text-gray-900'
                              }
                            `}
                          >
                            <Icon size={14} className={isActive ? 'text-brand-jade-600' : 'text-gray-500'} />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Medication Order */}
        <div className="p-2 border-t border-gray-100">
          <div className="bg-blue-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium text-blue-800 flex items-center gap-1">
                <ShoppingCart size={12} />
                Pedido Rápido
              </h3>
              <button 
                onClick={() => setShowQuickOrder(!showQuickOrder)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Plus size={12} />
              </button>
            </div>
            {showQuickOrder && (
              <div className="space-y-1">
                {quickOrderMedications.slice(0, 2).map((med, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 truncate flex-1 mr-2">{med.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-brand-jade-600 font-medium">{med.price}</span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Plus size={8} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Premium Banner */}
        <div className="p-2 border-t border-gray-100">
          <div className="bg-gradient-to-br from-brand-jade-50 to-brand-jade-100 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="text-brand-jade-600" size={12} />
              <h3 className="text-xs font-medium text-brand-jade-800">Plan Premium</h3>
            </div>
            <p className="text-xs text-brand-jade-600 mb-2">
              Diagnósticos avanzados
            </p>
            <button className="w-full bg-brand-jade-600 hover:bg-brand-jade-700 text-white text-xs py-1.5 px-2 rounded transition-colors">
              Actualizar
            </button>
          </div>
        </div>

        {/* Preferred Doctor at Bottom */}
        <div className="p-2 border-t border-gray-100 mt-auto">
          <div className="bg-white rounded border border-gray-200 p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <Stethoscope size={10} className="text-brand-jade-600" />
                  <span className="text-xs font-medium text-gray-800">Doctor Preferido</span>
                </div>
                <p className="text-xs text-gray-600">{preferredDoctor.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{preferredDoctor.distance}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={8} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{preferredDoctor.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISidebar; 