import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, FileText, Menu, X, MessageSquare, Activity, Users, Pill, ShoppingBag } from 'lucide-react';

type Tab = 'chat' | 'analysis' | 'providers' | 'prescriptions' | 'appointments' | 'pharmacies';

interface AIDoctorTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
  isTabMenuOpen: boolean;
  setIsTabMenuOpen: (open: boolean) => void;
}

function AIDoctorTabs({
  activeTab,
  setActiveTab,
  onClose,
  isEmbedded = false,
  isTabMenuOpen,
  setIsTabMenuOpen
}: AIDoctorTabsProps) {
  const tabs = [
    { id: 'chat' as Tab, name: 'Chat', icon: MessageSquare, color: 'text-[#006D77]' },
    { id: 'analysis' as Tab, name: 'Análisis', icon: Activity, color: 'text-blue-600' },
    { id: 'providers' as Tab, name: 'Médicos', icon: Users, color: 'text-green-600' },
    { id: 'prescriptions' as Tab, name: 'Recetas', icon: FileText, color: 'text-purple-600' },
    { id: 'appointments' as Tab, name: 'Citas', icon: Calendar, color: 'text-orange-600' },
    { id: 'pharmacies' as Tab, name: 'Farmacias', icon: ShoppingBag, color: 'text-pink-600' }
  ];

  return (
    <>
      {/* Header with tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Dr. Simeon</h1>
            <span className="px-2 py-1 bg-[#D0F0EF] text-[#006D77] text-xs font-medium rounded-full">
              🇲🇽 México
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Desktop tabs */}
            <div className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-[#D0F0EF] text-[#006D77] shadow-sm'
                        : 'text-gray-600 hover:text-[#006D77] hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} className={activeTab === tab.id ? tab.color : ''} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsTabMenuOpen(!isTabMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#006D77] hover:bg-gray-100"
            >
              {isTabMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {!isEmbedded && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile tabs dropdown */}
        {isTabMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsTabMenuOpen(false);
                    }}
                    className={`w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-[#D0F0EF] text-[#006D77]'
                        : 'text-gray-600 hover:text-[#006D77] hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} className={activeTab === tab.id ? tab.color : ''} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tab content placeholders for non-chat tabs */}
      {activeTab !== 'chat' && (
        <div className="flex-1 p-8 text-center">
          <div className="max-w-md mx-auto">
            {activeTab === 'analysis' && (
              <div>
                <Activity className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Análisis Médico</h3>
                <p className="text-gray-600 mb-6">
                  Aquí encontrarás el análisis detallado de tus síntomas y recomendaciones médicas.
                </p>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-6 py-3 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] transition-colors"
                >
                  Volver al Chat
                </button>
              </div>
            )}
            
            {activeTab === 'providers' && (
              <div>
                <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Médicos Cercanos</h3>
                <p className="text-gray-600 mb-6">
                  Encuentra médicos especializados cerca de tu ubicación en México.
                </p>
                <Link
                  to="/providers"
                  className="inline-block px-6 py-3 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] transition-colors"
                >
                  Buscar Médicos
                </Link>
              </div>
            )}
            
            {activeTab === 'prescriptions' && (
              <div>
                <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Recetas Digitales</h3>
                <p className="text-gray-600 mb-6">
                  Accede a tus recetas digitales y recomendaciones de medicamentos.
                </p>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-6 py-3 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] transition-colors"
                >
                  Obtener Receta
                </button>
              </div>
            )}
            
            {activeTab === 'appointments' && (
              <div>
                <Calendar className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Agendar Cita</h3>
                <p className="text-gray-600 mb-6">
                  Programa una cita con médicos especializados en tu área.
                </p>
                <Link
                  to="/appointments"
                  className="inline-block px-6 py-3 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] transition-colors"
                >
                  Agendar Cita
                </Link>
              </div>
            )}
            
            {activeTab === 'pharmacies' && (
              <div>
                <ShoppingBag className="w-16 h-16 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Farmacias Cercanas</h3>
                <p className="text-gray-600 mb-6">
                  Encuentra farmacias con los medicamentos que necesitas cerca de ti.
                </p>
                <Link
                  to="/pharmacies"
                  className="inline-block px-6 py-3 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] transition-colors"
                >
                  Buscar Farmacias
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default memo(AIDoctorTabs);