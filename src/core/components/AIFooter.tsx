import React from 'react';
import { Link } from 'react-router-dom';

function AIFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} DoctorAI. Todos los derechos reservados.
            </p>
            
            {/* Official Seal */}
            <div className="mt-4 text-center border-2 border-blue-600 rounded-lg p-4 bg-blue-50 max-w-sm">
              <h4 className="text-blue-600 font-bold text-sm mb-1">Sello Oficial</h4>
              <p className="text-gray-600 text-xs mb-1">Orgullosamente respaldado por nuestro patrocinador oficial de seguros:</p>
              <p className="text-gray-800 font-semibold text-sm mb-1">Daniel Faudeo &amp; Co</p>
              <p className="text-gray-500 italic text-xs">Centro de Chihuahua</p>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
              Privacidad
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-blue-600">
              Términos
            </Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-blue-600">
              Acerca de
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AIFooter;
