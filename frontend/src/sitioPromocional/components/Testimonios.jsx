import React from 'react';
import { FaStar } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { CONFIG } from '../config/constants';

function Testimonios() {
  const { language } = useLanguage();
  const testimonials = CONFIG.testimonials || [];

  const t = (key) => {
    const translations = {
      pt: {
        sectionLabel: 'Testimonials',
        title: 'O que nossos pacientes dizem',
        subtitle: 'A satisfacao e bem-estar de nossos pacientes e nossa melhor recompensa.',
        testimonialList: [
          { name: 'Maria Garcia', text: 'Excelente atencao. A Dra. Belkis e muito profissional e dedicada. Sempre me sinto bem atendida em cada consulta.' },
          { name: 'Joao Pedro', text: 'Muito bom servico. O consultorio esta bem equipado e o pessoal e muito amavel. Recomendado.' },
          { name: 'Ana Cristina', text: 'A Dra. Morejon e uma excelente medica. Ajudou-me muito com o meu tratamento. Obrigado pela sua dedicacao.' }
        ]
      },
      es: {
        sectionLabel: 'Testimonios',
        title: 'Lo que dicen nuestros pacientes',
        subtitle: 'La satisfaccion y bienestar de nuestros pacientes es nuestro mejor recompensa.',
        testimonialList: [
          { name: 'Maria Garcia', text: 'Excelente atencion. La Dra. Belkis es muy profesional y dedicada. Siempre me siento bien atendida en cada consulta.' },
          { name: 'Joao Pedro', text: 'Muy buen servicio. El consultorio esta bien equipado y el personal es muy amable. Recomendado.' },
          { name: 'Ana Cristina', text: 'La Dra. Morejon es una excelente medica. Me ha ayudado mucho con mi tratamiento. Gracias por su dedicacion.' }
        ]
      },
      en: {
        sectionLabel: 'Testimonials',
        title: 'What our patients say',
        subtitle: 'The satisfaction and well-being of our patients is our best reward.',
        testimonialList: [
          { name: 'Maria Garcia', text: 'Excellent care. Dr. Belkis is very professional and dedicated. I always feel well attended at each consultation.' },
          { name: 'Joao Pedro', text: 'Very good service. The clinic is well equipped and the staff is very friendly. Recommended.' },
          { name: 'Ana Cristina', text: 'Dr. Morejon is an excellent doctor. She has helped me a lot with my treatment. Thank you for your dedication.' }
        ]
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  const testimonialList = t('testimonialList');

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="promo-testimonios" id="testimonios">
      <div className="promo-section-header">
        <span className="promo-section-label">{t('sectionLabel')}</span>
        <h2 className="promo-section-title">{t('title')}</h2>
        <p className="promo-section-subtitle">
          {t('subtitle')}
        </p>
      </div>
      
      <div className="promo-testimonios-grid">
        {testimonials.map((testimonio, index) => {
          const transTest = testimonialList[index] || testimonio;
          return (
            <div key={testimonio.id} className="promo-testimonio-card">
              <div className="promo-testimonio-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="promo-testimonio-star" />
                ))}
              </div>
              <p className="promo-testimonio-text">"{transTest.text}"</p>
              <div className="promo-testimonio-author">
                <div className="promo-testimonio-avatar">
                  {getInitials(transTest.name)}
                </div>
                <div>
                  <div className="promo-testimonio-name">{transTest.name}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Testimonios;