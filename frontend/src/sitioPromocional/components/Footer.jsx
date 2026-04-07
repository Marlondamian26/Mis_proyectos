import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaStethoscope, FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE, CLINIC_EMAIL, PLATFORM_URL, REGISTRO_URL } from '../config/constants';

function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  const formatWhatsApp = (phone) => {
    return phone.replace(/\s/g, '');
  };

  const t = (key) => {
    const translations = {
      pt: {
        footerDescription: 'Consultorio medico da Dra. Belkis Morejon Acosta. Comprometidos com a sua saude e bem-estar em Benfica, Luanda.',
        quickLinks: { inicio: 'Inicio', servicos: 'Servicos', sobreNos: 'Sobre Nos', contacto: 'Contacto' },
        services: { consulta: 'Consulta Medica', cardiologia: 'Cardiologia', emergencias: 'Emergencias', vacinacao: 'Vacinacao', analisis: 'Analises Clinicas' },
        navLogin: 'Entrar',
        navRegister: 'Registrar'
      },
      es: {
        footerDescription: 'Consultorio medico de la Dra. Belkis Morejon Acosta. Comprometidos con tu salud y bienestar en Benfica, Luanda.',
        quickLinks: { inicio: 'Inicio', servicos: 'Servicios', sobreNos: 'Sobre Nosotros', contacto: 'Contacto' },
        services: { consulta: 'Consulta Medica', cardiologia: 'Cardiologia', emergencias: 'Emergencias', vacinacion: 'Vacunacion', analisis: 'Analisis Clinicos' },
        navLogin: 'Iniciar Sesion',
        navRegister: 'Registrarse'
      },
      en: {
        footerDescription: 'Medical office of Dr. Belkis Morejon Acosta. Committed to your health and well-being in Benfica, Luanda.',
        quickLinks: { inicio: 'Home', servicos: 'Services', sobreNos: 'About Us', contacto: 'Contact' },
        services: { consulta: 'Medical Consultation', cardiologia: 'Cardiology', emergencies: 'Emergencies', vacinacion: 'Vaccination', analisis: 'Clinical Analysis' },
        navLogin: 'Login',
        navRegister: 'Register'
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  const footerDesc = t('footerDescription');
  const ql = t('quickLinks');
  const svc = t('services');

  return (
    <footer className="promo-footer">
      <div className="promo-footer-content">
        <div className="promo-footer-brand">
          <h3>
            <FaStethoscope style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
            {CLINIC_NAME}
          </h3>
          <p>
            {footerDesc}
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
          <h4>Enlaces Rapidos</h4>
          <div className="promo-footer-links">
            <Link to={PLATFORM_URL}>
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              {t('navLogin')}
            </Link>
            <Link to={REGISTRO_URL}>
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              {t('navRegister')}
            </Link>
            <a href="#servicios">
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              {ql.servicos}
            </a>
            <a href="#contacto">
              <FaArrowRight style={{ marginRight: '0.5rem', fontSize: '0.75rem' }} />
              {ql.contacto}
            </a>
          </div>
        </div>
        
        <div className="promo-footer-section">
          <h4>Servicios</h4>
          <div className="promo-footer-links">
            <a href="#servicios">{svc.consulta}</a>
            <a href="#servicios">{svc.cardiologia}</a>
            <a href="#servicios">{svc.emergencias}</a>
            <a href="#servicios">{svc.vacinacion}</a>
            <a href="#servicios">{svc.analisis}</a>
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