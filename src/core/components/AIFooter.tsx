import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

function AIFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src="/Doctorlogo.png" alt="DoctorMX" className="h-8 w-auto mr-3" />
              <span className="text-xl font-bold">DoctorMX</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Tu plataforma de telemedicina confiable. Conectando pacientes con doctores certificados las 24 horas del día.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/526144792338"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] p-2 rounded-full hover:bg-[#20BA5A] transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#006D77]">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/doctor" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Consulta Virtual
                </Link>
              </li>
              <li>
                <Link to="/image-analysis" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Análisis de Imágenes
                </Link>
              </li>
              <li>
                <Link to="/lab-testing" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Exámenes a Domicilio
                </Link>
              </li>
              <li>
                <Link to="/connect" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Únete como Doctor
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#006D77]">Legal y Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-300 hover:text-[#006D77] transition-colors text-sm">
                  Centro de Ayuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#006D77]">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-[#006D77] mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p>Ciudad de México</p>
                  <p>Polanco, CDMX</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-[#006D77] mr-2 flex-shrink-0" />
                <a 
                  href="tel:+526144792338" 
                  className="text-gray-300 hover:text-[#006D77] text-sm transition-colors"
                >
                  +52 614 479 2338
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-[#006D77] mr-2 flex-shrink-0" />
                <a 
                  href="mailto:contacto@doctormx.com" 
                  className="text-gray-300 hover:text-[#006D77] text-sm transition-colors"
                >
                  contacto@doctormx.com
                </a>
              </div>
              <div className="flex items-start">
                <Clock className="w-4 h-4 text-[#006D77] mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p>Lun - Dom</p>
                  <p>24/7 Disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} DoctorMX. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Plataforma médica certificada por COFEPRIS
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-xs">Síguenos:</span>
              <div className="flex space-x-2">
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-[#006D77] transition-colors"
                  aria-label="Facebook"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-[#006D77] transition-colors"
                  aria-label="Twitter"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AIFooter;
