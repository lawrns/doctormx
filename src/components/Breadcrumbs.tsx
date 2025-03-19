import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from './icons/IconProvider';

// Define route mappings for breadcrumb display
const routeMapping: Record<string, string> = {
  // Main sections
  'buscar': 'Buscar Médicos',
  'doctor': 'Perfil del Doctor',
  'sintomas': 'Evaluación de Síntomas',
  'telemedicina': 'Telemedicina',
  'alternativa': 'Medicina Alternativa',
  'comunidad': 'Comunidad',
  'preguntas': 'Preguntas y Respuestas',
  'doctor-board': 'Junta Médica',
  'blog': 'Blog de Salud',
  'acerca': 'Acerca de Nosotros',
  'medicos': 'Para Médicos',
  'planes': 'Planes',
  'contacto': 'Contacto',
  'ayuda': 'Ayuda',
  'login': 'Iniciar Sesión',
  'registro': 'Registrarse',
  'dashboard': 'Mi Cuenta',
  
  // Add other routes as needed
};

interface BreadcrumbsProps {
  customPaths?: {
    [key: string]: string;
  };
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customPaths = {}, className = '' }) => {
  const location = useLocation();
  
  // Skip rendering on home page
  if (location.pathname === '/') {
    return null;
  }
  
  // Split the path into segments and remove empty segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Handle case with no segments
  if (pathSegments.length === 0) {
    return null;
  }
  
  // Combine route mapping with custom paths
  const combinedMapping = { ...routeMapping, ...customPaths };
  
  // Build breadcrumb items
  const breadcrumbItems = [
    // Always include home
    { 
      path: '/', 
      label: 'Inicio' 
    },
    
    // Add path segments
    ...pathSegments.map((segment, index) => {
      // Build the accumulated path up to this segment
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // Get the label from mapping or use the segment itself (capitalized)
      let label = combinedMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      return { path, label };
    })
  ];

  return (
    <nav className={`text-sm py-3 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight size={14} className="mx-1 text-gray-400" aria-hidden="true" />
              )}
              
              {isLast ? (
                <span className="text-gray-600 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;