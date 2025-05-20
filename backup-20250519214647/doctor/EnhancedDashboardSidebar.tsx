import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  BarChart2, 
  Video, 
  Globe, 
  Paintbrush, 
  User, 
  FileText, 
  Bell, 
  Stethoscope, 
  HelpCircle, 
  Menu, 
  X
} from 'lucide-react';
import { Button } from '../ui';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: number | string;
}

interface EnhancedDashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onLogout?: () => void;
}

const EnhancedDashboardSidebar: React.FC<EnhancedDashboardSidebarProps> = ({
  collapsed = false,
  onToggle,
  onLogout
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'settings': location.pathname.includes('/doctor-dashboard/settings'),
    'telemedicine': location.pathname.includes('/doctor-dashboard/telemedicine')
  });
  
  // Toggle expandable items
  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Navigation items
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/doctor-dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      title: 'Citas',
      path: '/doctor-dashboard/appointments',
      icon: <Calendar size={20} />,
      badge: 3
    },
    {
      title: 'Pacientes',
      path: '/doctor-dashboard/patients',
      icon: <Users size={20} />
    },
    {
      title: 'Telemedicina',
      path: '/doctor-dashboard/telemedicine',
      icon: <Video size={20} />,
      children: [
        {
          title: 'Nueva Consulta',
          path: '/doctor-dashboard/telemedicine/consultation',
          icon: <Video size={18} />
        },
        {
          title: 'Sala de Espera',
          path: '/doctor-dashboard/telemedicine/waiting-room',
          icon: <Users size={18} />,
          badge: 2
        },
        {
          title: 'Historial',
          path: '/doctor-dashboard/telemedicine/history',
          icon: <FileText size={18} />
        }
      ]
    },
    {
      title: 'Mi Comunidad',
      path: '/doctor-dashboard/community',
      icon: <MessageSquare size={20} />,
      badge: 5
    },
    {
      title: 'Análisis',
      path: '/doctor-dashboard/analytics',
      icon: <BarChart2 size={20} />
    },
    {
      title: 'Ajustes',
      path: '/doctor-dashboard/settings',
      icon: <Settings size={20} />,
      children: [
        {
          title: 'Perfil Profesional',
          path: '/doctor-dashboard/settings/profile',
          icon: <User size={18} />
        },
        {
          title: 'Personalización',
          path: '/doctor-dashboard/settings/branding',
          icon: <Paintbrush size={18} />
        },
        {
          title: 'Integración Doctoralia',
          path: '/doctor-dashboard/settings/doctoralia',
          icon: <Stethoscope size={18} />
        },
        {
          title: 'Notificaciones',
          path: '/doctor-dashboard/settings/notifications',
          icon: <Bell size={18} />
        }
      ]
    }
  ];
  
  // Render navigation link
  const renderNavLink = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.path);
    const isExpanded = expandedItems[item.title.toLowerCase()];
    
    return (
      <div key={item.path}>
        <Link
          to={hasChildren ? '#' : item.path}
          className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
            isItemActive ? 'bg-blue-50 text-blue-700' : 
            'text-gray-700 hover:bg-gray-100'
          } ${depth > 0 ? 'ml-6 text-sm' : ''}`}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleItem(item.title.toLowerCase());
            }
          }}
        >
          <div className="flex items-center">
            <span className="mr-3">{item.icon}</span>
            {!collapsed && (
              <span>{item.title}</span>
            )}
            {item.badge && !collapsed && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          
          {hasChildren && !collapsed && (
            <span className="ml-2">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </Link>
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavLink(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout logic
      navigate('/login');
    }
  };
  
  return (
    <div 
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-2">
              D
            </div>
            <span className="font-bold text-gray-900">Doctor.mx</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">
            D
          </div>
        )}
        
        {!collapsed && onToggle && (
          <button onClick={onToggle} className="text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
        )}
        
        {collapsed && onToggle && (
          <button onClick={onToggle} className="absolute -right-3 top-12 bg-white rounded-full p-1 border border-gray-200 text-gray-500 hover:text-gray-700">
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      
      {/* User Profile */}
      <div className={`p-4 border-b border-gray-200 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-start'}`}>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          {!collapsed && (
            <div className="ml-3">
              <div className="font-medium text-gray-900">
                Dr. {user?.email?.split('@')[0] || 'Usuario'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.email || 'doctor@doctor.mx'}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => renderNavLink(item))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <div className="space-y-2">
          {!collapsed && (
            <Link
              to="/doctor-dashboard/help"
              className="flex items-center rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <HelpCircle size={20} className="mr-3" />
              <span>Ayuda y Soporte</span>
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors w-full ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} className={collapsed ? '' : 'mr-3'} />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardSidebar;