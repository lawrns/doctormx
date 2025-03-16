import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Calendar, Star } from 'lucide-react';

function ProviderCTA() {
  return (
    <section className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">¿Eres médico o profesional de la salud?</h2>
          <p className="text-xl max-w-3xl mx-auto">
            Únete a la red de especialistas de Doctor.mx y conecta con nuevos pacientes.
            Gestiona tu agenda, ofrece telemedicina y haz crecer tu consulta.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <Link 
            to="/medicos/registro"
            className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            Registrarme como médico
          </Link>
          <Link 
            to="/medicos/planes"
            className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            Conocer planes y precios
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProviderCTA;