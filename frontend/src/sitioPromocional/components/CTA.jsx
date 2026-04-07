import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaUserPlus, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { PLATFORM_URL, REGISTRO_URL, CLINIC_PHONE } from '../config/constants';

function CTA() {
  const { language } = useLanguage();

  const t = (key) => {
    const translations = {
      pt: {
        title: 'Pronto para cuidar da sua saude?',
        subtitle: 'Registre-se na nossa plataforma para agendar as suas consultas, acessar o seu historico medico e muito mais. E rapido e facil.',
        register: 'Registrar Agora',
        login: 'Entrar',
        whatsapp: 'Chatear no WhatsApp'
      },
      es: {
        title: 'Listo para cuidar de tu salud?',
        subtitle: 'Registrate en nuestra plataforma para agendar tus citas, acceder a tu historial medico y mucho mas. Es rapido y facil.',
        register: 'Registrarse Ahora',
        login: 'Iniciar Sesion',
        whatsapp: 'Chatear en WhatsApp'
      },
      en: {
        title: 'Ready to take care of your health?',
        subtitle: 'Register on our platform to schedule your appointments, access your medical history and much more. It is fast and easy.',
        register: 'Register Now',
        login: 'Login',
        whatsapp: 'Chat on WhatsApp'
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${CLINIC_PHONE.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <section className="promo-cta">
      <div className="promo-cta-content">
        <h2>{t('title')}</h2>
        <p>
          {t('subtitle')}
        </p>
        
        <div className="promo-cta-buttons">
          <Link to={REGISTRO_URL} className="promo-btn promo-btn-primary">
            <FaUserPlus />
            {t('register')}
          </Link>
          <Link to={PLATFORM_URL} className="promo-btn promo-btn-secondary">
            <FaCalendarCheck />
            {t('login')}
          </Link>
          <button className="promo-btn promo-btn-secondary" onClick={handleWhatsApp}>
            <FaWhatsapp />
            {t('whatsapp')}
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA;