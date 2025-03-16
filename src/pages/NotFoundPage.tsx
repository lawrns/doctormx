import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="mt-2 text-lg text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Volver al inicio
          </Link>
          <Link
            to="/buscar"
            className="btn-outline flex items-center justify-center"
          >
            <Search size={18} className="mr-2" />
            Buscar médicos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;