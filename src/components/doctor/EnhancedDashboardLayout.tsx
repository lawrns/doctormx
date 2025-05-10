import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  BarChart2,
  Video,
  User,
  ChevronDown,
  ChevronRight,
  Search
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  loading?: boolean;
}

const EnhancedDashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  loading = false
}) => {
  const { logout, doctorName, doctorProfileImage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Close sidebar on larger screens
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navigation = [
    { name: 'Inicio', href: '/doctor-dashboard', icon: Home },
    { name: 'Citas', href: '/doctor-dashboard/appointments', icon: Calendar },
    { name: 'Pacientes', href: '/doctor-dashboard/patients', icon: Users },
    { name: 'Recetas', href: '/doctor-dashboard/prescriptions/new', icon: FileText },
    { name: 'Telemedicina', href: '/doctor-dashboard/telemedicine/waiting-room', icon: Video },
    { name: 'Comunidad', href: '/doctor-dashboard/community', icon: MessageSquare },
    { name: 'Análisis', href: '/doctor-dashboard/analytics', icon: BarChart2 },
  ];
  
  const settingsNavigation = [
    { name: 'Perfil', href: '/doctor-dashboard/settings/profile' },
    { name: 'Marca', href: '/doctor-dashboard/settings/branding' },
    { name: 'Integraciones', href: '/doctor-dashboard/settings/doctoralia' },
  ];
  
  const notifications = [
    {
      id: 1,
      title: 'Nueva cita programada',
      description: 'María López ha agendado una cita para el 28 de marzo.',
      time: '10 min',
      unread: true
    },
    {
      id: 2,
      title: 'Resultados disponibles',
      description: 'Los resultados de laboratorio de Carlos García están listos.',
      time: '1 hora',
      unread: true
    },
    {
      id: 3,
      title: 'Recordatorio de seguimiento',
      description: 'Recordatorio: Llamar a Ana Martínez para seguimiento.',
      time: '3 horas',
      unread: false
    }
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-blue-600">Cargando información...</p>
    </div>
  );
  
  return (
    <div className="flex h-screen bg-blue-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-blue-100 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - fixed position on mobile, static on desktop */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-50 shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:shadow-none sidebar-mobile
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 border-b border-blue-200 bg-blue-100">
          <Link to="/doctor-dashboard" className="flex items-center">
            <img 
              src="/images/Doctorlogo.png" 
              alt="Doctor MX Logo" 
              className="h-10 w-auto"
            />
            <div className="flex items-center ml-2">
              <span className="text-2xl font-bold text-blue-900">Doctor MX</span>
              <span className="ml-1 text-lg" title="Mexico">🇲🇽</span>
            </div>
          </Link>
          <button
            className="inline-flex items-center justify-center p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-200 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Sidebar search */}
        <div className="p-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-blue-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full py-2 pl-10 pr-3 text-sm bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Sidebar navigation */}
        <div className="flex flex-col h-[calc(100%-8rem)] overflow-y-auto">
          <nav className="px-2 space-y-1 mt-4 flex-shrink-0">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-900'
                  }`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? 'text-blue-500' : 'text-blue-400 group-hover:text-blue-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="px-3 mt-6 flex-shrink-0">
            <div className="pt-2 border-t border-blue-200">
              <div className="px-2 space-y-1 mt-1">
                <button 
                  className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-blue-700 rounded-md hover:bg-blue-100 hover:text-blue-900 group"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="flex items-center">
                    <Settings className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-500" />
                    <span>Configuración</span>
                  </div>
                  {userMenuOpen ? (
                    <ChevronDown className="w-5 h-5 text-blue-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-blue-400" />
                  )}
                </button>
                
                {userMenuOpen && (
                  <div className="pl-10 space-y-1">
                    {settingsNavigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`block px-2 py-1 text-sm rounded-md ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-blue-500 hover:bg-blue-50 hover:text-blue-900'
                          }`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Logout button - moved from absolute to flex-shrink-0 to avoid overlapping */}
          <div className="mt-auto p-4 border-t border-blue-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 group"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-blue-100 shadow-sm z-10">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 lg:px-8">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-200 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1 flex items-center justify-end">
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="ml-auto p-1 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-200 focus:outline-none"
                  >
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </button>
                  
                  {notificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-blue-50 ring-1 ring-blue-300 ring-opacity-50 focus:outline-none">
                      <div className="py-3 px-4 border-b border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900">Notificaciones</h3>
                      </div>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-blue-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-blue-900">{notification.title}</p>
                              <p className="mt-1 text-xs text-blue-600">{notification.description}</p>
                            </div>
                            <span className="text-xs text-blue-400">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                      <div className="px-4 py-2 border-t border-blue-200">
                        <Link 
                          to="/doctor-dashboard/notifications" 
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Ver todas
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Profile dropdown */}
                <div className="relative">
                  <div>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-0"
                    >
                      <div className="ml-3 p-1 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-200 focus:outline-none">
                        {doctorProfileImage ? (
                          <img
                            src={doctorProfileImage}
                            alt={`${doctorName}`}
                            className="h-8 w-8 rounded-full border-2 border-blue-300"
                          />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      <span className="hidden md:inline-block text-sm font-medium text-blue-700">
                        {doctorName || 'Dr. Usuario'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area with independent scrolling */}
        <main className="flex-1 overflow-y-auto bg-blue-50">
          <div className="py-4 sm:py-6">
            <div className="px-3 sm:px-6 lg:px-8 dashboard-content">
              {loading ? (
                <LoadingState />
              ) : (
                <>
                  {title && (
                    <h1 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-4 sm:mb-6">{title}</h1>
                  )}
                  {children}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboardLayout;// Updated on Sat May 10 11:04:30 CST 2025
