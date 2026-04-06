import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaStethoscope, FaArrowRight } from 'react-icons/fa';
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE, CLINIC_EMAIL, PLATFORM_URL, REGISTRO_URL } from '../config/constants';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const formatWhatsApp = (phone) => {
    return phone.replace(/\s/g, '');
  };

  return (
    <footer className="promo-footer">
      <div className="promo-footer-content">
        <div className="promo-footer-brand">
          <h3>
            <FaStethoscope style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
            {CLINIC_NAME}
          </h3>
          <p>
            Tu salud es nuestra prioridad. Estamos comprometidos a proporcionarte 
            la mejor atención médica con professionalism y humanidad.
          </p>
          <div className="promo-footer-social">
            <a href="#" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href={`https://wa.me/${formatWhatsApp(CLINIC_PHONE)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>
        
        <div className="promo-footer-section">
          <h4>Enlaces Rápidos</h4>
          <div className="promo-footer-links">
            <Link to={PLATFORM_URL}>
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              Iniciar Sesión
            </Link>
            <Link to={REGISTRO_URL}>
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              Registrarse
            </Link>
            <a href="#servicios">
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              Servicios
            </a>
            <a href="#contacto">
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              Contacto
            </a>
          </div>
        </div>
        
        <div className="promo-footer-section">
          <h4>Servicios</h4>
          <div className="promo-footer-links">
            <a href="#servicios">Consultas Médicas</a>
            <a href="#servicios">Control de Salud</a>
            <a href="#servicios">Emergencias</a>
            <a href="#servicios">Vacunación</a>
          </div>
        </div>
        
        <div className="promo-footer-section">
          <h4>Contacto</h4>
          <div className="promo-footer-links">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{CLINIC_ADDRESS}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{CLINIC_PHONE}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{CLINIC_EMAIL}</p>
          </div>
        </div>
      </div>
      
      <div className="promo-footer-bottom">
        <p>© {currentYear} {CLINIC_NAME}. Todos los derechos reservados.</p>
        <p style={{ marginTop: '0.5rem' }}>
          Designed with care for your health
        </p>
      </div>
    </footer>
  );
}

export default Footer;