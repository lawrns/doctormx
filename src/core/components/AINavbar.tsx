import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Image, BarChart, Home } from 'lucide-react';

function AINavbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/doctor', label: 'Doctor IA', icon: Brain },
    { path: '/image-analysis', label: 'Análisis de Imágenes', icon: Image },
  ];
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-blue-600 font-bold text-xl">
                Doctor<span className="text-blue-900">AI</span>
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-600 text-blue-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} className="mr-1" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AINavbar;
