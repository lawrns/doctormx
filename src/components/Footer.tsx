import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/Doctorlogo.png" alt="Doctor.mx Logo" className="h-8 w-auto mr-2" />
              <h3 className="text-lg font-bold">Doctor.mx</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              La plataforma líder en México para encontrar médicos, agendar citas y recibir atención médica en línea.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/buscar" className="text-gray-300 hover:text-white">Buscar médicos</Link>
              </li>
              <li>
                <Link to="/sintomas/ai" className="text-gray-300 hover:text-white">Evaluación de Síntomas</Link>
              </li>
              <li>
                <Link to="/telemedicina" className="text-gray-300 hover:text-white">Telemedicina</Link>
              </li>
              <li>
                <Link to="/alternativa" className="text-gray-300 hover:text-white">Medicina Alternativa</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Comunidad</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/comunidad/preguntas" className="text-gray-300 hover:text-white">Preguntas Médicas</Link>
              </li>
              <li>
                <Link to="/doctor-board" className="text-gray-300 hover:text-white">Junta Médica</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white">Blog de Salud</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Para Médicos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/medicos/registro" className="text-gray-300 hover:text-white">Registrarse como médico</Link>
              </li>
              <li>
                <Link to="/medicos/planes" className="text-gray-300 hover:text-white">Planes y precios</Link>
              </li>
              <li>
                <Link to="/medicos/recursos" className="text-gray-300 hover:text-white">Recursos</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/acerca" className="text-gray-300 hover:text-white">Sobre Nosotros</Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white">Contacto</Link>
              </li>
              <li>
                <Link to="/ayuda" className="text-gray-300 hover:text-white">Centro de Ayuda</Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-gray-300 hover:text-white">Privacidad</Link>
              </li>
              <li>
                <Link to="/terminos" className="text-gray-300 hover:text-white">Términos</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} Doctor.mx – Tu salud en un solo lugar
          </p>
          <div className="flex space-x-6">
            <Link to="/terminos" className="text-sm text-gray-400 hover:text-white">
              Términos y condiciones
            </Link>
            <Link to="/privacidad" className="text-sm text-gray-400 hover:text-white">
              Política de privacidad
            </Link>
            <Link to="/ayuda" className="text-sm text-gray-400 hover:text-white">
              Centro de ayuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;