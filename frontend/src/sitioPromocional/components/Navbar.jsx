import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaUser, FaNotesMedical, FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_WHATSAPP, PLATFORM_URL } from '../config/constants';

function Navbar() {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'pt', name: 'PT' },
    { code: 'es', name: 'ES' },
    { code: 'en', name: 'EN' }
  ];

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${CLINIC_WHATSAPP.replace(/\s/g, '')}`, '_blank');
  };

  const t = (key) => {
    const translations = {
      pt: { navInicio: 'Inicio', navServicos: 'Servicos', navSobreNos: 'Sobre Nos', navContacto: 'Contacto', navWhatsApp: 'WhatsApp', navLogin: 'Entrar' },
      es: { navInicio: 'Inicio', navServicos: 'Servicios', navSobreNos: 'Sobre Nosotros', navContacto: 'Contacto', navWhatsApp: 'WhatsApp', navLogin: 'Iniciar Sesion' },
      en: { navInicio: 'Home', navServicos: 'Services', navSobreNos: 'About Us', navContacto: 'Contact', navWhatsApp: 'WhatsApp', navLogin: 'Login' }
    };
    return translations[language]?.[key] || translations.pt[key] || key;
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
          <li><a href="#inicio">{t('navInicio')}</a></li>
          <li><a href="#servicios">{t('navServicos')}</a></li>
          <li><a href="#sobre-nosotros">{t('navSobreNos')}</a></li>
          <li><a href="#contacto">{t('navContacto')}</a></li>
        </ul>

        <div className="promo-navbar-actions">
          <button className="promo-btn promo-btn-secondary" onClick={handleWhatsApp}>
            <FaPhone />
            {t('navWhatsApp')}
          </button>
          <Link to={PLATFORM_URL} className="promo-btn promo-navbar-cta">
            {t('navLogin')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;