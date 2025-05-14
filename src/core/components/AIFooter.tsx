
import { Link } from 'react-router-dom';

function AIFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} DoctorMX. Todos los derechos reservados.
            </p>
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
