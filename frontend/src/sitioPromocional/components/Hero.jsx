import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaHeart, FaMapMarkerAlt, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_NAME, DOCTOR_SPECIALTY, CLINIC_LOCATION, CLINIC_PHONE, PLATFORM_URL, REGISTRO_URL } from '../config/constants';

function Hero() {
  const { language } = useLanguage();

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${CLINIC_PHONE.replace(/\s/g, '')}`, '_blank');
  };

  const t = (key) => {
    const translations = {
      pt: {
        heroBadge: 'Atencao Medica de Qualidade',
        heroTitle: 'Cuidamos da sua saude com profissionalismo e dedicacao',
        heroSubtitle: 'Na nossa clinica encontrara uma atencao medica integral, personalizada e humana. O seu bem-estar e o da sua familia sao a nossa maxima prioridade.',
        heroLogin: 'Entrar',
        heroRegister: 'Registrar',
        heroWhatsApp: 'WhatsApp'
      },
      es: {
        heroBadge: 'Atencion Medica de Calidad',
        heroTitle: 'Cuidamos de tu salud con profesionalismo y dedicacion',
        heroSubtitle: 'En nuestra clinica encontraras una atencion medica integral, personalizada y humana. Tu bienestar y el de tu familia son nuestra maxima prioridad.',
        heroLogin: 'Iniciar Sesion',
        heroRegister: 'Registrarse',
        heroWhatsApp: 'WhatsApp'
      },
      en: {
        heroBadge: 'Quality Medical Care',
        heroTitle: 'We take care of your health with professionalism and dedication',
        heroSubtitle: 'At our clinic you will find comprehensive, personalized and human medical care. Your well-being and that of your family are our top priority.',
        heroLogin: 'Login',
        heroRegister: 'Register',
        heroWhatsApp: 'WhatsApp'
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  return (
    <section className="promo-hero">
      <div className="promo-hero-content">
        <div className="promo-hero-text">
          <div className="promo-hero-badge">
            <span>{t('heroBadge')}</span>
          </div>
          
          <h1>
            {t('heroTitle')}
          </h1>
          
          <p className="promo-hero-subtitle">
            {t('heroSubtitle')}
          </p>
          
          <div className="promo-hero-buttons">
            <Link to={PLATFORM_URL} className="promo-btn promo-btn-primary">
              <FaStethoscope />
              {t('heroLogin')}
            </Link>
            <Link to={REGISTRO_URL} className="promo-btn promo-btn-secondary">
              <FaArrowRight />
              {t('heroRegister')}
            </Link>
            <button className="promo-btn promo-btn-secondary" onClick={handleWhatsApp}>
              <FaWhatsapp />
              {t('heroWhatsApp')}
            </button>
          </div>
        </div>
        
        <div className="promo-hero-image">
          <div className="promo-hero-card">
            <div className="promo-hero-doctor">
              <div className="promo-doctor-avatar">
                <FaStethoscope />
              </div>
              <div className="promo-doctor-info">
                <h3>{DOCTOR_NAME}</h3>
                <p className="promo-doctor-specialty">{DOCTOR_SPECIALTY}</p>
                <p className="promo-doctor-location">
                  <FaMapMarkerAlt />
                  {CLINIC_LOCATION}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;