import React from 'react';
import { FaCheck, FaUserMd, FaClock, FaHeart, FaAward } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { DOCTOR_NAME, DOCTOR_TITLE, CONFIG } from '../config/constants';

function SobreNosotros() {
  const { language } = useLanguage();

  const t = (key) => {
    const translations = {
      pt: {
        sectionLabel: 'Sobre Nos',
        title: 'Comprometidos com a sua Saude e Bem-estar',
        description: 'Desde a nossa fundacao, dedicamo-nos a fornecer atencao medica de excelencia à comunidade de Benfica, Luanda. A nossa missao e fornecer atencao medica integral, humana e personalizada a cada paciente.',
        doctorDescription: 'A Dra. Belkis Morejon Acosta lidera a nossa equipe com uma visao clara: oferecer atencao medica acessivel, de qualidade e centrada no paciente. A nossa equipe esta comprometida com o seu bem-estar integral.',
        stats: { years: 'Anos', patients: 'Pacientes', satisfaction: 'Satisfacao', emergency: 'Emergencias' },
        features: [
          { text: 'Profissionais altamente qualificados' },
          { text: 'Atencao personalizada e sem pressas' },
          { text: 'Cuidado humano e empatico' },
          { text: 'Padroes de qualidade certificados' }
        ]
      },
      es: {
        sectionLabel: 'Sobre Nosotros',
        title: 'Comprometidos con tu Salud y Bienestar',
        description: 'Desde nuestra fundacion, nos hemos dedicado a proporcionar atencion medica de excelencia a la comunidad de Benfica, Luanda. Nuestra mision es proporcionar atencion medica integral, humana y personalizada a cada paciente.',
        doctorDescription: 'La Dra. Belkis Morejon Acosta lidera nuestro equipo con una vision clara: ofrecer atencion medica accesible, de calidad y centrada en el paciente. Nuestro equipo esta comprometido con tu bienestar integral.',
        stats: { years: 'Anos', patients: 'Pacientes', satisfaction: 'Satisfaccion', emergency: 'Emergencias' },
        features: [
          { text: 'Profesionales altamente cualificados' },
          { text: 'Atencion personalizada y sin prisas' },
          { text: 'Cuidado humano y empatico' },
          { text: 'Estandares de calidad certificados' }
        ]
      },
      en: {
        sectionLabel: 'About Us',
        title: 'Committed to your Health and Well-being',
        description: 'Since our foundation, we have been dedicated to providing excellent medical care to the community of Benfica, Luanda. Our mission is to provide comprehensive, human and personalized medical care to each patient.',
        doctorDescription: 'Dr. Belkis Morejon Acosta leads our team with a clear vision: to offer accessible, quality medical care focused on the patient. Our team is committed to your integral well-being.',
        stats: { years: 'Years', patients: 'Patients', satisfaction: 'Satisfaction', emergency: 'Emergencies' },
        features: [
          { text: 'Highly qualified professionals' },
          { text: 'Personalized care without rushing' },
          { text: 'Human and empathetic care' },
          { text: 'Certified quality standards' }
        ]
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  const trans = t('features');
  const stats = t('stats');

  return (
    <section className="promo-sobre" id="sobre-nosotros">
      <div className="promo-sobre-content">
        <div className="promo-sobre-image">
          <div className="promo-sobre-image-card">
            <div className="promo-sobre-stats">
              <div className="promo-stat-item">
                <div className="promo-stat-number">+5</div>
                <div className="promo-stat-label">{stats.years} de experiencia</div>
              </div>
              <div className="promo-stat-item">
                <div className="promo-stat-number">+2000</div>
                <div className="promo-stat-label">{stats.patients} atendidos</div>
              </div>
              <div className="promo-stat-item">
                <div className="promo-stat-number">98%</div>
                <div className="promo-stat-label">{stats.satisfaction}</div>
              </div>
              <div className="promo-stat-item">
                <div className="promo-stat-number">24/7</div>
                <div className="promo-stat-label">{stats.emergency}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="promo-sobre-text">
          <span className="promo-section-label">{t('sectionLabel')}</span>
          <h2>{t('title')}</h2>
          <p>
            {t('description')}
          </p>
          <p>
            {t('doctorDescription')}
          </p>
          
          <div className="promo-sobre-features">
            {trans.map((feature, index) => (
              <div key={index} className="promo-sobre-feature">
                <div className="promo-sobre-feature-icon">
                  <FaCheck />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SobreNosotros;