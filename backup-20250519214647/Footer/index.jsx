import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin } from '../icons/IconProvider';
import { SocialIcons } from '../icons/IconProvider';
import './styles.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/Doctorlogo.png" alt="Doctor.mx Logo" className="logo-image" />
              <h3 className="logo-text">Doctor.mx</h3>
            </div>
            <p className="footer-description">
              La plataforma líder en México para encontrar médicos, agendar citas y recibir atención médica en línea.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-link">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="social-link">
                <SocialIcons.Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="social-link">
                <SocialIcons.Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="section-title">Servicios</h3>
            <ul className="footer-links">
              <li>
                <Link to="/buscar" className="footer-link">Buscar médicos</Link>
              </li>
              <li>
                <Link to="/sintomas/" className="footer-link">Evaluación de Síntomas</Link>
              </li>
              <li>
                <Link to="/telemedicina" className="footer-link">Telemedicina</Link>
              </li>
              <li>
                <Link to="/alternativa" className="footer-link">Medicina Alternativa</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="section-title">Comunidad</h3>
            <ul className="footer-links">
              <li>
                <Link to="/comunidad/preguntas" className="footer-link">Preguntas Médicas</Link>
              </li>
              <li>
                <Link to="/doctor-board" className="footer-link">Junta Médica</Link>
              </li>
              <li>
                <Link to="/blog" className="footer-link">Blog de Salud</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="section-title">Para Médicos</h3>
            <ul className="footer-links">
              <li>
                <Link to="/medicos/registro" className="footer-link">Registrarse como médico</Link>
              </li>
              <li>
                <Link to="/medicos/planes" className="footer-link">Planes y precios</Link>
              </li>
              <li>
                <Link to="/medicos/recursos" className="footer-link">Recursos</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="section-title">Empresa</h3>
            <ul className="footer-links">
              <li>
                <Link to="/acerca" className="footer-link">Sobre Nosotros</Link>
              </li>
              <li>
                <Link to="/contacto" className="footer-link">Contacto</Link>
              </li>
              <li>
                <Link to="/ayuda" className="footer-link">Centro de Ayuda</Link>
              </li>
              <li>
                <Link to="/privacidad" className="footer-link">Privacidad</Link>
              </li>
              <li>
                <Link to="/terminos" className="footer-link">Términos</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Doctor.mx – Tu salud en un solo lugar
          </p>
          
          <div className="official-seal">
            <div className="seal-content">
              <h4 className="seal-title">Sello Oficial</h4>
              <p className="seal-text">Orgullosamente respaldado por nuestro patrocinador oficial de seguros:</p>
              <p className="seal-sponsor">Daniel Faudeo &amp; Co</p>
              <p className="seal-location">Centro de Chihuahua</p>
            </div>
          </div>
          
          <div className="legal-links">
            <Link to="/terminos" className="legal-link">
              Términos y condiciones
            </Link>
            <Link to="/privacidad" className="legal-link">
              Política de privacidad
            </Link>
            <Link to="/ayuda" className="legal-link">
              Centro de ayuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
