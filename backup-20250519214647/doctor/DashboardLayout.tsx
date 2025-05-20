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
import SafeButton from '../ui/SafeButton';
import DoctorConnectPromo from './DoctorConnectPromo';

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
  // Add error handling for auth context
  let user: any = null;
  let logout: () => Promise<void> = async () => { console.log('Logout not available'); };
  let doctorId = "";
  let doctorName = "";
  
  try {
    const auth = useAuth();
    user = auth.user;
    logout = auth.logout;
    doctorId = auth.doctorId || "";
    doctorName = auth.doctorName || "";
  } catch (error) {
    console.error("Auth context error in DashboardLayout:", error);
    // In production, we would redirect to login page here
  }
  
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
  
  // Skip SessionGuard which would cause issues if auth context isn't available
  return (
      <div className="h-screen flex overflow-hidden bg-blue-50">
        {/* Mobile sidebar */}
        <div 
          className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-blue-600 bg-opacity-75" aria-hidden="true"></div>
          
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-blue-50">
            <div className="h-full w-full flex flex-col overflow-y-auto bg-blue-50">
              <div className="flex items-center justify-between h-16 px-4 border-b border-blue-200 bg-blue-100">
                <Link to="/" className="flex items-center">
                  <img 
                    src="/images/Doctorlogo.png" 
                    alt="Doctor MX" 
                    className="h-8 w-auto"
                  />
                  <div className="flex items-center ml-2">
                    <span className="text-lg font-semibold text-blue-900">Doctor MX</span>
                    <span className="ml-1 text-lg" title="Mexico">🇲🇽</span>
                  </div>
                </Link>
                <button
                  className="rounded-md text-blue-500 hover:text-blue-700 focus:outline-none"
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
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-blue-700 hover:bg-blue-50'}
                      `}
                    >
                      <item.icon 
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${
                          location.pathname === item.href 
                            ? 'text-blue-600' 
                            : 'text-blue-500'
                        }`} 
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="px-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Configuración y ayuda
                  </h3>
                  <div className="mt-1 space-y-1">
                    {secondaryNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-blue-700 hover:bg-blue-50"
                      >
                        <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-blue-200 p-4">
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
          <div className="flex-1 flex flex-col min-h-0 border-r border-blue-200 bg-blue-50">
            <div className="flex items-center h-16 px-4 border-b border-blue-200 bg-blue-100">
              <Link to="/" className="flex items-center">
                <img 
                  src="/images/Doctorlogo.png" 
                  alt="Doctor MX" 
                  className="h-8 w-auto"
                />
                <div className="flex items-center ml-2">
                  <span className="text-lg font-semibold text-blue-900">Doctor MX</span>
                  <span className="ml-1 text-lg" title="Mexico">🇲🇽</span>
                </div>
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-3 pt-4 pb-2">
                <div className="mb-4">
                  <DoctorConnectPromo />
                </div>
                
                <div className="flex flex-col">
                  <div className="flex-shrink-0 flex items-center px-2">
                    <div className="flex-shrink-0">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${doctorName || user?.email || 'Doctor'}&background=0D8ABC&color=fff`}
                        alt="Perfil"
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">
                        {doctorName || `Dr. ${user?.email?.split('@')[0] || 'Usuario'}`}
                      </p>
                      <Link 
                        to={`/doctor/${doctorId}/settings`}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Ver perfil
                      </Link>
                    </div>
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
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-blue-700 hover:bg-blue-50'}
                    `}
                  >
                    <item.icon 
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        location.pathname === item.href 
                          ? 'text-blue-600' 
                          : 'text-blue-500'
                      }`} 
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-4 px-2">
                <h3 className="px-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Configuración y ayuda
                </h3>
                <div className="mt-1 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-700 hover:bg-blue-50"
                    >
                      <item.icon className="mr-3 flex-shrink-0 h-5 w-5 text-blue-500" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-blue-200 p-4 mt-auto">
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
        </div>
        
        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-blue-50 border-b border-blue-200 lg:hidden">
            <button
              className="px-4 text-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex justify-between px-4">
              <div className="flex-1 flex">
                <div className="w-full flex items-center md:ml-0">
                  <div className="max-w-2xl w-full mx-auto">
                    <div className="relative text-blue-600 focus-within:text-blue-700">
                      <h1 className="text-xl font-semibold text-blue-800">{title}</h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${doctorName || user?.email || 'Doctor'}&background=0D8ABC&color=fff`} 
                      alt="" 
                      className="h-8 w-8 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-blue-50">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-blue-800 hidden lg:block">{title}</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="py-4">
                  {loading ? (
                    <div className="w-full flex justify-center items-center min-h-[400px]">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-blue-800 font-medium">Cargando...</p>
                      </div>
                    </div>
                  ) : (
                    children
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default DashboardLayout;
