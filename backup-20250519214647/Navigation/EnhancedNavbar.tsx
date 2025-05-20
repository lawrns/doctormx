import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Calendar, 
  User, 
  Users, 
  Heart, 
  Star, 
  Video, 
  BookOpen, 
  Info, 
  Menu, 
  X, 
  ChevronDown, 
  Building, 
  Shield, 
  MessageCircle,
  Brain,
  Globe,
  LogOut
} from 'lucide-react';

const EnhancedNavbar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('es');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Initialize language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);
  
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    setShowLangMenu(false);
    // In a real implementation, this would trigger i18n library
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setShowLangMenu(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    // Close menus when navigating
    setActiveMenu(null);
    setMobileMenuOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname]);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const menuItems = [
    {
      id: 'buscar',
      title: 'Buscar Médicos',
      icon: <Search size={20} />,
      link: '/buscar'
    },
    {
      id: 'especialidades',
      title: 'Especialidades',
      icon: <User size={20} />,
      dropdown: true,
      items: [
        { title: 'Medicina General', link: '/especialidades/medicina-general' },
        { title: 'Cardiología', link: '/especialidades/cardiologia' },
        { title: 'Pediatría', link: '/especialidades/pediatria' },
        { title: 'Ginecología', link: '/especialidades/ginecologia' },
        { title: 'Dermatología', link: '/especialidades/dermatologia' },
        { title: 'Ver Todas', link: '/especialidades', highlight: true }
      ]
    },
    {
      id: 'servicios',
      title: 'Servicios',
      icon: <Heart size={20} />,
      dropdown: true,
      items: [
        { 
          title: 'Agendar Cita', 
          link: '/reservar', 
          icon: <Calendar size={18} />,
          description: 'Agenda una cita con el médico de tu elección'
        },
        { 
          title: 'Telemedicina', 
          link: '/telemedicina', 
          icon: <Video size={18} />,
          description: 'Consultas médicas en línea desde cualquier lugar'
        },
        { 
          title: 'Segunda Opinión', 
          link: '/segunda-opinion', 
          icon: <Users size={18} />,
          description: 'Obtén una segunda opinión médica profesional'
        },
        { 
          title: 'Evaluación de Síntomas', 
          link: '/sintomas', 
          icon: <BookOpen size={18} />,
          description: 'Analiza tus síntomas y obtén orientación médica'
        }
      ]
    },
    {
      id: 'para-doctores',
      title: 'Para Doctores',
      icon: <Building size={20} />,
      dropdown: true,
      items: [
        { 
          title: 'Registro de Médicos', 
          link: '/medicos/registro', 
          icon: <User size={18} />,
          description: 'Únete a nuestra plataforma médica'
        },
        { 
          title: 'Planes y Precios', 
          link: '/medicos/planes', 
          icon: <Star size={18} />,
          description: 'Conoce nuestros planes para profesionales'
        },
        { 
          title: 'Panel del Doctor', 
          link: '/doctor-dashboard', 
          icon: <Shield size={18} />,
          description: 'Accede a tu panel de control'
        },
        { 
          title: 'Centro de Ayuda', 
          link: '/ayuda/medicos', 
          icon: <Info size={18} />,
          description: 'Recursos y soporte para médicos'
        }
      ]
    },
    {
      id: 'comunidad',
      title: 'Comunidad',
      icon: <MessageCircle size={20} />,
      link: '/comunidad'
    }
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" ref={menuRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-blue-600 font-bold text-xl flex items-center">
                <span className="text-3xl text-teal-500 mr-1">+</span>
                Doctor.mx
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:ml-10 lg:flex lg:items-center lg:space-x-4">
              {menuItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.dropdown ? (
                    <>
                      <button
                        className={`px-3 py-2 text-gray-700 rounded-md flex items-center hover:bg-blue-50 hover:text-blue-600 transition-colors ${activeMenu === item.id ? 'bg-blue-50 text-blue-600' : ''}`}
                        onClick={() => toggleMenu(item.id)}
                        aria-expanded={activeMenu === item.id}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.title}
                        <ChevronDown
                          size={16}
                          className={`ml-1 transform transition-transform ${activeMenu === item.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {activeMenu === item.id && (
                        <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 right-0">
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="font-medium text-gray-800">{item.title}</h3>
                          </div>
                          {item.items.map((subItem: any, idx) => (
                            <Link
                              key={idx}
                              to={subItem.link}
                              className={`block px-4 py-3 hover:bg-gray-50 ${subItem.highlight ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                            >
                              {subItem.icon && (
                                <div className="flex items-center">
                                  <span className="mr-3 text-blue-500">{subItem.icon}</span>
                                  <div>
                                    <div className="font-medium">{subItem.title}</div>
                                    {subItem.description && (
                                      <div className="text-sm text-gray-500">{subItem.description}</div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {!subItem.icon && subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.link}
                      className={`px-3 py-2 text-gray-700 rounded-md flex items-center hover:bg-blue-50 hover:text-blue-600 transition-colors ${location.pathname === item.link ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            {/* Doctor IA button */}
            <div className="hidden md:block mr-4">
              <Link
                to="/sintomas"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                <Brain size={18} className="mr-2" />
                Doctor IA
                <span className="ml-2 text-xs bg-white text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                  ¡NUEVO!
                </span>
              </Link>
            </div>
            
            {/* Action buttons */}
            {/* Language selector */}
            <div className="hidden md:block relative">
              <button 
                className="flex items-center text-gray-700 hover:text-gray-900 mx-3"
                onClick={() => setShowLangMenu(!showLangMenu)}
                aria-expanded={showLangMenu}
                aria-haspopup="true"
              >
                <Globe size={18} className="mr-1" />
                <span className="uppercase text-sm">{language}</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'es' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => changeLanguage('es')}
                  >
                    Español (México)
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => changeLanguage('en')}
                  >
                    English
                  </button>
                </div>
              )}
            </div>
            
            <div className="hidden md:flex items-center ml-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User size={18} className="mr-2" />
                    Mi cuenta
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Salir
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="mx-3 text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/medicos/registro"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Registrar mi consulta
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Abrir menú</span>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-4 space-y-1 bg-white border-t border-gray-200">
          {/* Doctor IA button for mobile */}
          <div className="px-4 py-2">
            <Link
              to="/sintomas"
              className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Brain size={18} className="mr-2" />
              Doctor IA
              <span className="ml-2 text-xs bg-white text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                ¡NUEVO!
              </span>
            </Link>
          </div>
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.dropdown ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full text-left flex items-center justify-between px-4 py-3 font-medium ${
                      activeMenu === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {item.title}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${activeMenu === item.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {activeMenu === item.id && (
                    <div className="bg-gray-50 py-2">
                      {item.items.map((subItem: any, idx) => (
                        <Link
                          key={idx}
                          to={subItem.link}
                          className="block pl-12 pr-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.link}
                  className={`flex items-center px-4 py-3 font-medium ${
                    location.pathname === item.link ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              )}
            </div>
          ))}
          {/* Language selector for mobile */}
          <div className="pt-4 pb-2 border-t border-gray-200">
            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">
              Idioma
            </div>
            <button
              onClick={() => changeLanguage('es')}
              className={`w-full text-left px-4 py-2 text-base font-medium ${language === 'es' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Español (México)
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`w-full text-left px-4 py-2 text-base font-medium ${language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              English
            </button>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1 px-4">
                <Link
                  to="/dashboard"
                  className="block w-full px-4 py-2 text-left flex items-center text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} className="mr-2" />
                  Mi cuenta
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left flex items-center text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut size={18} className="mr-2" />
                  Salir
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center px-4">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-2"
                  >
                    Iniciar sesión
                  </Link>
                </div>
                <div className="px-4">
                  <Link
                    to="/medicos/registro"
                    className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                  >
                    Registrar mi consulta
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EnhancedNavbar;
