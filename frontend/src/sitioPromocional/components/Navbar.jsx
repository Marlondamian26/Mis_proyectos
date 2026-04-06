import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaUser, FaNotesMedical, FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_WHATSAPP, PLATFORM_URL } from '../config/constants';

function Navbar() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${CLINIC_WHATSAPP.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <nav className="promo-navbar">
      <div className="promo-navbar-container">
        <Link to="/" className="promo-navbar-logo">
          <div className="promo-navbar-logo-icon">
            <FaStethoscope />
          </div>
          <span className="promo-navbar-logo-text">{CLINIC_NAME}</span>
        </Link>

        <ul className="promo-navbar-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#sobre-nosotros">Sobre Nosotros</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>

        <div className="promo-navbar-actions">
          <button className="promo-btn promo-btn-secondary" onClick={handleWhatsApp}>
            <FaPhone />
            WhatsApp
          </button>
          <Link to={PLATFORM_URL} className="promo-btn promo-navbar-cta">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;