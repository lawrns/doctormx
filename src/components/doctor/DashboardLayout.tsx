import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Video, 
  Settings, 
  Menu, 
  X, 
  MessageSquare,
  FileText,
  Activity,
  Globe,
  PenTool,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SessionGuard from '../auth/SessionGuard';
import SafeButton from '../ui/SafeButton';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  loading?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  loading = false
}) => {
  const { user, logout, doctorId, doctorName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigation = [
    { name: 'Panel de Control', href: '/doctor-dashboard', icon: Home },
    { name: 'Citas', href: '/doctor-dashboard/appointments', icon: Calendar },
    { name: 'Pacientes', href: '/doctor-dashboard/patients', icon: Users },
    { name: 'Consultas', href: '/doctor-dashboard/consultations', icon: Video },
    { name: 'Comunidad', href: '/comunidad', icon: MessageSquare },
    { name: 'Broadcast', href: '/doctor-dashboard/broadcast', icon: PenTool },
    { name: 'Reportes', href: '/doctor-dashboard/reports', icon: FileText },
    { name: 'Analíticas', href: '/doctor-dashboard/analytics', icon: Activity }
  ];
  
  const secondaryNavigation = [
    { name: 'Mi Sitio Web', href: `/doctor/${doctorId}`, icon: Globe },
    { name: 'Configuración', href: `/doctor/${doctorId}/settings`, icon: Settings }
  ];
  
  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <SessionGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div 
          className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true"></div>
          
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-white">
            <div className="h-full w-full flex flex-col overflow-y-auto bg-white">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <Link to="/" className="flex items-center">
                  <img 
                    src="/logo.svg" 
                    alt="Doctor.mx" 
                    className="h-8 w-auto"
                  />
                  <span className="ml-2 text-lg font-semibold text-blue-600">Doctor.mx</span>
                </Link>
                <button
                  className="rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 px-2 pt-2 pb-4">
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${location.pathname === item.href 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      <item.icon 
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${
                          location.pathname === item.href 
                            ? 'text-blue-500' 
                            : 'text-gray-500'
                        }`} 
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Configuración y ayuda
                  </h3>
                  <div className="mt-1 space-y-1">
                    {secondaryNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-500" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-4">
                <SafeButton
                  onSafeClick={handleSignOut}
                  className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-red-500" />
                  Cerrar sesión
                </SafeButton>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Link to="/" className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="Doctor.mx" 
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-lg font-semibold text-blue-600">Doctor.mx</span>
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-3 pt-4 pb-2 flex flex-col">
                <div className="flex-shrink-0 flex items-center px-2">
                  <div className="flex-shrink-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${doctorName || user?.email || 'Doctor'}&background=0D8ABC&color=fff`}
                      alt="Perfil"
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {doctorName || `Dr. ${user?.email?.split('@')[0] || 'Usuario'}`}
                    </p>
                    <Link 
                      to={`/doctor/${doctorId}/settings`}
                      className="text-xs text-gray-500 hover:text-blue-600"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              </div>
              
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${location.pathname === item.href 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <item.icon 
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        location.pathname === item.href 
                          ? 'text-blue-500' 
                          : 'text-gray-500'
                      }`} 
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-4 px-2">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Configuración y ayuda
                </h3>
                <div className="mt-1 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <item.icon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-500" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <SafeButton
                onSafeClick={handleSignOut}
                className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" />
                Cerrar sesión
              </SafeButton>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:pl-64 flex flex-col min-h-screen">
          <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 flex">
            <button
              type="button"
              className="px-4 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} className="text-gray-500" />
              <span className="sr-only">Abrir sidebar</span>
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>
          
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
};

export default DashboardLayout;