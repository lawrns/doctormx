import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, Users, FileText, Settings, Bell, Search,
  LogOut, ChevronDown, BarChart2, Shield, MessageCircle, Calendar
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { admin, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Doctores', icon: Users, path: '/admin/doctors' },
    { name: 'Pacientes', icon: Users, path: '/admin/patients' },
    { name: 'Citas', icon: Calendar, path: '/admin/appointments' },
    { name: 'Contenido', icon: FileText, path: '/admin/content' },
    { name: 'Estadísticas', icon: BarChart2, path: '/admin/analytics' },
    { name: 'Soporte', icon: MessageCircle, path: '/admin/support' },
    { name: 'Seguridad', icon: Shield, path: '/admin/security' },
    { name: 'Configuración', icon: Settings, path: '/admin/settings' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <Shield size={24} className="text-blue-600" />
              <span className="font-semibold text-gray-900">Admin</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:pl-64 flex flex-col min-h-screen ${isSidebarOpen ? '' : 'pl-0'}`}>
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-0 z-20 lg:left-64">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu size={24} />
              </button>
              
              <div className="hidden sm:flex items-center">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-700">
                      {admin?.firstName?.[0] || admin?.email?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{admin?.firstName || 'Admin'}</span>
                  <ChevronDown size={16} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Mi perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;