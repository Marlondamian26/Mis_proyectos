import React from 'react';
import { FaCheck, FaUserMd, FaClock, FaHeart, FaAward } from 'react-icons/fa';
import { DOCTOR_NAME, DOCTOR_TITLE, CONFIG } from '../config/constants';

function SobreNosotros() {
  const features = [
    { icon: FaUserMd, text: 'Profesionales altamente cualificados' },
    { icon: FaClock, text: 'Atención personalizada y sin prisas' },
    { icon: FaHeart, text: 'Cuidado humano y empático' },
    { icon: FaAward, text: 'Estándares de calidad certificados' }
  ];

  return (
    <section className="promo-sobre" id="sobre-nosotros">
      <div className="promo-sobre-content">
        <div className="promo-sobre-image">
          <div className="promo-sobre-image-card">
            <div className="promo-sobre-stats">
              <div className="promo-stat-item">
                <div className="promo-stat-number">+5</div>
                <div className="promo-stat-label">Años de experiencia</div>
              </div>
              <div className="promo-stat-item">
                <div className="promo-stat-number">+2000</div>
                <div className="promo-stat-label">Pacientes atendidos</div>
              </div>
              <div className="promo-stat-item">
                <div className="promo-stat-number">98%</div>
                <div className="promo-stat-label">Satisfacción</div>
              </div>
              <div className="promo-stat-item">
                <div className="promo-stat-number">24/7</div>
                <div className="promo-stat-label">Atención de emergencias</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="promo-sobre-text">
          <span className="promo-section-label">Sobre Nosotros</span>
          <h2>Comprometidos con tu Salud y Bienestar</h2>
          <p>
            Desde nuestra fundación, nos hemos dedicado a proporcionar atención médica 
            de excelencia a la comunidad de Benfica, Luanda. Our mission is to provide 
            comprehensive, humane and personalized medical care to each patient.
          </p>
          <p>
            {DOCTOR_NAME} ({DOCTOR_TITLE}) lidera nuestro equipo con una visión clara: 
            ofrecer atención médica accesible, de calidad y centrada en el paciente. Our equipe está 
            comprometida con tu bienestar integral.
          </p>
          
          <div className="promo-sobre-features">
            {features.map((feature, index) => (
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