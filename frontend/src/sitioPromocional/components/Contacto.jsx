import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { CONFIG } from '../config/constants';

function Contacto() {
  const { language } = useLanguage();
  const contactInfo = CONFIG.contact;

  const t = (key) => {
    const translations = {
      pt: {
        sectionLabel: 'Contacto',
        subtitle: 'Estamos prontos para atender. Pode visitar-nos, ligar-nos ou escrever-nos.',
        address: 'Endereco',
        phone: 'Telefone',
        email: 'Email',
        hours: 'Horario',
        hoursValue: 'Segunda a Sexta: 8:00 - 18:00'
      },
      es: {
        sectionLabel: 'Contacto',
        subtitle: 'Estamos listos para atenderte. Puedes visitarnos, llamarnos o escribirnos.',
        address: 'Direccion',
        phone: 'Telefono',
        email: 'Email',
        hours: 'Horario',
        hoursValue: 'Lunes a Viernes: 8:00 - 18:00'
      },
      en: {
        sectionLabel: 'Contact',
        subtitle: 'We are ready to assist you. You can visit us, call us or write to us.',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        hours: 'Hours',
        hoursValue: 'Monday to Friday: 8:00 - 18:00'
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  return (
    <section className="promo-contacto" id="contacto">
      <div className="promo-section-header">
        <span className="promo-section-label">{t('sectionLabel')}</span>
        <h2 className="promo-section-title">Estamos listos para atenderte</h2>
        <p className="promo-section-subtitle">
          {t('subtitle')}
        </p>
      </div>

      <div className="promo-contacto-grid">
        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaMapMarkerAlt />
          </div>
          <h3>{t('address')}</h3>
          <p>{contactInfo.address}</p>
        </div>

        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaPhone />
          </div>
          <h3>{t('phone')}</h3>
          <p>{contactInfo.phone}</p>
        </div>

        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaEnvelope />
          </div>
          <h3>{t('email')}</h3>
          <p>{contactInfo.email}</p>
        </div>

        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaClock />
          </div>
          <h3>{t('hours')}</h3>
          <p>{t('hoursValue')}</p>
        </div>
      </div>
    </section>
  );
}

export default Contacto;